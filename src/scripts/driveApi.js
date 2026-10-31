import { showErrorSection } from "./error.js";

export const BACKEND_URL = (
  import.meta.env.VITE_DRIVE_BACKEND_URL || ""
).replace(/\/$/, "");

export const GAS_URL = (
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbx8ufRllvUk7M2X3EjAFSFPyrxeFy-gw2uhcOqIGipxI12OZulYWJpBR2qxMdwfsVTj/exec"
).trim();

function extractFileId(id) {
  if (!id || typeof id !== "string") return "";
  if (id === "custom-link") return "";
  if (id.includes("drive.google.com") || id.includes("http")) {
    const match = id.match(/\/d\/([a-zA-Z0-9_-]+)/) || id.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : id;
  }
  return id;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === "string" && result.includes(",")
        ? result.split(",")[1]
        : result;
      resolve(base64);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export async function deleteDriveFile(attachmentId) {
  const fileId = extractFileId(attachmentId);
  if (!fileId) return true;

  try {
    const res = await fetch(`${BACKEND_URL}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fileId }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success !== false) {
      return true;
    }
  } catch (err) {
    // If backend is unreachable, try direct Apps Script delete
    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: "POST",
          body: JSON.stringify({ action: "delete", fileId }),
          redirect: "follow",
        });
        return true;
      } catch (gasErr) {
        console.warn("GAS delete warning:", gasErr);
      }
    }
  }
  return true; // Return true to allow DB item deletion to complete cleanly
}

let _lastUploadError = null;
export function getLastUploadError() { return _lastUploadError; }

export async function uploadDriveFile(file, path) {
  _lastUploadError = null;
  if (!file) { _lastUploadError = "No file selected"; return null; }

  const origName = file?.name || "uploaded_file";
  const extMatch = origName.includes(".")
    ? origName.split(".").pop().toLowerCase()
    : "";

  // 1. Try local Drive backend first
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (path) {
      formData.append("path", path);
    }

    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.success || data.webViewLink)) {
        return {
          webViewLink: data.webViewLink,
          fileId: data.fileId,
          name: origName,
          fileName: origName,
          fileType: extMatch,
          mimeType: file?.type || "",
          size: data.size || file?.size || 0,
        };
      }
    }
  } catch (backendErr) {
    console.warn("Drive backend unreachable, attempting direct Google Drive upload fallback...", backendErr);
  }

  // 2. Direct Fallback: Google Apps Script Web App
  if (GAS_URL) {
    try {
      console.log(`[driveApi] Uploading ${origName} directly via Google Apps Script...`);
      const base64Data = await fileToBase64(file);
      const payload = {
        action: "upload",
        fileName: origName,
        mimeType: file.type || "application/octet-stream",
        base64: base64Data,
        path: path || "",
      };

      const response = await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Google Drive returned status ${response.status}`);
      }

      const gasData = await response.json();
      if (gasData && gasData.success && gasData.webViewLink) {
        return {
          webViewLink: gasData.webViewLink,
          fileId: gasData.fileId,
          name: gasData.name || origName,
          fileName: origName,
          fileType: extMatch,
          mimeType: file.type || "",
          size: gasData.size || file.size || 0,
        };
      } else {
        throw new Error(gasData?.error || "Google Drive upload failed");
      }
    } catch (gasErr) {
      console.error("[driveApi] Direct Drive upload fallback error:", gasErr);
      _lastUploadError = gasErr.message;
      return null;
    }
  }

  _lastUploadError = "Cannot reach Drive backend or Google Drive storage. Please try again.";
  return null;
}

/**
 * Resolves file icon, badge styling, badge label, and type for a given item
 */
export function getFileTypeDetails(item = {}) {
  const name = item.name || "";
  const fileName = item.fileName || "";
  const fileType = (item.fileType || "").toLowerCase();
  const link = (item.link || "").toLowerCase();
  const attachmentId = item.attachmentId || "";

  // 1. Determine file extension
  let ext = fileType.replace(/^\./, "");
  if (!ext && fileName.includes(".")) {
    ext = fileName.split(".").pop().toLowerCase();
  }
  if (!ext && name.includes(".")) {
    ext = name.split(".").pop().toLowerCase();
  }
  if (!ext && attachmentId && attachmentId !== "custom-link" && attachmentId.includes(".")) {
    ext = attachmentId.split(".").pop().toLowerCase();
  }

  // 2. Classify by extension or link clues
  if (
    ext === "pdf" ||
    link.includes(".pdf") ||
    (link.includes("pdf") && link.includes("drive.google.com"))
  ) {
    return {
      fileIcon: "fa-solid fa-file-pdf text-red-500",
      badgeBg: "bg-red-500/10 text-red-500 border border-red-500/20",
      badgeLabel: "PDF",
      type: "pdf",
    };
  }

  if (
    ["ppt", "pptx", "pps", "odp"].includes(ext) ||
    link.includes(".ppt") ||
    link.includes(".pptx") ||
    link.includes("docs.google.com/presentation")
  ) {
    return {
      fileIcon: "fa-solid fa-file-powerpoint text-orange-500",
      badgeBg: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      badgeLabel: "PPT",
      type: "ppt",
    };
  }

  if (
    ["doc", "docx", "odt", "rtf", "txt"].includes(ext) ||
    link.includes(".doc") ||
    link.includes(".docx") ||
    link.includes("docs.google.com/document")
  ) {
    return {
      fileIcon: "fa-solid fa-file-word text-blue-500",
      badgeBg: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      badgeLabel: "DOC",
      type: "doc",
    };
  }

  if (
    ["xls", "xlsx", "csv", "ods"].includes(ext) ||
    link.includes(".xls") ||
    link.includes(".xlsx") ||
    link.includes(".csv") ||
    link.includes("docs.google.com/spreadsheets")
  ) {
    return {
      fileIcon: "fa-solid fa-file-excel text-emerald-500",
      badgeBg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      badgeLabel: "XLS",
      type: "xls",
    };
  }

  if (
    ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico"].includes(ext) ||
    link.includes(".png") ||
    link.includes(".jpg") ||
    link.includes(".jpeg") ||
    link.includes(".webp")
  ) {
    return {
      fileIcon: "fa-solid fa-file-image text-purple-400",
      badgeBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      badgeLabel: "IMG",
      type: "img",
    };
  }

  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(ext) ||
    link.includes(".zip") ||
    link.includes(".rar")
  ) {
    return {
      fileIcon: "fa-solid fa-file-zipper text-yellow-500",
      badgeBg: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      badgeLabel: "ZIP",
      type: "zip",
    };
  }

  if (
    ["py", "js", "ts", "html", "css", "c", "cpp", "java", "json", "sql"].includes(ext)
  ) {
    return {
      fileIcon: "fa-solid fa-file-code text-cyan-400",
      badgeBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      badgeLabel: "CODE",
      type: "code",
    };
  }

  if (
    ["mp4", "mkv", "avi", "mov", "webm"].includes(ext) ||
    link.includes(".mp4") ||
    link.includes("youtube.com") ||
    link.includes("youtu.be")
  ) {
    return {
      fileIcon: "fa-solid fa-file-video text-rose-400",
      badgeBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      badgeLabel: "VIDEO",
      type: "video",
    };
  }

  if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext) || link.includes(".mp3")) {
    return {
      fileIcon: "fa-solid fa-file-audio text-amber-400",
      badgeBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      badgeLabel: "AUDIO",
      type: "audio",
    };
  }

  // 3. If file was uploaded to storage (attachmentId exists and is not custom-link)
  if (attachmentId && attachmentId !== "custom-link") {
    return {
      fileIcon: "fa-solid fa-file-lines text-primary",
      badgeBg: "bg-primary/10 text-primary border border-primary/20",
      badgeLabel: "FILE",
      type: "file",
    };
  }

  // 4. Default: External web link
  return {
    fileIcon: "fa-solid fa-link text-cyan-400",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    badgeLabel: "LINK",
    type: "link",
  };
}
