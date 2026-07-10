import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const inputPath = path.join(dirName, "../public/fitlink-logo.svg");
const outputPath = path.join(dirName, "../public/fitlink-logo-email.png");

async function createEmailLogo() {
  try {
    await sharp(inputPath)
      .resize({
        width: 440,
        height: 128,
        fit: "contain",
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0,
        },
      })
      .png()
      .toFile(outputPath);

    console.log("Email logo created:", outputPath);
  } catch (error) {
    console.error("Failed to create email logo:", error);
    process.exit(1);
  }
}

createEmailLogo();