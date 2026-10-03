/**
 * Google Apps Script for StudyShelf Google Drive Uploads
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Go to https://script.google.com/
 * 2. Log in with your Google account (studyshelfofficial26@gmail.com)
 * 3. Click "+ New project"
 * 4. Paste ALL of this code into Code.gs (replacing everything there)
 * 5. Click "Deploy" (top right) -> "New deployment"
 * 6. Click the gear icon next to "Select type" -> choose "Web app"
 * 7. Set:
 *    - Description: StudyShelf Drive Uploader
 *    - Execute as: Me (studyshelfofficial26@gmail.com)
 *    - Who has access: Anyone
 * 8. Click "Deploy"
 * 9. Click "Authorize access" -> choose your account -> Advanced -> "Go to Untitled project (unsafe)" -> Allow
 * 10. Copy the "Web app URL" (it looks like: https://script.google.com/macros/s/.../exec)
 * 11. Put that URL into drive-backend/.env as GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
 */

const TARGET_FOLDER_ID = "13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "No post data received" });
    }

    const data = JSON.parse(e.postData.contents);

    // ACTION: DELETE FILE
    if (data.action === "delete") {
      if (!data.fileId) {
        return createJsonResponse({ success: false, error: "fileId is required" });
      }
      try {
        const file = DriveApp.getFileById(data.fileId);
        file.setTrashed(true);
        return createJsonResponse({ success: true, message: "File trashed" });
      } catch (err) {
        return createJsonResponse({ success: false, error: err.toString() });
      }
    }

    // ACTION: UPLOAD FILE
    const folderId = data.folderId || TARGET_FOLDER_ID;
    let targetFolder;
    try {
      targetFolder = DriveApp.getFolderById(folderId);
    } catch (fErr) {
      targetFolder = DriveApp.getRootFolder();
    }

    const fileName = data.fileName || "uploaded_file";
    const mimeType = data.mimeType || "application/octet-stream";
    const decodedBytes = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    const file = targetFolder.createFile(blob);

    // Make viewable to anyone with link
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (permErr) {
      // Already has folder sharing permissions
    }

    const fileId = file.getId();
    const webViewLink = "https://drive.google.com/file/d/" + fileId + "/view";

    return createJsonResponse({
      success: true,
      fileId: fileId,
      webViewLink: webViewLink,
      name: file.getName(),
      size: file.getSize()
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    folderId: TARGET_FOLDER_ID,
    message: "StudyShelf Google Drive Upload Service is running!"
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
