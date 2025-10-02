import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadRepositoryTable } from "./tablesMapper.mjs";

const enSkinTable = loadRepositoryTable("enSkinTable");
const cnSkinTable = loadRepositoryTable("cnSkinTable");
const cnCharacterTable = loadRepositoryTable("cnCharacterTable")

const isOperator = (charId) => {
  const operator = cnCharacterTable[charId];
  return operator.profession !== "TOKEN" && operator.profession !== "TRAP" && !operator.isNotObtainable;
};

const createSkinsJson = () => {
  const skinObj = {};

  [...Object.values(cnSkinTable.charSkins)].forEach((skin) => {
    if (!isOperator(skin.charId)) return;
    const enSkin = enSkinTable.charSkins[skin.skinId];
    let charId = skin.charId;
    if (charId === "char_002_amiya") {
      charId = skin.skinId.split(/[@#]/)[0];
    }
    skinObj[charId] ??= [];
    skinObj[charId].push({
      skinId: skin.skinId,
      skinName: (enSkin && enSkin.displaySkin.skinName) ?? skin.displaySkin.skinName ?? null,
      avatarId: skin.avatarId,
      sortId: skin.displaySkin.sortId,
    });
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, "..", "src/data");
  const skinsPath = path.join(outDir, "skins.json");
  fs.writeFileSync(skinsPath, JSON.stringify(skinObj, null, 2));
  console.log(`skins: wrote ${skinsPath}`);
};

export default createSkinsJson;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createSkinsJson();
}
