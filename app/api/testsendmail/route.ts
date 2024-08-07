import chromium from "@sparticuz/chromium";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { Resend } from "resend";

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: "camgadams@gmail.com",
    subject: "Hello world",
    text: "hji",
  });

  return NextResponse.json("resp", { status: 200 });
}
