import { NextResponse, NextRequest } from "next/server";
import sharp from "sharp";
import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

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

const example =
  "https://images.ctfassets.net/0wvobgztd3t0/4WCqda0hBPgK8LAyphHxfJ/9aedb4cf264da5d6952f4966fe1fcf16/A_15_-_Photo.jpg";

export async function POST(req: NextApiRequest, res: any) {
  await runMiddleware(
    req,
    {
      ...res,
      getHeader: (name: string) => res.headers?.get(name),
      setHeader: (name: string, value: string) => res.headers?.set(name, value),
    } as unknown as NextApiResponse,
    cors
  );

  let passedValue = await new Response(req.body).text();
  let reqBody = JSON.parse(passedValue);

  const instance = Axios.create();
  const axios = setupCache(instance);

  try {
    const response = await axios.get(reqBody.link, {
      responseType: "arraybuffer",
    });
    const imageData = Buffer.from(response.data, "binary");

    const resizedData = await sharp(imageData)
      .resize({ width: 1000, height: 1000, fit: "inside" })
      .toFormat("webp")
      .toBuffer();

    return new Response(resizedData, {
      headers: { "content-type": "image/png" },
    });

    // Now you have the resized image data as a base64 string
  } catch (error) {
    console.error("Error during image processing:", error);
    return NextResponse.json({ error: "user" });
  }
}
