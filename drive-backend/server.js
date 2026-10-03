import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import { readFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Uploads directory configuration
const uploadsDir = join(__dirname, "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.includes(".")
      ? file.originalname.slice(file.originalname.lastIndexOf("."))
      : "";
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function getCredentials() {
  const saPath = join(__dirname, "service-account.json");
  if (existsSync(saPath)) {
    return JSON.parse(readFileSync(saPath, "utf8"));
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  }
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.split("\\n").join("\n");
  return {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
  };
}

// Initialize Firebase Admin
let adminApp;
try {
  const credentials = getCredentials();
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(credentials),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://studyshelf-5f944-default-rtdb.firebaseio.com",
    });
  } else {
    adminApp = getApps()[0];
  }
} catch (e) {
  console.error("Firebase admin init warning:", e.message);
}

const adminAuth = adminApp ? getAuth(adminApp) : null;
const adminDb = adminApp ? getDatabase(adminApp) : null;

function getAuthClient() {
  const credentials = getCredentials();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

// Drive Status Check
app.get("/drive-status", (req, res) => {
  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv";
  res.json({
    connected: Boolean(gasUrl && gasUrl.trim().startsWith("http")),
    folderId,
    gasUrlConfigured: Boolean(gasUrl),
    mode: gasUrl ? "google_drive" : "local_storage"
  });
});

// Configure Google Apps Script URL dynamically
app.post("/set-drive-url", (req, res) => {
  try {
    const { gasUrl } = req.body;
    if (!gasUrl || !gasUrl.startsWith("http")) {
      return res.status(400).json({ success: false, error: "Valid http/https URL required" });
    }
    process.env.GOOGLE_APPS_SCRIPT_URL = gasUrl.trim();
    
    // Also save to .env
    const envPath = join(__dirname, ".env");
    let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
    if (envContent.includes("GOOGLE_APPS_SCRIPT_URL=")) {
      envContent = envContent.replace(/GOOGLE_APPS_SCRIPT_URL=.*/g, `GOOGLE_APPS_SCRIPT_URL="${gasUrl.trim()}"`);
    } else {
      envContent += `\nGOOGLE_APPS_SCRIPT_URL="${gasUrl.trim()}"\n`;
    }
    import("fs").then(fs => fs.writeFileSync(envPath, envContent, "utf8"));

    console.log(`[Config] Google Apps Script URL updated: ${gasUrl}`);
    res.json({ success: true, message: "Drive URL configured successfully", mode: "google_drive" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload Endpoint for Files
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv";

    // 1. If Google Apps Script Web App URL is configured, upload directly to Google Drive
    if (gasUrl && gasUrl.trim().startsWith("http")) {
      try {
        console.log(`[Upload] Sending file to Google Drive (${req.file.originalname}, ${req.file.size} bytes)...`);
        
        const fileBase64 = readFileSync(req.file.path, { encoding: "base64" });
        const payload = {
          action: "upload",
          fileName: req.file.originalname,
          mimeType: req.file.mimetype || "application/octet-stream",
          base64: fileBase64,
          folderId: folderId
        };

        const response = await fetch(gasUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          redirect: "follow",
        });

        const result = await response.json();
        console.log("[Upload] Google Drive response:", result);

        // Remove temp disk file
        if (existsSync(req.file.path)) {
          try { unlinkSync(req.file.path); } catch (e) {}
        }

        if (result && result.success && result.webViewLink) {
          return res.json({
            success: true,
            webViewLink: result.webViewLink,
            fileId: result.fileId,
            name: result.name || req.file.originalname,
            size: result.size || req.file.size,
            storage: "google_drive"
          });
        } else {
          console.warn("[Upload] Apps Script returned error, falling back to local:", result);
        }
      } catch (gasErr) {
        console.error("[Upload] Error uploading via Apps Script:", gasErr.message);
      }
    }

    // 2. Fallback to local server storage
    const host = req.get("host") || `localhost:${PORT}`;
    const protocol = req.protocol || "http";
    const webViewLink = `${protocol}://${host}/uploads/${req.file.filename}`;

    console.log(`[Upload] File saved to backend storage: ${req.file.originalname} -> ${req.file.filename}`);

    res.json({
      success: true,
      webViewLink,
      fileId: req.file.filename,
      name: req.file.originalname,
      size: req.file.size,
      storage: "local"
    });
  } catch (err) {
    console.error("Error in /upload:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Token Endpoint for Drive Uploads (compatibility)
app.get("/get-token", async (req, res) => {
  try {
    const auth = getAuthClient();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();

    res.json({ accessToken: tokenResponse.token });
  } catch (error) {
    console.error("Error generating drive token:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Endpoint for Files
app.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "File ID is required" });
    }

    // Check if it's a local file in uploads/
    const localFilePath = join(uploadsDir, id);
    if (existsSync(localFilePath)) {
      unlinkSync(localFilePath);
      console.log(`[Delete] Local file removed: ${id}`);
      return res.json({ success: true, type: "local" });
    }

    // If Google Apps Script is active, request deletion from Drive
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (gasUrl && gasUrl.trim().startsWith("http")) {
      try {
        await fetch(gasUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", fileId: id }),
          redirect: "follow",
        });
        console.log(`[Delete] Google Drive file trashed: ${id}`);
      } catch (gasErr) {
        console.warn("Apps Script delete note:", gasErr.message);
      }
    }

    // Also attempt Google Drive API delete if applicable
    try {
      const auth = getAuthClient();
      const drive = google.drive({ version: "v3", auth });
      await drive.files.delete({ fileId: id, supportsAllDrives: true });
    } catch (driveErr) {}

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Student Endpoint
app.post("/create-student", async (req, res) => {
  try {
    const { firstName, lastName, rollNumber, email, password, semester, division } = req.body;
    if (!firstName || !lastName || !email || !password || !semester || !division) {
      return res.status(400).json({ success: false, error: "Missing required student details" });
    }

    if (!adminAuth || !adminDb) {
      return res.status(500).json({ success: false, error: "Firebase Admin is not configured on server" });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
      userRecord = await adminAuth.updateUser(userRecord.uid, {
        password,
        displayName: `${firstName} ${lastName}`,
      });
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true,
        });
      } else {
        throw e;
      }
    }

    const uid = userRecord.uid;
    const studentClass = `${semester}${division}`;
    const studentData = {
      id: uid,
      userId: uid,
      firstName,
      lastName,
      rollNumber: rollNumber || "",
      email,
      role: "student",
      class: studentClass,
      theme: "default",
      pfpLink: "https://ik.imagekit.io/yn9gz2n2g/Avatars/Male/m1.png",
      medalList: {
        gold: 0,
        silver: 0,
        bronze: 0,
      },
    };

    await adminDb.ref(`userData/${uid}`).set(studentData);
    res.json({ success: true, user: studentData });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete User Endpoint
app.post("/delete-user", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: "UID is required" });
    }

    if (adminAuth) {
      try {
        await adminAuth.deleteUser(uid);
      } catch (authErr) {
        console.warn("Auth deleteUser warning:", authErr.message);
      }
    }

    if (adminDb) {
      await adminDb.ref(`userData/${uid}`).remove();
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`StudyShelf Drive Backend running on port ${PORT}`);
});
