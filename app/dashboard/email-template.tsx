import { User } from "lucia";
import * as React from "react";

interface EmailTemplateProps {
  user: User;
  airbnbSearchUrl: string;
  oldScrapedUrlsArr: string[];
  newScrapedUrlsArr: string[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  user,
  airbnbSearchUrl,
  oldScrapedUrlsArr,
  newScrapedUrlsArr,
}) => {
  const newListings = getDifference(newScrapedUrlsArr, oldScrapedUrlsArr);
  const newListingsCount = newListings.length;

  return (
    <div>
      <p>
        Hi {user.username}!
        <br />
        <br />
        You have {newListingsCount} new listing{newListingsCount !== 1 ? 's' : ''} for <a href={airbnbSearchUrl} target="_">an area you searched</a>
        <br />
        <br />
        {newListings.map((url, i) => (
          <div key={i}>
            <a href={url} target="_">
              View listing
            </a>
            <br />
          </div>
        ))}
        <br />
        Kind regards,
        <br />
        Cam The Human
      </p>
    </div>
  );
};

function getRoomId(url: string): string | null {
  const match = url.match(/\/rooms\/(\d+)/);
  return match ? match[1] : null;
}

function getDifference(
  newScrapedUrlsArr: string[],
  oldScrapedUrlsArr: string[]
) {
  const oldScrapedIdsSet = new Set(oldScrapedUrlsArr.map(getRoomId));
  return newScrapedUrlsArr.filter((url) => {
    const roomId = getRoomId(url);
    return roomId && !oldScrapedIdsSet.has(roomId);
  });
}
export default EmailTemplate;
