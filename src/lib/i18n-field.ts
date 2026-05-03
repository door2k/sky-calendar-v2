export function lf<T extends Record<string, unknown>>(obj: T | null | undefined, field: string, lang: string): string {
  if (!obj) return "";
  if (lang === "he") return (obj[`${field}_he`] as string) || (obj[field] as string) || "";
  return (obj[field] as string) || "";
}
