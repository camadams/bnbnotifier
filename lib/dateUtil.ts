import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export function formatTimeDifference(date: Date): string {
  const now = new Date();
  const diffInSeconds = differenceInSeconds(now, date);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = differenceInMinutes(now, date);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = differenceInHours(now, date);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = differenceInDays(now, date);
  return `${diffInDays}d ago`;
}
