import { User } from "lucia";
import { logout } from "./actions";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar({ user }: { user: User | null }) {
  return (
    <nav className="md:px-6 px-2 py-6 flex justify-between z-100">
      <Link href="/" className="font-bold">
        BNB<span className="text-red-600">Notifier</span>
      </Link>

      <div className="flex gap-4">
        {user ? (
          <>
            <div className="flex gap-6 items-center">
              <form action={logout}>
                <button className="underline">Log out</button>
              </form>
            </div>
            <Link className="rounded-xl bg-red-400 px-3 py-1" href="/dashboard">
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link className="underline" href="/login">
              Log In
            </Link>
            <Link className="rounded-xl bg-red-400 px-3 py-1" href="/signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
