import seeds from "data/usernames/name-seeds.json";

const rEl = (arr: any[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function randomName() {
  const rn = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  const rs = Math.random().toString(36).substring(2, 4);
  const genName = `${rEl(seeds.adjectives)}-${rEl(seeds.colors)}-${rEl(seeds.animals)}-${rn}${rs}`;
  return genName.substring(0, 32);
}
