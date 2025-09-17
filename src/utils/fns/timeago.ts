export default function getTimeAgo(dateLike: string | Date, locale = "en-US") {
  const now = Date.now();
  const t = new Date(dateLike).getTime();
  const diff = t - now; // ms (note: negative => past)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const s = Math.round(diff / 1000);
  if (Math.abs(s) < 60) return rtf.format(Math.round(s), "second");

  const m = Math.round(diff / (1000 * 60));
  if (Math.abs(m) < 60) return rtf.format(m, "minute");

  const h = Math.round(diff / (1000 * 60 * 60));
  if (Math.abs(h) < 24) return rtf.format(h, "hour");

  const d = Math.round(diff / (1000 * 60 * 60 * 24));
  if (Math.abs(d) < 7) return rtf.format(d, "day");

  // fallback to short date
  return new Date(t).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}
