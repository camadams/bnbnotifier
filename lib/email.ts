import EmailTemplate from "@/app/dashboard/email-template";
import { User } from "lucia";
import { Resend } from "resend";

export async function sendEmail({
  user,
  airbnbSearchUrl,
  oldScrapedUrlsArr,
  newScrapedUrlsArr,
}: {
  user: User;
  airbnbSearchUrl: string;
  oldScrapedUrlsArr: string[];
  newScrapedUrlsArr: string[];
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "BNBNotifier <bnbnotifier@mail.camthehuman.com>",
    to: [
      process.env.NODE_ENV == "development"
        ? "camgadams@gmail.com"
        : user.emailAddress,
    ],
    subject: "New Airbnb listing!",
    react: EmailTemplate({
      user,
      airbnbSearchUrl,
      oldScrapedUrlsArr,
      newScrapedUrlsArr,
    }) as React.ReactElement,
  });

  return { data, error };
}
