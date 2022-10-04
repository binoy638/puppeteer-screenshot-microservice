import { launch } from "puppeteer-core";
import dotenv from "dotenv";
import chrome from "chrome-aws-lambda";

dotenv.config();

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const getOptions = async () => {
  const isDev = process.env.NODE_ENV === "development";
  let options;
  const exe = await chrome.executablePath;
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: true,
    };
  } else {
    options = {
      args: chrome.args,
      executablePath: exe,
      headless: chrome.headless,
    };
  }
  return options;
};

export const takePageScreenshot = async (url: string) => {
  try {
    const options = await getOptions();
    const browser = await launch(options);
    const page = await browser.newPage();

    // set the viewport size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // tell the page to visit the url
    await page
      .goto(url, { waitUntil: "load", timeout: 6400 })
      .catch((e) => console.error(e));

    // take a screenshot
    const file = await page.screenshot({
      type: "png",
    });

    // close the browser
    await browser.close();

    return file;
  } catch (error) {
    console.error(error);
  }
};
