import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv";

    if (!gasUrl || !gasUrl.trim().startsWith("http")) {
      return res.status(400).json({
        success: false,
        error: "Google Apps Script URL is not configured in GOOGLE_APPS_SCRIPT_URL."
      });
    }

    const { fileName, mimeType, base64, path } = req.body || {};
    if (!fileName || !base64) {
      return res.status(400).json({ success: false, error: "fileName and base64 content are required." });
    }

    const payload = {
      action: "upload",
      fileName,
      mimeType: mimeType || "application/octet-stream",
      base64,
      folderId,
      path: path || ""
    };

    const response = await fetch(gasUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html") || !response.ok) {
      if (response.status === 403) {
        return res.status(403).json({
          success: false,
          error: `Google Apps Script permissions error (403 Forbidden). Set "Who has access" to "Anyone" in script.google.com deployment.`
        });
      }
      return res.status(500).json({
        success: false,
        error: `Google Apps Script returned HTTP ${response.status} (${contentType})`
      });
    }

    const result = await response.json();
    if (result && result.success && result.webViewLink) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json({ success: false, error: result?.error || "Apps script upload failed." });
    }
  } catch (error) {
    console.error("Error in upload serverless handler:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
