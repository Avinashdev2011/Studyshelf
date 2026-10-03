import fs from "fs";
import { animationData } from "./lottieLoader.js";
import { themeOptions } from "./theme-options.js";

function hexToLottieColor(hex) {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  return [r, g, b];
}

function directColorReplace(obj, colorMap) {
  function traverse(current) {
    if (!current || typeof current !== "object") return;

    if (current.c && current.c.k && Array.isArray(current.c.k)) {
      const k = current.c.k;
      if (Array.isArray(k) && typeof k[0] === "number" && k.length >= 3) {
        const colorKey = `${k[0].toFixed(2)},${k[1].toFixed(2)},${k[2].toFixed(2)}`;
        if (colorMap[colorKey]) {
          current.c.k = [...colorMap[colorKey], k.length === 4 ? k[3] : 1];
        }
      } else if (Array.isArray(k) && typeof k[0] === "object") {
        // Handle animated colors
        k.forEach((kf) => {
          if (Array.isArray(kf.s) && typeof kf.s[0] === "number") {
            const colorKey = `${kf.s[0].toFixed(2)},${kf.s[1].toFixed(2)},${kf.s[2].toFixed(2)}`;
            if (colorMap[colorKey]) {
              kf.s = [...colorMap[colorKey], kf.s.length === 4 ? kf.s[3] : 1];
            }
          }
        });
      }
    }

    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        traverse(current[key]);
      }
    }
  }

  traverse(obj);
}

function generateAllThemedAnimations() {
  const allThemes = {};
  let totalSize = 0;

  Object.entries(themeOptions).forEach(([themeName, themeColors]) => {
    console.log(`Processing theme: ${themeName}`);

    const themedAnimation = JSON.parse(JSON.stringify(animationData));

    const colorMap = {
      "0.80,0.07,0.07": hexToLottieColor(themeColors.loaderHelmetAndHand),
      "0.96,0.73,0.00": hexToLottieColor(themeColors.loaderShirt),
      "0.96,0.96,0.96": hexToLottieColor(themeColors.loaderSkin),
      "0.19,0.58,0.83": hexToLottieColor(themeColors.loaderBag),
      "0.59,0.63,0.07": hexToLottieColor(themeColors.loaderPant),
      "0.20,0.20,0.20": hexToLottieColor(themeColors.loaderShoes),
      "0.00,0.00,0.00": hexToLottieColor(themeColors.loaderShadowAndEyes),
    };

    directColorReplace(themedAnimation, colorMap);

    allThemes[themeName] = themedAnimation;
  });

  const outputContent = `

export const themedAnimations = ${JSON.stringify(allThemes)};

export function getThemeAnimation(themeName) {
  return themedAnimations[themeName] || themedAnimations['default'];
}

export const availableThemes = ${JSON.stringify(Object.keys(allThemes))};
`;

  fs.writeFileSync("./src/scripts/themed-animations.js", outputContent);

  const stats = fs.statSync("./src/scripts/themed-animations.js");
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log("\n All themes bundled successfully!");
}

generateAllThemedAnimations();
