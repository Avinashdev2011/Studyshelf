# 🚀 StudyShelf Google Drive Backend Service

This microservice connects StudyShelf to Google Drive for uploading, organizing, and managing files across structured folders (`resources/`, `subjects/`, `personalFolders/`).

---

## 📂 How Drive Uploads Work

1. **Google Apps Script Integration**: Web App deployed under Google Account creates files in the target Google Drive folder (`13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv`).
2. **Subfolder Paths**: Files are placed inside specified subfolders (e.g. `subjects/maths/modules/m1` or `resources/globalData/notices`) rather than the root directory.
3. **Service Account Integration**: Service Account handles direct file deletion and access token generation.

---

## ⚙️ Google Apps Script Setup (Crucial)

If Drive uploads return HTTP 403 or fail:

1. Open [Google Apps Script](https://script.google.com/) signed in as `studyshelfofficial26@gmail.com`.
2. Open your project (or paste code from `drive-backend/google-apps-script.js` into `Code.gs`).
3. Click **Deploy** ➜ **Manage deployments** (or **New deployment**).
4. Select Type: **Web app**.
5. Set:
   - **Execute as**: `Me (studyshelfofficial26@gmail.com)`
   - **Who has access**: `Anyone` *(Must be set to "Anyone", NOT "Only myself")*
6. Click **Deploy** and **Authorize access**.
7. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
8. Paste the URL into `drive-backend/.env`:
   ```env
   GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
   ```

---

## 🛠️ Running Locally

1. Open terminal in `drive-backend` directory:
   ```bash
   cd drive-backend
   npm install
   npm start
   ```
2. Check backend & Drive connectivity:
   ```bash
   curl http://localhost:3001/drive-status
   ```

---

## 🌐 Deploying to Vercel

1. Push the `drive-backend` folder to your GitHub repository.
2. Create a new project on [Vercel](https://vercel.com/) for `drive-backend`.
3. In Vercel Project Settings ➜ **Environment Variables**, set:
   - `GOOGLE_APPS_SCRIPT_URL` = `https://script.google.com/macros/s/.../exec`
   - `GOOGLE_DRIVE_FOLDER_ID` = `13eP5SejpSKbD6z3bqGXB0rZYpdpm9JMv`
   - `GOOGLE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@studyshelf-5f944.iam.gserviceaccount.com`
   - `GOOGLE_PRIVATE_KEY` = *(Private key string)*
4. Deploy! Set your Vercel URL as `VITE_DRIVE_BACKEND_URL` in the main web app `.env`.
