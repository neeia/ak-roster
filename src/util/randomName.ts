import seeds from "data/usernames/name-seeds.json";

const rEl = (arr: any[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function randomName() {
  const rn = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const genName = `${rEl(seeds.adjectives)}-${rEl(seeds.animals)}-${rn}`;
  return genName;
}
