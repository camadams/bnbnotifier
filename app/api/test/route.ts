import chromium from "@sparticuz/chromium";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
export const maxDuration = 30;
// const { createClient } = require("@libsql/client");

export async function GET() {
  const url =
    "https://www.airbnb.co.za/s/Cape-Town--Western-Cape--South-Africa/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&channel=EXPLORE&query=Cape%20Town%2C%20Western%20Cape&place_id=ChIJ1-4miA9QzB0Rh6ooKPzhf2g&date_picker_type=flexible_dates&flexible_trip_dates%5B%5D=october&flexible_trip_dates%5B%5D=september&adults=1&source=structured_search_input_header&search_type=user_map_move&search_mode=regular_search&price_filter_num_nights=28&ne_lat=-34.1022032339858&ne_lng=18.47622637502542&sw_lat=-34.10891042062033&sw_lng=18.46928919979797&zoom=16.51538932078821&zoom_level=16.51538932078821&search_by_map=true&price_max=8082&amenities%5B%5D=4&flexible_trip_lengths%5B%5D=one_month";
  let result = null;
  let browser = null;
  let resp = null;
  console.log({ here: 12 });

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log({ here: 22 });

    let page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    console.log({ here: 26 });

    const roomLinks = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const hrefs = Array.from(anchorTags)
        .map((anchor) => anchor.href)
        .filter((href) => href.includes("/rooms/"));
      return Array.from(new Set(hrefs)); // Remove duplicate links
    });
    console.log({ here: 35, roomLinks });

    // result = await page.title();
    result = roomLinks;

    // const turso = createClient({
    //   url: process.env.TURSO_DATABASE_URL,
    //   authToken: process.env.TURSO_AUTH_TOKEN,
    // });

    // const users = await turso.execute("SELECT * FROM user");

    resp = JSON.stringify({
      statusCode: 200,
      body: result,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      isBase64Encoded: false,
    });
  } catch (error) {
    console.log("error at index.js", (error as Error).message);
    return NextResponse.json((error as Error).message, { status: 400 });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return NextResponse.json(resp, { status: 200 });
}
