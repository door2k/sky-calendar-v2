import { lastDayOfMonth, isFriday, getDay, subDays } from "date-fns";

export function isLastFridayOfMonth(date: Date): boolean {
  if (!isFriday(date)) return false;
  const lastDay = lastDayOfMonth(date);
  let lastFriday = lastDay;
  while (getDay(lastFriday) !== 5) {
    lastFriday = subDays(lastFriday, 1);
  }
  return (
    date.getFullYear() === lastFriday.getFullYear() &&
    date.getMonth() === lastFriday.getMonth() &&
    date.getDate() === lastFriday.getDate()
  );
}

export function isSaturdayLike(date: Date): boolean {
  return getDay(date) === 6 || isLastFridayOfMonth(date);
}
