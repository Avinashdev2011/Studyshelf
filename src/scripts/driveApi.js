import { showErrorSection } from "./error.js";

export const BACKEND_URL = (
  import.meta.env.VITE_DRIVE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

function extractFileId(id) {
  if (!id || typeof id !== "string") return "";
  if (id === "custom-link") return "";
  if (id.includes("drive.google.com") || id.includes("http")) {
    const match = id.match(/\/d\/([a-zA-Z0-9_-]+)/) || id.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : id;
  }
  return id;
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
    console.log("Drive delete response:", data);

    if (!res.ok || data.success === false) {
      console.warn(
        "Attachment deletion note from Drive backend:",
        data?.error || "Drive file deletion notice",
      );
    }

    return true;
  } catch (err) {
    console.warn("Error deleting attachment from Drive backend:", err);
    return true; // Return true to allow DB item deletion to complete cleanly
  }
}

export async function uploadDriveFile(file, path) {
  if (!file) return null;

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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success && !data.webViewLink) {
      throw new Error(data.error || "Upload response invalid");
    }

    const origName = file?.name || data.name || "";
    const extMatch = origName.includes(".")
      ? origName.split(".").pop().toLowerCase()
      : "";

    return {
      webViewLink: data.webViewLink,
      fileId: data.fileId,
      name: origName,
      fileName: origName,
      fileType: extMatch,
      mimeType: file?.type || "",
      size: data.size || file?.size || 0,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    return null;
  }
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
