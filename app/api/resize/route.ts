import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_AUTH || "");

async function getImageFromCache(key: string) {
  const cachedImage = await redis.get(key);
  return cachedImage ? Buffer.from(cachedImage, "base64") : null;
}

async function setImageInCache(key: string, imageData: any) {
  await redis.set(key, imageData.toString("base64"), "EX", 3600); // TTL set to 1 hour (3600 seconds)
}

const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export async function GET(req: NextRequest, res: any) {
  const { searchParams } = new URL(req.url);
  const link = searchParams.get("link");
  let size = parseInt(searchParams.get("size") as string);

  await runMiddleware(
    req as unknown as NextApiRequest,
    {
      ...res,
      getHeader: (name: string) => res.headers?.get(name),
      setHeader: (name: string, value: string) => res.headers?.set(name, value),
    } as unknown as NextApiResponse,
    cors
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const instance = Axios.create();
  const axios = setupCache(instance);

  try {
    if (!size) size = 1000;
    const redisKey = `${link}_${size}`;

    const cachedImage = await getImageFromCache(redisKey);

    if (cachedImage) {
      console.log("cache exist");
      return new Response(cachedImage, {
        headers: { "content-type": "image/webp", "Cache-Control": "private" },
      });
    }

    const response = await axios.get(link || "", {
      responseType: "arraybuffer",
    });
    const imageData = Buffer.from(response.data, "binary");

    const resizedData = await sharp(imageData)
      .resize({ width: size, height: size, fit: "inside" })
      .toFormat("webp")
      .toBuffer();

    // Cache the resized image
    setImageInCache(redisKey, resizedData);

    // Return the resized image
    return new Response(resizedData, {
      headers: { "content-type": "image/webp", "Cache-Control": "private" },
    });
  } catch (error) {
    console.error("Error during image processing:", error);
    return NextResponse.json({ error: "error, please check server log" });
  }
}
