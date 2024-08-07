// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const isAWSLambda = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

//   const { chrome, puppeteer } = await loadDependencies(isAWSLambda);

//   let options = {};

//   if (isAWSLambda && chrome) {
//     options = {
//       args: [
//         ...chrome.default.args,
//         "--hide-scrollbars",
//         "--disable-web-security",
//       ],
//       defaultViewport: chrome.default.defaultViewport,
//       executablePath: await chrome.default.executablePath,
//       headless: true,
//       ignoreHTTPSErrors: true,
//     };
//   } else {
//     options = { headless: true };
//   }

//   try {
//     const browser = await puppeteer.launch(options);
//     const page = await browser.newPage();
//     await page.goto("https://www.google.com");
//     const title = await page.title();
//     await browser.close();

//     res.status(200).json({ title });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to scrape the page" });
//   }
// }

// async function loadDependencies(isAWSLambda: boolean) {
//   if (isAWSLambda) {
//     const chrome = await import("chrome-aws-lambda");
//     const puppeteer = await import("puppeteer-core");
//     return { chrome, puppeteer };
//   } else {
//     const puppeteer = await import("puppeteer");
//     return { chrome: null, puppeteer };
//   }
// }
