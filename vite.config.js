import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "StudyShelf",
        id: "app.studyshelf",
        scope: "/",
        start_url: "/",
        short_name: "StudyShelf",
        description: "StudyShelf Academic Portal PWA",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",

        icons: [
          {
            src: "android/android-launchericon-512-512.png",
            sizes: "512x512",
          },
          {
            src: "android/android-launchericon-192-192.png",
            sizes: "192x192",
          },
          {
            src: "android/android-launchericon-144-144.png",
            sizes: "144x144",
          },
          {
            src: "android/android-launchericon-96-96.png",
            sizes: "96x96",
          },
          {
            src: "android/android-launchericon-72-72.png",
            sizes: "72x72",
          },
          {
            src: "android/android-launchericon-48-48.png",
            sizes: "48x48",
          },
          {
            src: "ios/16.png",
            sizes: "16x16",
          },
          {
            src: "ios/20.png",
            sizes: "20x20",
          },
          {
            src: "ios/29.png",
            sizes: "29x29",
          },
          {
            src: "ios/32.png",
            sizes: "32x32",
          },
          {
            src: "ios/40.png",
            sizes: "40x40",
          },
          {
            src: "ios/50.png",
            sizes: "50x50",
          },
          {
            src: "ios/57.png",
            sizes: "57x57",
          },
          {
            src: "ios/58.png",
            sizes: "58x58",
          },
          {
            src: "ios/60.png",
            sizes: "60x60",
          },
          {
            src: "ios/64.png",
            sizes: "64x64",
          },
          {
            src: "ios/72.png",
            sizes: "72x72",
          },
          {
            src: "ios/76.png",
            sizes: "76x76",
          },
          {
            src: "ios/80.png",
            sizes: "80x80",
          },
          {
            src: "ios/87.png",
            sizes: "87x87",
          },
          {
            src: "ios/100.png",
            sizes: "100x100",
          },
          {
            src: "ios/114.png",
            sizes: "114x114",
          },
          {
            src: "ios/120.png",
            sizes: "120x120",
          },
          {
            src: "ios/128.png",
            sizes: "128x128",
          },
          {
            src: "ios/144.png",
            sizes: "144x144",
          },
          {
            src: "ios/152.png",
            sizes: "152x152",
          },
          {
            src: "ios/167.png",
            sizes: "167x167",
          },
          {
            src: "ios/180.png",
            sizes: "180x180",
          },
          {
            src: "ios/192.png",
            sizes: "192x192",
          },
          {
            src: "ios/256.png",
            sizes: "256x256",
          },
          {
            src: "ios/512.png",
            sizes: "512x512",
          },
          {
            src: "ios/1024.png",
            sizes: "1024x1024",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
      },
      swSrc: "public/firebase-messaging-sw.js",
    }),
  ],

  server: {
    allowedHosts: ["58gc7n6p-5173.inc1.devtunnels.ms"],
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
