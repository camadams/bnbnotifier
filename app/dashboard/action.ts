"use server";
import puppeteer from "puppeteer";

import { Product } from "@lemonsqueezy/lemonsqueezy.js";
import { db } from "@/db";
import { SelectUrl, urlTable, userTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";

import chromium from "@sparticuz/chromium";
import { User } from "lucia";
import { sendEmail } from "@/lib/email";
import { sendErrorEmail } from "../actions";

export async function getProduct() {
  const endpoint = "https://api.lemonsqueezy.com/v1/products";
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  };

  const res = await fetch(endpoint, { headers });

  const resJson = await res.json();
  const product = { ...resJson, data: resJson.data[0] } as Product;

  return { product };
}

export async function getUrls(userId: string) {
  const urls = await db.query.urlTable.findMany({
    where: eq(urlTable.userId, userId),
  });
  return urls;
}

export async function scrapUrlAndAdd(_: any, formData: FormData) {
  try {
    const url = formData.get("airbnbUrl") as string;
    const userId = formData.get("userId") as string;
    const scrapResult =
      await scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
        null,
        url,
        userId
      );
    if (scrapResult.error !== undefined) {
      return { ...scrapResult };
    } else {
      revalidatePath("/dashboard", "page");
      return { ...scrapResult };
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.log(error);
    return { isOk: false, msg: errorMessage };
  }
}
export async function scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
  oldUrlObject: SelectUrl | null,
  newUrl: string,
  userId: string
) {
  var errorMessge = "";
  if (process.env.NODE_ENV == "development") {
    userId = "ixmnldnxh5tygizn";
  }
  let browser = null;
  try {
    const launchConfig = await getLaunchConfig();
    browser = await puppeteer.launch(launchConfig);
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(oldUrlObject?.url ?? newUrl, { waitUntil: "networkidle0" });
    const newScrapedUrlsArr = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const hrefs = Array.from(anchorTags)
        .map((anchor) => anchor.href)
        .filter((href) => href.includes("/rooms/"));
      return Array.from(new Set(hrefs)); // Remove duplicate links
    });

    if (newScrapedUrlsArr.length == 0) {
      errorMessge += "Error scraping url. No new listings found.";
    } else if (oldUrlObject) {
      var isNotifCountZero = false;
      checkIfDiffEmailUpdateDeductNotiCreditsUpdateUrlAsProcessed(
        newScrapedUrlsArr,
        oldUrlObject,
        userId,
        oldUrlObject.url
      );
    } else {
      await db.insert(urlTable).values({
        userId,
        url: newUrl,
        listingUrls: newScrapedUrlsArr.join(","),
        lastScraped: new Date(),
      });
    }
  } catch (error) {
    errorMessge = (error as Error).message;
    console.log(errorMessge);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (errorMessge) {
      await db
        .update(urlTable)
        .set({ errorMessage: errorMessge, processed: true })
        .where(eq(urlTable.url, oldUrlObject?.url ?? newUrl));
    }
    if (errorMessge !== "") {
      await sendErrorEmail(errorMessge);
    }
    return { res: "done", error: errorMessge };
  }

  async function getLaunchConfig() {
    return process.env.NODE_ENV == "development"
      ? {}
      : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
          ignoreDefaultArgs: ["--disable-extensions"],
        };
  }

  async function checkIfDiffEmailUpdateDeductNotiCreditsUpdateUrlAsProcessed(
    newScrapedUrlsArr: string[],
    oldUrlObject: SelectUrl,
    userId: string,
    airbnbSearchUrl: string
  ) {
    const oldScrapedUrls = oldUrlObject.listingUrls;
    const oldScrapedUrlsArr = oldScrapedUrls.split(",");

    //check diff
    if (newScrapedUrlsArr.length > oldScrapedUrlsArr.length) {
      const selectUserResult = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

      const user: User = selectUserResult[0];
      if (!user) {
        errorMessge += `Could not find user with userId: ${userId}`;
        console.log({ errorMessge });
        return { error: errorMessge };
      }
      const { data, error } = await sendEmail({
        user,
        airbnbSearchUrl,
        oldScrapedUrlsArr,
        newScrapedUrlsArr,
      });
      if (error) {
        errorMessge += `Error sending email: ${error}`;
        await db
          .update(urlTable)
          .set({ errorMessage: errorMessge })
          .where(eq(urlTable.url, oldUrlObject?.url ?? newUrl));
        return { error: errorMessge };
        ``;
      }
      // deduce notifications credits
      var notifCount = selectUserResult[0].notifications_count;
      if (notifCount < 1) {
        errorMessge += `Scraped a url for a user with less than 1 notification count.`;
        await db
          .update(urlTable)
          .set({ errorMessage: errorMessge })
          .where(eq(urlTable.url, oldUrlObject?.url ?? newUrl));
        return {
          error: errorMessge,
        };
      }
      notifCount = notifCount - 1;

      if (notifCount === 0) {
        isNotifCountZero = true;
      }
      await db
        .update(userTable)
        .set({
          notifications_count: notifCount,
        })
        .where(eq(userTable.id, userId));
    }
    // done
    const lastDifference =
      newScrapedUrlsArr.length != oldScrapedUrls.length
        ? new Date()
        : oldUrlObject?.lastDifference ?? null;
    await db
      .update(urlTable)
      .set({
        listingUrls: newScrapedUrlsArr.join(","),
        processed: true,
        lastScraped: new Date(),
        lastDifference,
      })
      .where(eq(urlTable.url, oldUrlObject?.url ?? newUrl));

    if (isNotifCountZero) {
      await db
        .update(urlTable)
        .set({ paused: true })
        .where(eq(urlTable.userId, userId));
    }
  }
}

export async function scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain() {
  var oldestActiveUnprocessedUrl = await db.query.urlTable.findFirst({
    where: and(eq(urlTable.processed, false), eq(urlTable.paused, false)),
    orderBy: [asc(urlTable.lastScraped)],
  });

  // console.log({ oldestActiveUnprocessedUrl });
  if (!oldestActiveUnprocessedUrl) {
    await db.update(urlTable).set({ processed: false });
    oldestActiveUnprocessedUrl = await db.query.urlTable.findFirst({
      where: and(eq(urlTable.processed, false), eq(urlTable.paused, false)),
      orderBy: [asc(urlTable.lastScraped)],
    });
    // console.log({ oldestActiveUnprocessedUrl });
  }
  if (!oldestActiveUnprocessedUrl) {
    // console.log("No oldest unprocessed url found");
    return { error: "No oldest unprocessed url found" };
  }

  await scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
    oldestActiveUnprocessedUrl,
    "",
    oldestActiveUnprocessedUrl.userId
  );
}
