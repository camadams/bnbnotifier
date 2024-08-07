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
}) => (
  <div>
    <p>
      Hi {user.username} !
      <br />
      <br />
      You have an new listing for an area you searched: {airbnbSearchUrl}
      <br />
      <br />
      {getDifference(newScrapedUrlsArr, oldScrapedUrlsArr).map((url, i) => (
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

function getDifference(
  newScrapedUrlsArr: string[],
  oldScrapedUrlsArr: string[]
) {
  const oldScrapedUrlsSet = new Set(oldScrapedUrlsArr);
  return newScrapedUrlsArr.filter((url) => !oldScrapedUrlsSet.has(url));
}

export default EmailTemplate;
