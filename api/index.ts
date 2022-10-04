import type { VercelRequest, VercelResponse } from "@vercel/node";
import { takePageScreenshot } from "../utils";

export default async (req: VercelRequest, res: VercelResponse) => {
  const { url } = req.query;
  if (!url || typeof url !== "string" || url.length === 0) {
    res.status(400).send("Invalid URL");
    return;
  }
  const file = await takePageScreenshot(url);
  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Cache-Control",
    "public, immutable, no-transform, s-maxage=31536000, max-age=31536000"
  );
  res.send(file);
};
