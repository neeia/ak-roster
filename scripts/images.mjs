import { promises as fs } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACESHIP_ROOT = path.join(__dirname, "../../AN-EN-Tags");


/**@type {Array<{ sourceDir: string, destDir: string, replace?: (filename: string) => string, filter?: (filename: string) => boolean}} */
const tasks = [
  {
    sourceDir: path.join(ACESHIP_ROOT, "img/skills"),
    destDir: "public\\img\\skills",
    filter: (filename) => filename.endsWith(".png"),
    replace: (filename) => filename.replace(/^skill_icon_/, ""),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "img/avatars"),
    destDir: "public\\img\\avatars",
    filter: (filename) => /^char_[^_]+_[^_]+(_\d+\+?)?\.png$/.test(filename),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "img/equip/icon"),
    destDir: "public\\img\\equip",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "img/equip/stage"),
    destDir: "public\\img\\equip",
    filter: (filename) => filename.endsWith(".png"),
  },
  {
    sourceDir: path.join(ACESHIP_ROOT, "img/equip/type"),
    destDir: "public\\img\\equip",
    filter: (filename) => filename.endsWith(".png"),
  },
  //{
  //  sourceDir: `${ACESHIP_ROOT}/img/items`,
  //  destDir: "public\\img\\items",
  //  filter: (filename) => filename.endsWith(".png"),
  //},
];

const upload = async (existingFilePaths, task) => {
  let uploadCount = 0;
  const { sourceDir, destDir, replace: replaceFn, filter: filterFn } = task;
  const dirEntries = await fs.readdir(sourceDir, {
    withFileTypes: true,
  });
  const filenames = dirEntries
    .filter(
      (dirent) => dirent.isFile() && (filterFn == null || filterFn(dirent.name))
    )
    .map((dirent) => dirent.name);
  await fs.mkdir(destDir, { recursive: true })

  //const filename = filenames[0]
  //console.table({sourceDir, destDir, filename})

  await Promise.all(
    filenames.map(async (filename) => {
      const targetFilePath = path.join(
        destDir,
        replaceFn ? replaceFn(filename) : filename
      );
      if (targetFilePath && !existingFilePaths.has(replaceFn ? replaceFn(filename) : filename)) {
        console.log(
          `images: "${targetFilePath}" not found in storage, saving...`
        );
        const sourceFilePath = path.join(sourceDir, filename);
        //console.table({sourceFilePath, targetFilePath});
        await fs.copyFile(sourceFilePath, targetFilePath);
        uploadCount += 1;
      }
    })
  );
  return uploadCount;
};

const uploadAllImages = async () => {
  // first iterate through all images in the image directory
  const rawDirInfo = await fs.readdir("./public/img/", { withFileTypes: true });
  const directoryInfo = rawDirInfo.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
  const existingImageIDs = new Set();
  while (directoryInfo.length > 0) {
    const dirName = directoryInfo.pop();
    const rawFileNames = await fs.readdir("./public/img/" + dirName)
    rawFileNames.forEach(value => existingImageIDs.add(value))
  }
  
  console.log(
    `images: found ${existingImageIDs.size} existing images in project.`
  );

  try {
    const uploadCounts = await Promise.all(
      tasks.map((task) => upload(existingImageIDs, task))
    );
    const totalUploadCount = uploadCounts.reduce((acc, cur) => acc + cur, 0);
    console.log(`images: uploaded ${totalUploadCount} new files, done.`);
  } catch (e) {
    console.error(e);
  }
};

export default uploadAllImages;

//if (process.argv[1] === fileURLToPath(import.meta.url)) {
  uploadAllImages();
//}