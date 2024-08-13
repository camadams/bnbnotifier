import { validateRequest } from "@/lib/validate-request";
import Link from "next/link";
import { logout } from "./actions";
import Image from "next/image";
import { getUrls } from "./dashboard/action";
import UrlCard from "./urlCard";
export default async function Home() {
  // const [urlObjects, setUrls] = useState<SelectUrl[] | null>(null);
  //   const posts = await db.query.postsTable.findMany();

  // useEffect(() => {
  //   const fetchUrls = async () => {
  //     try {
  //       const urls = await getUrls("ixmnldnxh5tygizn");
  //       setUrls((prev) => urls ?? undefined);
  //     } catch (error) {
  //       console.error("Failed to get user email:", error);
  //     } finally {
  //       // setLoadingProduct(false);
  //     }
  //   };

  //   fetchUrls();
  // }, []);

  const urls = await getUrls("ixmnldnxh5tygizn");

  const { user } = await validateRequest();
  return (
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

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-16 p-8">
        <h1 className="text-bold text-4xl">BNBNotifier</h1>

        <div className="flex gap-4">
          {user ? (
            <>
              <div>
                <form action={logout}>
                  <button className="rounded-lg bg-red-400 px-4 py-2">
                    Log out
                  </button>
                </form>
              </div>
              <Link
                className="rounded-lg bg-red-400 px-4 py-2"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="rounded-lg bg-red-400 px-4 py-2" href="/login">
                Log In
              </Link>
              <Link className="rounded-lg bg-red-400 px-4 py-2" href="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
        <div className="flex gap-2 text-sx justify-center items-center w-full h-20">
          {urls[0] && <UrlCard urlObject={urls[0]} />}
        </div>
      </div>
    </main>
  );
}
