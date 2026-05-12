export type Lang = "en" | "he";

export interface Theme {
  name: string;
  nameHe: string;
  paper: string;
  paperDeep: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accent2: string;
  halo: string;
  cardBg: string;
  cardBorder: string;
  fridayAccent: string;
  fontHead: string;
  fontBody: string;
  dayTints: [string, string, string, string, string, string, string];
  sticker: string;
  motif: "paw" | "heart" | "web" | "star" | "snowflake";
  mascots?: string[];
  decorChars?: string[];
}

export interface Person {
  id: string;
  name: string;
  nameHe: string;
  role: string;
  roleHe: string;
  hue: number;
  skin: string;
  hair: string;
  glasses: boolean;
  kid?: boolean;
  avatarUrl?: string;
  avatarUrl2?: string;
}

export interface Activity {
  id?: string;
  name: string;
  nameHe: string;
  at: string;
  where: string;
  icon: string;
  withSlugs?: string[];
}

export interface Day {
  day: string;
  dayHe: string;
  date: string;
  dateHe: string;
  dateIso?: string;
  dropoff?: { by: string; at?: string };
  gan?: { label: string; labelHe: string };
  after?: Activity | null;
  pickup?: { by: string; at?: string };
  bedtime?: { by: string };
  dinner?: { host: string; at: string; where: string; whereHe?: string };
  notes?: string;
  notesHe?: string;
  isFriday?: boolean;
  isSaturday?: boolean;
  noGan?: boolean;
  noGanReason?: string;
  noGanReasonHe?: string;
  activities?: Activity[];
  recurring?: Activity[];
}
