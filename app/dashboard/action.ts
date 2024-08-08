"use server";
import puppeteer from "puppeteer";

import { Product } from "@lemonsqueezy/lemonsqueezy.js";
import { db } from "@/db";
import { SelectUrl, urlTable, userTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";

import chromium from "@sparticuz/chromium";
import { Resend } from "resend";
import EmailTemplate from "./email-template";
import { User } from "lucia";
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
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5OGFiYmY4MGE1ZDViZGQ0MGU1NzQ3MWQwYjQ0NGVhNGFkMzBiYmU3ZGE0NTVlODBiNGI3MDRjZDdjZjc3ZDg1ZjVlN2EwZThlM2JhOGIxMiIsImlhdCI6MTcyMTUwOTEzNC42NDk4MjgsIm5iZiI6MTcyMTUwOTEzNC42NDk4MzEsImV4cCI6MjAzNzA0MTkzNC42MjQ0NTYsInN1YiI6IjIyNTIyMjkiLCJzY29wZXMiOltdfQ.k3zroUakmWfR21Rv7gXlR3-pvR7ldt8buYH67WYYC2ZPgUTbJptQ1b0FzLM9l0GJyDGPbzb6TJ6FdgL0AZg7oF-6jGN7RN3OQfmuz4Yw_otDISbSj_pEgBr-2qyB0Pcve3JvgC0RvTt2UMN2-4ZOnp_a0IUFOOwB7PQ_4xO715fhqTJ0utoxw3Y6so7MqY0-3eo8mWUGdpQNQK2woUHd9mwdvV99zUl3v2UEJ66VE_xSDXpDWQw6WLXW3MPZybGk1w6lKtH5jyNKo44pXMe37SOMHtIczPXxdlDysoVd26jbvcXWapZAtLLaw57zvJsAIWboR40WU8-jikPgot-rjvH94JPZQgFGb38fqPt3jdL60hK4HjUtUUGUdUYrlbjJfx-x9czKSV0JhgEg4Hjuby4nZJ7TPEzczCneLuOOPVIohwxYFMsiVI962vh9TFq5uSiZtHlvvxqP5Ru4USIrqixH3PMYApvrvLP4-jPH5Hdu1jaskmhICo9h0g2LeMwI";
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
    userId = "i7fgwzytczbgovsg";
  }
  let browser = null;
  console.log({ here135: 1 });
  try {
    const launchConfig = await getLaunchConfig();
    console.log({ launchConfig });
    browser = await puppeteer.launch(launchConfig);
    console.log({ here140: 1 });

    let page = await browser.newPage();
    await page.goto(urlBean?.url ?? newUrl, { waitUntil: "networkidle0" });
    const roomLinks = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const hrefs = Array.from(anchorTags)
        .map((anchor) => anchor.href)
        .filter((href) => href.includes("/rooms/"));
      return Array.from(new Set(hrefs)); // Remove duplicate links
    });
    if (urlBean) {
      checkDiffEmailUpdate(roomLinks, urlBean, userId, urlBean.url);
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

  async function checkDiffEmailUpdate(
    newScrapedUrlsArr: string[],
    oldUrlObject: SelectUrl,
    userId: string,
    airbnbSearchUrl: string
  ) {
    const oldScrapedUrls = oldUrlObject.listingUrls;
    const oldScrapedUrlsArr = oldScrapedUrls.split(",");

    if (newScrapedUrlsArr.length > oldScrapedUrlsArr.length) {
      const selectUserResult = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

      const user: User = selectUserResult[0];
      if (!user) {
        return { error: `Could not find user with userId: ${userId}` };
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: [
          process.env.NODE_ENV == "development"
            ? "camgadams@gmail.com"
            : user.username,
        ],
        subject: "Hello world",
        react: EmailTemplate({
          user,
          airbnbSearchUrl,
          oldScrapedUrlsArr,
          newScrapedUrlsArr,
        }) as React.ReactElement,
      });

      if (error) {
        return { error };
      }

      var notifCount = selectUserResult[0].notifications_count;
      if (notifCount < 1) {
        return {
          error:
            "Scraped a url for a user with less than 1 notification count. Logic be in place to only scrape urls from users with 1 or more notification count",
        };
      }
      notifCount = notifCount - 1;
      await db
        .update(userTable)
        .set({
          notifications_count: notifCount--,
        })
        .where(eq(userTable.id, userId));
    }
    await db.update(urlTable).set({
      listingUrls: newScrapedUrlsArr.join(","),
      processed: true,
      lastScraped: new Date(),
    });
  }
}

export async function scrapOldestUnprocessedOrSetAllUnprocessedAndTryAgain() {
  const result = await processUrl();
  if (result === undefined) {
    await db.update(urlTable).set({ processed: false });
    const result = await processUrl();
    return { ...result };
  } else {
    return { ...result };
  }

  async function processUrl() {
    const oldestUnprocessedUrl = await db.query.urlTable.findFirst({
      where: eq(urlTable.processed, false),
      orderBy: [asc(urlTable.lastScraped)],
    });

    if (oldestUnprocessedUrl) {
      const results =
        await scrapExistingUrlCheckDiffEmailUpdateOrAddNewUrlAndScrap(
          oldestUnprocessedUrl,
          "",
          ""
        );
      return {
        msg: `Processed url: ${oldestUnprocessedUrl.url}. Failure message: ${results.error}. Result message: ${results.res}`,
      };
    }
    return;
  }
}
