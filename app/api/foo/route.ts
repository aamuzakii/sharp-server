import { NextResponse } from "next/server";
const sharp = require("sharp");

export async function GET(req: any, res: any) {
  const { imageUrl, width, height } = req.body;

  try {
    const resizedImageBuffer = await sharp(imageUrl)
      .resize({ width, height })
      .toFormat("webp")
      .toBuffer();

    res.type("webp").send(resizedImageBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

  return NextResponse.json({ data: "user" });
}
