import { NextResponse } from "next/server";
const sharp = require("sharp");
import axios from "axios";

const example =
  "https://images.ctfassets.net/0wvobgztd3t0/4WCqda0hBPgK8LAyphHxfJ/9aedb4cf264da5d6952f4966fe1fcf16/A_15_-_Photo.jpg";

export async function GET(req: any, res: any) {
  // const { imageUrl, width, height } = req.body;

  try {
    axios
      .get(example, { responseType: "arraybuffer" })
      .then((response) => {
        const imageData = Buffer.from(response.data, "binary");

        sharp(imageData)
          .resize(100)
          .toFormat("webp")
          .toBuffer()
          .then((resizedData: any) => {
            console.log(resizedData.toString("base64"));
            res.send(resizedData);

            // Now you have the resized image data as a base64 string
          })
          .catch((err: any) => {
            console.error("Error during image resizing:", err);
          });
      })
      .catch((error) => {
        console.error("Error during image download:", error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

  return NextResponse.json({ data: "user" });
}
