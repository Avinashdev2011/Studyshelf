export const BACKEND_URL = (
  import.meta.env.VITE_DRIVE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

export async function deleteDriveFile(attachmentId) {
  if (!attachmentId) return false;
  try {
    const res = await fetch(`${BACKEND_URL}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: attachmentId }),
    });

    const data = await res.json();
    console.log("Drive delete response:", data);

    if (!res.ok || data.success === false) {
      console.error(
        "Attachment deletion failed:",
        data.error || "Unknown error",
      );
      showErrorSection();
      return false;
    }

    return true;
  } catch (err) {
    showErrorSection("Error deleting attachment from Drive:", err);
    return false;
  }
}
async function ensureFolder(path, accessToken) {
  const parts = path.split("/").filter(Boolean); // split by "/" and remove empty
  let parentId = "root"; // start from root

  for (const name of parts) {
    // 1. Search if folder exists
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const searchData = await searchRes.json();

    let folderId;
    if (searchData.files && searchData.files.length > 0) {
      // Folder exists
      folderId = searchData.files[0].id;
    } else {
      // 2. Create folder
      const createRes = await fetch(
        "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId],
          }),
        },
      );
      const createData = await createRes.json();
      folderId = createData.id;
    }

    parentId = folderId; // go deeper
  }

  return parentId; // ID of the last folder
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
    showErrorSection("Error uploading file:", err);
    return null;
  }
}

