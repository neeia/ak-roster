import { promises as fs } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACESHIP_ROOT = path.join(__dirname, "../../Arknight-Images");

/**@type {Array<{ sourceDir: string, destDir: string, replace?: (filename: string) => string, filter?: (filename: string) => boolean}>} */
const tasks = [
  {
    sourceDir: path.join(ACESHIP_ROOT, "skills"),
    destDir: "public/img/skills",
    filter: (filename) => filename.endsWith(".png") && filename.startsWith("skill_icon_skchr_"),
    replace: (filename) => filename.replace(/^skill_icon_/, ""),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "avatars"),
    destDir: "public/img/avatars",
    filter: (filename) => /^char_.*\.png$/.test(filename),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "characters"),
    destDir: "public/img/characters",
    filter: (filename) => /^char_.*\.png$/.test(filename),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "equip/icon"),
    destDir: "public/img/equip",
    filter: (filename) => filename.endsWith(".png") && filename !== 'original.png',
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "equip/stage"),
    destDir: "public/img/equip",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "equip/type"),
    destDir: "public/img/equip",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "items"),
    destDir: "public/img/items",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "ui/subclass"),
    destDir: "public/img/subclass",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "factions"),
    destDir: "public/img/factions",
    filter: (filename) => filename.endsWith(".png"),
  },
];

const upload = async (existingFilePaths, task) => {
  let uploadCount = 0;
  const { sourceDir, destDir, replace: replaceFn, filter: filterFn } = task;
  const dirEntries = await fs.readdir(sourceDir, {
    withFileTypes: true,
  });
  const filenames = dirEntries
    .filter((dirent) => dirent.isFile() && (filterFn == null || filterFn(dirent.name)))
    .map((dirent) => dirent.name);
  await fs.mkdir(destDir, { recursive: true });

  //const filename = filenames[0]
  //console.table({sourceDir, destDir, filename})

  await Promise.all(
    filenames.map(async (filename) => {
      const _filename = replaceFn ? replaceFn(filename) : filename;
      const targetFilePath = path.join(destDir, _filename);
      
      const sourceFilePath = path.join(sourceDir, filename);
      const baseName = _filename.replace(/\.png$/, "");
      const sizeFilePath = path.join(destDir, `${baseName}.size`);

      const sourceStats = await fs.stat(sourceFilePath);
      const sourceSize = sourceStats.size;

      let savedSize = null;
      try {
        const sizeContent = await fs.readFile(sizeFilePath, "utf-8");
        savedSize = parseInt(sizeContent.trim(), 10);
      } catch {
        // Size file doesn't exist yet
      }

      if (savedSize === null) {
        // Scenario: Brand new file
        await fs.copyFile(sourceFilePath, targetFilePath);
        await fs.writeFile(sizeFilePath, sourceSize.toString());
        uploadCount += 1;
      } else if (savedSize !== sourceSize) {
        // Scenario: File updated (size changed)
        await fs.copyFile(sourceFilePath, targetFilePath);
        await fs.writeFile(sizeFilePath, sourceSize.toString());
        uploadCount += 1;
        console.log("File changed: ", targetFilePath);
      } else {
        // Scenario: Same size - skip writing PNG entirely, keep cache lean
        //uncomment to again write all png files
        //await fs.copyFile(sourceFilePath, targetFilePath);
        //uploadCount += 1;
      }
    })
  );
  return uploadCount;
};

const uploadAllImages = async () => {
  try {
    const uploadCounts = await Promise.all(
      tasks.map(async (task) => {
        // first iterate through all images in the image directory
        await fs.mkdir(task.destDir, { recursive: true });
        const rawFileNames = await fs.readdir(task.destDir, { withFileTypes: true });
        const existingImageIDs = new Set();
        rawFileNames.forEach((value) => existingImageIDs.add(value));

        // console.log(`images: found ${existingImageIDs.size} existing images in ${task.destDir}.`);

        return upload(existingImageIDs, task);
      })
    );
    const totalUploadCount = uploadCounts.reduce((acc, cur) => acc + cur, 0);
    console.log(`images: found ${totalUploadCount} total files, done.`);
  } catch (e) {
    console.error(e);
  }
};

export default uploadAllImages;

//if (process.argv[1] === fileURLToPath(import.meta.url)) {
uploadAllImages();
//}
