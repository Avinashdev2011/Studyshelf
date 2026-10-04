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

    return {
      webViewLink: data.webViewLink,
      fileId: data.fileId,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    return null;
  }
}
