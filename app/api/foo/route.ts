import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import axios from "axios";

const example =
  "https://images.ctfassets.net/0wvobgztd3t0/4WCqda0hBPgK8LAyphHxfJ/9aedb4cf264da5d6952f4966fe1fcf16/A_15_-_Photo.jpg";

export async function GET(req: NextRequest, res: any) {
  if (req.method === "OPTIONS") {
    // Preflight request. Reply successfully without actually processing the request.
    res.status(200).end();
    return;
  }

  try {
    const response = await axios.get(example, { responseType: "arraybuffer" });
    const imageData = Buffer.from(response.data, "binary");

    const resizedData = await sharp(imageData)
      .resize({ width: 1000, height: 1000, fit: "inside" })
      .toFormat("webp")
      .toBuffer();

    console.log(resizedData.toString("base64"));
    return new Response(resizedData, {
      headers: { "content-type": "image/png" },
    });

    // Now you have the resized image data as a base64 string
  } catch (error) {
    console.error("Error during image processing:", error);
    return NextResponse.json({ error: "user" });
  }
}
