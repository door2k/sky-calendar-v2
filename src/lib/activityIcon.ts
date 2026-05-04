type IconKey =
  | "music" | "dance" | "swim" | "park" | "gym"
  | "beach" | "pizza" | "art" | "book" | "ball" | "default";

const RULES: { match: RegExp; key: IconKey }[] = [
  { match: /(swim|pool|water)/i, key: "swim" },
  { match: /(dance|ballet|hip[\s-]?hop)/i, key: "dance" },
  { match: /(music|drum|piano|guitar|sing)/i, key: "music" },
  { match: /(gym|exercis|fitness|tumbl|ninja|karate|judo|martial)/i, key: "gym" },
  { match: /(park|playground|outside)/i, key: "park" },
  { match: /(beach|sea|ocean|sand)/i, key: "beach" },
  { match: /(pizza)/i, key: "pizza" },
  { match: /(art|paint|draw|craft)/i, key: "art" },
  { match: /(book|story|read)/i, key: "book" },
  { match: /(soccer|football|ball|basketball)/i, key: "ball" },
];

export function activityIconKey(name: string | null | undefined): IconKey {
  if (!name) return "default";
  for (const r of RULES) if (r.match.test(name)) return r.key;
  return "default";
}
