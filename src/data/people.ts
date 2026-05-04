import type { Person } from "../types";

export const PEOPLE: Person[] = [
  { id: "tamir",  name: "Tamir",   nameHe: "תמיר",   role: "Daddy",      roleHe: "אבא",        hue: 32,  skin: "#f3c69a", hair: "#3a2a1c", glasses: true },
  { id: "asaf",   name: "Asaf",    nameHe: "אסף",    role: "Daddy",      roleHe: "אבא",        hue: 200, skin: "#e8b48a", hair: "#1a1108", glasses: false },
  { id: "gili",   name: "Gili",    nameHe: "גילי",   role: "Savta",      roleHe: "סבתא",       hue: 340, skin: "#f0c8a0", hair: "#a06b3a", glasses: true },
  { id: "yossi",  name: "Yossi",   nameHe: "יוסי",   role: "Saba",       roleHe: "סבא",        hue: 220, skin: "#e6b48c", hair: "#cccccc", glasses: true },
  { id: "simcha", name: "Simcha",  nameHe: "שמחה",   role: "Savta",      roleHe: "סבתא",       hue: 280, skin: "#eebc94", hair: "#d8d4c8", glasses: false },
  { id: "maya",   name: "Maya",    nameHe: "מאיה",   role: "Babysitter", roleHe: "בייביסיטר",  hue: 140, skin: "#dca680", hair: "#3a2210", glasses: false },
  { id: "sky",    name: "Sky",     nameHe: "סקיי",   role: "That's me!", roleHe: "זאת אני!",   hue: 180, skin: "#f6d2b0", hair: "#7a4a22", glasses: false, kid: true },
];

const EXTRA: Map<string, Person> = new Map();

export function registerPerson(p: Person): void {
  if (PEOPLE.some((x) => x.id === p.id)) return;
  EXTRA.set(p.id, p);
}

export const byId = (id: string): Person | undefined =>
  PEOPLE.find((p) => p.id === id) ?? EXTRA.get(id);

const SKIN_PALETTE = ["#f3c69a", "#e8b48a", "#f0c8a0", "#e6b48c", "#eebc94", "#dca680", "#f6d2b0", "#d4a07a"];
const HAIR_PALETTE = ["#3a2a1c", "#1a1108", "#a06b3a", "#cccccc", "#d8d4c8", "#3a2210", "#7a4a22", "#5a3a2a"];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function syntheticPerson(slug: string, name: string, role = ""): Person {
  const h = hashCode(slug);
  return {
    id: slug,
    name,
    nameHe: name,
    role,
    roleHe: role,
    hue: h % 360,
    skin: SKIN_PALETTE[h % SKIN_PALETTE.length],
    hair: HAIR_PALETTE[(h >> 3) % HAIR_PALETTE.length],
    glasses: (h & 1) === 1,
  };
}
