import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NavBar } from "./navbar";

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <main className="relative">
      <div className="h-screen -z-10">
        <Image
          className="bg-slate-300 object-top object-cover"
          alt="hi"
          src={"/hero.svg"}
          fill
        />
      </div>
      <div className="absolute inset-0 -z-1  bg-white/85"></div>

      <div className="w-full h-screen absolute inset-0 flex flex-col md:px-32 px-4">
        <NavBar />
        <div className="w-full flex-1 flex-col flex justify-center gap-4 rounded-full -mt-20 items-center">
          <h1 className="text-red-500 md:text-5xl text-3xl">
            Get <span className="underline">notified</span> as soon as Airbnb
            listings
            <br /> become available
          </h1>
          <h2>
            No subscription charge, pay only for notification credits. <br />
            <Link className="underline" href="/signup">
              Sign up
            </Link>{" "}
            early to get free credits
          </h2>
          <Link
            href="/signup"
            className="rounded-lg px-6 mx-auto py-2 mt-6 bg-red-500 text-white w-fit"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
