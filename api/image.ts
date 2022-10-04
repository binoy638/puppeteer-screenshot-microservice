import type { VercelRequest, VercelResponse } from "@vercel/node";
import { screenshotConfigsSchema, takePageScreenshot } from "../utils";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ZodError } from "zod";

dotenv.config();

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    let dataToVerify = req.query as unknown;

    if (process.env.JWT_SECRET) {
      console.log("inside");
      console.log({ jwt: process.env.JWT_SECRET });
      const { data } = req.query;
      if (!data) {
        res.status(404).send("JWT not found");
        return;
      }
      dataToVerify = jwt.verify(data as string, process.env.JWT_SECRET);
      console.log({ dataToVerify });
    }

    const config = await screenshotConfigsSchema.parseAsync(dataToVerify);
    const file = await takePageScreenshot(config);
    res.setHeader("Content-Type", "image/jpeg");

    res.setHeader(
      "Cache-Control",
      "public, immutable, no-transform, s-maxage=31536000, max-age=31536000"
    );
    res.send(file);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).send(error);
      return;
    }
    console.error(error);
    res.status(500).send("Something went wrong");
    return;
  }
};
