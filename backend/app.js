const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const url = require('url');

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const execFileAsync = promisify(execFile);

const app = express();

app.use(cors({ origin: '*' }));

app.use("/", express.static(process.env.FRONTEND));


const APIPATH = "/api"

async function indexFilesystem(root) {
  const entries = [];
  const pendingDirectories = [''];

  while (pendingDirectories.length > 0) {
    const relativeDirectory = pendingDirectories.pop();
    const absoluteDirectory = path.join(root, relativeDirectory);
    const children = await fs.readdir(absoluteDirectory, { withFileTypes: true });

    for (const child of children) {
      const relativePath = path.posix.join(
        relativeDirectory.split(path.sep).join('/'),
        child.name,
      );
      if (path.basename(relativePath).startsWith('.')) {
        continue
      }

      let type = 'other';

      if (child.isDirectory()) {
        type = 'directory';
        pendingDirectories.push(path.join(relativeDirectory, child.name));
      } else if (child.isFile()) {
        type = 'file';
      } else if (child.isSymbolicLink()) {
        type = 'symlink';
      }

      entries.push({ path: relativePath, type });
    }
  }

  entries.sort((left, right) => left.path.localeCompare(right.path));
  return { root, entries };
}

var themes = [];
var gallerys = {};

async function scanDirectory() {

  themes = [];
  gallerys = {};

  const files = (await indexFilesystem("/media/pi/hdd1/media/images/aopce")).entries

  files.forEach(file => {
    if (file.type == "directory") {
      themes.push(file.path)
      gallerys[file.path] = []
    }
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type == "file") {
      let URL = file.path.split("/"),
        theme = URL[0]

      const parsed = path.parse(file.path)
      name = parsed.name

      if (name.endsWith("_norm") || name.endsWith("_thumb")) continue 

      gallerys[theme].push({
        name: name
      })
    }
  }
}

async function execute1(delay) {
   await scanDirectory()
   setTimeout(() => execute1(delay), delay)
}


const cachedMetaData = {}

async function getImageInfo(imageRelativePath) {
  const imagesRoot = path.resolve(process.env.IMAGES);
  const requestedPath = path.resolve(imagesRoot, imageRelativePath);
  const relativePath = path.relative(imagesRoot, requestedPath);
  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  let entries;
  try {
    entries = await fs.readdir(path.dirname(requestedPath), { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  const requestedName = path.basename(requestedPath);
  const requestedStem = path.parse(requestedName).name;
  const sourceImage = entries
    .filter((entry) => {
      if (!entry.isFile()) {
        return false;
      }

      const stem = path.parse(entry.name).name;
      return stem === requestedName ||
        (stem === requestedStem && !stem.endsWith('_norm') && !stem.endsWith('_thumb'));
    })
    .sort((left, right) => left.name.localeCompare(right.name))[0];

  if (!sourceImage) {
    return null;
  }

  const sourcePath = path.join(path.dirname(requestedPath), sourceImage.name);

  if (cachedMetaData[sourcePath]!=null) return cachedMetaData[sourcePath]

  const { stdout } = await execFileAsync('exiftool', ['-IPTC:all', '-EXIF:all', '-json', '-G1', sourcePath]);
  const [metadata] = JSON.parse(stdout);
  if (!metadata || typeof metadata !== 'object') {
    throw new Error(`ExifTool returned no metadata for ${sourcePath}`);
  }

  delete metadata.SourceFile;
  cachedMetaData[sourcePath] = metadata
  return metadata;
}


app.get(APIPATH + '/themes', async function (req, res) {
  res.status(200).json(themes);
});

app.get(APIPATH + '/themes/{*theme}', async function (req, res) {
  const themeName = req.url.split("/")[3]

  if (gallerys[themeName] == null) {
    res.status(404).json({ error: true, message: "theme not found" })
  }
  res.status(200).json(gallerys[themeName]);



});

app.get('/image/{*theme}/{*name}', async function (req, res) {
  const querys = url.parse(req.url, true).query

  if (querys["info"]!=null) {
    try {
      const imageInfo = await getImageInfo(`${req.params.theme[0]}/${req.params.name[0]}`);
      if (imageInfo === null) {
        return res.status(404).json({ error: true, message: "image not found" });
      }

      let metamappings = {"IPTC:Caption-Abstract":"Description","IPTC:By-line":"Photographer"}
      let primaryInfo = {},
        extraInfo = {}

      Object.keys(imageInfo).forEach((e)=>{
        if (metamappings[e]!=null) {
          primaryInfo[metamappings[e]] = imageInfo[e]
        } else {
          extraInfo[e] = imageInfo[e]
        }
      })

      return res.status(200).json({
        primaryInfo:primaryInfo,
        extraInfo:extraInfo
      });
    } catch (error) {
      console.error("Failed to read image IPTC metadata", error);
      return res.status(500).json({ error: true, message: "unable to read image metadata" });
    }
  }

  const thumbReq = querys["thumb"] != null

  res.sendFile(path.join(process.env.IMAGES, `${req.params.theme[0]}/${req.params.name[0]}${thumbReq ? "_thumb" : "_norm"}.webp`));
});

app.get('/{*a}', async function (req, res) {
  res.sendFile(path.join(process.env.FRONTEND, "index.html"));
});



console.log("starting")

execute1(10000)
app.listen(4927);