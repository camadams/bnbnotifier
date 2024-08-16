"use server";
import { validateRequest } from "@/lib/validate-request";
import Link from "next/link";
import { logout } from "./actions";
import Image from "next/image";
import { getUrls } from "./dashboard/action";
import UrlCard from "./urlCard";
import Navbar from "./navbar";
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

      <div className="absolute top-0 w-full z-10">
        <Navbar user={user} />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-bold text-xl">
          A search spanning the Deep South of Cape Town 👇
        </h1>

        <div className="flex justify-center items-center w-full ">
          {urls[1] && <UrlCard urlObject={urls[1]} />}
        </div>
      </div>
    </main>
  );
}
