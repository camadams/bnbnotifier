import { User } from "lucia";
import { logout } from "./actions";
import Link from "next/link";

export default function Navbar({ user }: { user: User }) {
  return (
    <nav className="p-8 flex justify-between">
      <Link className="underline" href="/">
        Home
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/profile">Profile</Link>
        <form action={logout}>
          <button className="rounded-lg bg-red-400 px-3 py-1">Log out</button>
        </form>
      </div>
    </nav>
  );
}
