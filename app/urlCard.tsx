import { SelectUrl } from "@/db/schema";
import { formatTimeDifference } from "@/lib/dateUtil";
import { format } from "date-fns";
import Link from "next/link";

export default function UrlCard({ urlObject }: { urlObject: SelectUrl }) {
  const url = parseAirbnbSearchParams(urlObject.url);
  return (
    <div className="rounded-lg p-4 space-y-3 text-sx break-words border-4 lg:w-1/3 text-sm">
      <div className="p-2 bg-slate-100 rounded-2xl">
        <div className="flex gap-2">
          <div>Start:</div>
          <div>{url.monthly_start_date}</div>
        </div>
        <div className="flex gap-2">
          <div>End:</div>
          <div>{url.monthly_end_date}</div>
        </div>
        <div className="flex gap-2">
          <div>Months:</div>
          <div>{url.monthly_length}</div>
        </div>
        <div className="flex gap-2">
          <div>Max Price:</div>
          <div>{url.price_max}</div>
        </div>
      </div>
      {urlObject.listingUrls && (
        <div className="p-2 bg-slate-100 rounded-2xl space-x-4">
          {urlObject.listingUrls.split(",").map((listingUrl, i) => (
            <Link
              target="_"
              className="text-blue-600 underline"
              key={i}
              href={listingUrl}
            >
              view listing{" "}
            </Link>
          ))}
        </div>
      )}
      <div className="p-2 bg-slate-100 rounded-2xl space-x-4 text-xs">
        Last Scraped: {formatTimeDifference(urlObject.lastScraped)}
      </div>
    </div>
  );
}

export type AirbnbSearchParams = {
  monthly_start_date?: string;
  monthly_length?: number;
  monthly_end_date?: string;
  price_max?: number;
};

export function parseAirbnbSearchParams(
  queryString: string
): AirbnbSearchParams {
  const urlParams = new URLSearchParams(queryString);
  const start = format(
    new Date(urlParams.get("monthly_start_date") as string),
    "d MMM yyyy"
  );

  const end = format(
    new Date(urlParams.get("monthly_end_date") as string),
    "d MMM yyyy"
  );

  return {
    monthly_start_date: start,
    monthly_length: parseInt(urlParams.get("monthly_length") as string, 10),
    monthly_end_date: end,
    price_max: parseInt(urlParams.get("price_max") as string, 10),
  };
}
