"use server";
import puppeteer from "puppeteer";

import { Product } from "@lemonsqueezy/lemonsqueezy.js";
import { db } from "@/db";
import { SelectUrl, urlTable, userTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";

import chromium from "@sparticuz/chromium";
import { Resend } from "resend";
import EmailTemplate from "./email-template";
import { User } from "lucia";
import { sendEmail } from "@/lib/email";
// export const maxDuration = 50;
// export const dynamic = "force-dynamic";
const test = true;
type prodScrapType =
  | {
      res: string;
      error?: undefined;
    }
  | {
      error: string;
      res?: undefined;
    };

export async function getProduct() {
  const endpoint = "https://api.lemonsqueezy.com/v1/products";
  const apiKey =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIyNjJlYjEwZGFjZWZkNzM1N2MyYzc0YjI2YTFkMWI3ZDU3ZTNiMzljODlmMTZlYWM5NWM0NjBkOTYyOGQyMTI3NmQ0OTk5Y2M5MTdmNDcxMiIsImlhdCI6MTcyMzU1ODE0OC4wMDc2ODcsIm5iZiI6MTcyMzU1ODE0OC4wMDc2ODksImV4cCI6MjAzOTA5MDk0Ny45NTkxNDksInN1YiI6IjIyNTIyMjkiLCJzY29wZXMiOltdfQ.PkShm6Et2DugML9H4mEhdAbd5VDUodKBqxuU50GqD1pQpFkNAaKjR7tOUD2EiHNxdGWs09J9ayABo_maTcIIzURvDTKppwDWj0uy_BA-MAieCoWRgdw8WPuBJqGLsKIqGirX3NsVPmeZP4kxH4rgAIdlcvP5adcgVI_LsUALIWaC7p-Ilv3FjyhLL88TXfv1Emz3j3v4-I_edCVdIMdj5O62gknwloyE5X5RVZZ8uDzXr9ibdU5kTh7QdpMISAzIwtuCt8dKbQQe892OH3uMYW4TBd1YoyUsn2W-hRhHololmLIWJOgWhTmMRXsg_UiWo-OP-4tGQcGsSwte1MrwrGFBg0r19lYe85tWEpn2EXwdXdzyEIBe2UNL4BbysQcBKkioJwGWTFSaRyyiFtbiNfpIoZCwhJuIWX7IJNd1YXtPjZJcJpUKn2aAIhO8i_kS-q-8ByCCs5ZXE5hvr-FucbpMcH97fh2q9xGKadne6MmWexa9ciAdcKRdQfLsnh4K";
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
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

  // let browser;
  // try {
  //   browser = await puppeteer.launch();
  //   const page = await browser.newPage();
  //   page.setDefaultNavigationTimeout(0);

  //   await page.goto(airbnbUrl, { waitUntil: "networkidle2" });

  //   const roomLinks = await page.evaluate(() => {
  //     const anchorTags = document.querySelectorAll("a");
  //     const hrefs = Array.from(anchorTags)
  //       .map((anchor) => anchor.href)
  //       .filter((href) => href.includes("/rooms/"));
  //     return Array.from(new Set(hrefs)); // Remove duplicate links
  //   });

  //   return { res: roomLinks };
  // } catch (error) {
  //   console.error("Error scraping Airbnb URL:", error);
  //   return { error: "Failed to scrape the Airbnb URL" };
  // } finally {
  //   if (browser) {
  //     await browser.close();
  //   }
  // }
}

// async function scrap(airbnbUrl: string) {
//   let browser;
//   try {
//     browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     page.setDefaultNavigationTimeout(0);

//     await page.goto(airbnbUrl, { waitUntil: "networkidle2" });

//     const roomLinks = await page.evaluate(() => {
//       const anchorTags = document.querySelectorAll("a");
//       const hrefs = Array.from(anchorTags)
//         .map((anchor) => anchor.href)
//         .filter((href) => href.includes("/rooms/"));
//       return Array.from(new Set(hrefs)); // Remove duplicate links
//     });

//     return { res: roomLinks.join(",") };
//   } catch (error) {
//     console.error("Error scraping Airbnb URL:", error);
//     return { error: "Failed to scrape the Airbnb URL" };
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }
export async function scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
  urlBean: SelectUrl | null,
  newUrl: string,
  userId: string
) {
  if (process.env.NODE_ENV == "development") {
    userId = "ixmnldnxh5tygizn";
  }
  let browser = null;
  try {
    const launchConfig = await getLaunchConfig();
    browser = await puppeteer.launch(launchConfig);
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(urlBean?.url ?? newUrl, { waitUntil: "networkidle0" });
    const roomLinks = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const hrefs = Array.from(anchorTags)
        .map((anchor) => anchor.href)
        .filter((href) => href.includes("/rooms/"));
      return Array.from(new Set(hrefs)); // Remove duplicate links
    });

    // if(roomLinks.length==0)
    if (urlBean) {
      var isNotifCountZero = false;
      checkIfDiffEmailUpdateDeductNotiCreditsUpdateUrlAsProcessed(
        roomLinks,
        urlBean,
        userId,
        urlBean.url
      );
    } else {
      await db.insert(urlTable).values({
        userId,
        url: newUrl,
        listingUrls: roomLinks.join(","),
        lastScraped: new Date(),
      });
    }
    return { res: "all good" };
  } catch (error) {
    console.log("Error scraping Airbnb URL:", error);
    return {
      error: `Failed to scrape the Airbnb URL. Error message: ${
        (error as Error).message
      }`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
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
      console.log({ here209: "there was a diff" });

      const selectUserResult = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

      const user: User = selectUserResult[0];
      if (!user) {
        const errMess = `Could not find user with userId: ${userId}`;
        console.log({ errMess });
        return { error: errMess };
      }

      console.log({ here218: "sending email" });

      const { data, error } = await sendEmail({
        user,
        airbnbSearchUrl,
        oldScrapedUrlsArr,
        newScrapedUrlsArr,
      });
      console.log({ here226: "email sent", result: data, error: error });
      if (error) {
        return { error };
      }

      // deduce notifications credits
      var notifCount = selectUserResult[0].notifications_count;
      console.log({ here233: "deducting credits" });
      if (notifCount < 1) {
        return {
          error:
            "Scraped a url for a user with less than 1 notification count. Logic be in place to only scrape urls from users with 1 or more notification count",
        };
      }
      notifCount = notifCount - 1;

      
      if (notifCount === 0) {
        isNotifCountZero = true;
      }
      console.log({ here250: notifCount });
      console.log({ here241: "updating user table" });
      await db
        .update(userTable)
        .set({
          notifications_count: notifCount,
        })
        .where(eq(userTable.id, userId));
      // done
    }
    console.log({ here250: "updating url table" });
    const lastDifference =
      newScrapedUrlsArr.length != oldScrapedUrls.length
        ? new Date()
        : urlBean?.lastDifference ?? null;
    await db
      .update(urlTable)
      .set({
        listingUrls: newScrapedUrlsArr.join(","),
        processed: true,
        lastScraped: new Date(),
        lastDifference,
      })
      .where(eq(urlTable.url, urlBean?.url ?? newUrl));
      
      if (isNotifCountZero) {
        await db.update(urlTable).set({ paused: true }).where(eq(urlTable.userId, userId));
      }
  }
}

export async function scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain() {
  const result = await processUrl();
  if (result === undefined) {
    await db.update(urlTable).set({ processed: false });
    const resultt = await processUrl();
    return { ...resultt };
  } else {
    return { ...result };
  }

  async function processUrl() {
    const oldestUnprocessedUrl = await db.query.urlTable.findFirst({
      where: and(eq(urlTable.processed, false), eq(urlTable.paused, false)),
      orderBy: [asc(urlTable.lastScraped)],
    });

    if (oldestUnprocessedUrl) {
      // const urlBeanResult = await db
      //   .select()
      //   .from(urlTable)
      //   .where(eq(urlTable.url, oldestUnprocessedUrl.userId));

      // const urlBean: SelectUrl = urlBeanResult[0];
      const results =
        await scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
          oldestUnprocessedUrl,
          "",
          oldestUnprocessedUrl.userId
        );
      return {
        msg: `Processed url: ${oldestUnprocessedUrl.url}. Failure message: ${results.error}. Result message: ${results.res}`,
      };
    }
    return;
  }
}
