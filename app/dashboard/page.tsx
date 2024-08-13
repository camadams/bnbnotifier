"use client";
import { getUrls, getProduct } from "./action";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { validateRequest } from "@/lib/validate-request";
import { User } from "lucia";
import { redirect } from "next/navigation";
import { Product } from "@lemonsqueezy/lemonsqueezy.js";
import { SelectUrl } from "@/db/schema";
import MyForm from "./formForApi";
import LoadingBlock from "./loadingBlock";
import UrlCard, { AirbnbSearchParams } from "../urlCard";

export default function Dashboard() {
  // const [state, action] = useFormState(scrapUrlAndAdd, null);
  const [url, setUrl] = useState<AirbnbSearchParams>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [urlObjects, setUrls] = useState<SelectUrl[] | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await validateRequest();
        setUser(user);
      } catch (error) {
        console.error("Failed to validate request:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchProduct = async () => {
      try {
        // const fetchProductResp = await fetch(
        //   `${
        //     process.env.NODE_ENV === "development"
        //       ? "https//localhost:3000"
        //       : "https://bnbnotifiter.com"
        //   }/api/getproduct`
        // );

        const product = await getProduct();
        setProduct((prev) => product.product);
      } catch (error) {
        console.error("Failed to get user email:", error);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchUser();
    fetchProduct();
  }, []);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        if (user && user.id) {
          const urls = await getUrls(user.id);
          setUrls((prev) => urls ?? undefined);
        }
      } catch (error) {
        console.error("Failed to get user email:", error);
      } finally {
        // setLoadingProduct(false);
      }
    };

    fetchUrls();
  }, [user]);

  if (loading) {
    return "loading";
  }
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="px-6">
      <Navbar user={user} />
      <div className="py-16 space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl ">Hi {user.username} !</h1>
        {/* {data ? <p>data is truthy {data.user_email}</p> : <p>data is falsey</p>} */}
        <p>You have {user.notifications_count} notifications left</p>

        <a
          target="_"
          className={`mt-8 ${
            product ? "bg-red-400 " : "bg-red-100 pointer-events-none"
          }  px-3 py-1 rounded-full hover:bg-red-500`}
          href={
            product
              ? `${product.data.attributes.buy_now_url}?checkout[custom][userId]=${user.id}`
              : ""
          }
        >
          Get Notifications
        </a>
      </div>

      <Urls />
    </div>
  );

  function Urls() {
    return (
      <div className="flex gap-2 text-sx">
        {!urlObjects ? (
          <LoadingBlock />
        ) : (
          urlObjects?.map((urlObject, i) => (
            <UrlCard key={i} urlObject={urlObject} />
          ))
        )}
        <AddNewUrl />
      </div>
    );
    function AddNewUrl() {
      return (
        <div className="rounded-lg p-10 space-y-4 border-dotted border-4 size-1/3 text-sm">
          <h1>
            Enter the URL from Airbnbs website after you have searched for
            listings
          </h1>
          <button
            className="underline text-blue-600"
            onClick={async () =>
              await navigator.clipboard.writeText(
                "https://www.airbnb.co.za/s/Cape-Town--Western-Cape--South-Africa/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&channel=EXPLORE&query=Cape%20Town%2C%20Western%20Cape&place_id=ChIJ1-4miA9QzB0Rh6ooKPzhf2g&date_picker_type=flexible_dates&flexible_trip_dates%5B%5D=october&flexible_trip_dates%5B%5D=september&adults=1&source=structured_search_input_header&search_type=user_map_move&search_mode=regular_search&price_filter_num_nights=28&ne_lat=-34.1022032339858&ne_lng=18.47622637502542&sw_lat=-34.10891042062033&sw_lng=18.46928919979797&zoom=16.51538932078821&zoom_level=16.51538932078821&search_by_map=true&price_max=8082&amenities%5B%5D=4&flexible_trip_lengths%5B%5D=one_month"
              )
            }
          >
            Or click here to copy an example
          </button>
          <MyForm user={user} />
        </div>
      );
    }
  }
}
