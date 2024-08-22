import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  // const resend = new Resend(process.env.RESEND_API_KEY);

  // const { data, error } = await resend.emails.send({
  //   from: "BNBNotifier <bnbnotifier@mail.camthehuman.com>",
  //   to: "camgadams@gmail.com",
  //   subject: "New Listing alert!",
  //   text: "You have a new airbnb notification",
  // });

  return NextResponse.json("resp", { status: 200 });
}
