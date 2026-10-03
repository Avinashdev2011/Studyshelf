# 🚀 StudyShelf Google Drive Backend Service

This backend microservice uses your `studyshelf-5f944` Google Service Account credentials to issue upload access tokens and delete files from Google Drive.

---

## 🛠️ Running Locally

1. Open terminal in `drive-backend` directory:
   ```bash
   cd drive-backend
   npm install
   npm start
   ```
2. The server runs on `http://localhost:3001`.
3. Test token generation:
   ```bash
   curl http://localhost:3001/get-token
   ```

---

## 🌐 Deploying to Vercel (1-Click)

1. Push or upload the `drive-backend` folder to your GitHub / Vercel account.
2. Create a new project on [Vercel](https://vercel.com/) and select the `drive-backend` repository.
3. In Vercel Project Settings ➜ **Environment Variables**, add:
   - `GOOGLE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@studyshelf-5f944.iam.gserviceaccount.com`
   - `GOOGLE_PRIVATE_KEY` = *(Copy full private key from your service-account.json file)*
4. Deploy! Copy your Vercel URL (e.g. `https://studyshelf-drive-backend.vercel.app`) and set it as `VITE_DRIVE_BACKEND_URL` in your main site's `.env`.
