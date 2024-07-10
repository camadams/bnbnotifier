"use client";

import Link from "next/link";
import { useState } from "react";

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <nav className="w-full flex justify-between items-center p-8">
      <div className="font-bold md:text-2xl text-lg tracking-wider">
        BNB<span className="text-red-500">Notifier</span>
      </div>
      <div className="sm:flex items-center justify-center gap-6 hidden">
        <NavLinks />
      </div>

      <div className="sm:hidden" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </div>
      {isOpen && (
        <div className="absolute inset-0 z-100">
          <div
            className="bg-slate-800/70 h-screen flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="bg-white flex flex-col p-8 gap-4 rounded-md">
              <NavLinks />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLinks = () => {
  return (
    <>
      <Link href="/signup" className="">
        Pricing
      </Link>
      <Link
        href="/signup"
        className="rounded-lg px-3 py-1 bg-red-500 text-white"
      >
        Sign up
      </Link>
    </>
  );
};
