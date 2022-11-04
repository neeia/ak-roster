import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import enSkinTable from "./ArknightsGameData/en_US/gamedata/excel/skin_table.json" assert { type: "json" };
import cnSkinTable from "./ArknightsGameData/zh_CN/gamedata/excel/skin_table.json" assert { type: "json" };

const createSkinsJson = () => {
  const skinObj = {};

  [...Object.values(cnSkinTable.charSkins)].forEach(skin => {
    const enSkin = enSkinTable.charSkins[skin.skinId];
    skinObj[skin.charId] ??= [];
    skinObj[skin.charId].push({
      op: skin.charId,
      skinId: skin.skinId,
      skinName: (enSkin && enSkin.displaySkin.skinName) ?? skin.displaySkin.skinName,
      sortId: skin.sortId,
    });
  })

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
