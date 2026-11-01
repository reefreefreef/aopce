const fs = require("fs")
const path = require('node:path');

const ffmpeg = require('fluent-ffmpeg');

const pathToWatch = "/media/pi/hdd1/media/images/aopce"

async function checkFs(TLPath) {
     fs.readdir(TLPath, async (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.startsWith(".")) continue

            let fullPath = path.join(TLPath, file)
            if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory() ) {
                await checkFs(fullPath)
            } else {
                await checkImage(fullPath)
            }
            
        }
    });
}

async function checkImage(imagePath) {
    const rawImage = path.parse(imagePath)

    if (rawImage.name.endsWith("_norm") || rawImage.name.endsWith("_thumb")) return 0

    const normImagePath = rawImage.dir+"/"+rawImage.name+"_norm.webp"
    const thumbImagePath = rawImage.dir+"/"+rawImage.name+"_thumb.webp"


    if (!fs.existsSync(normImagePath)) {
        await transcodeImage(imagePath, normImagePath)
    }

    if (!fs.existsSync(thumbImagePath)) {
        await transcodeImage(imagePath, thumbImagePath, 720)
    }

    
}

async function transcodeImage(input, output, maxWidth = 3840) {
  return new Promise((resolve, reject) => {
    const vf = `scale=if(gt(iw\\,${maxWidth})\\,${maxWidth}\\,iw):-2`;
    console.log("transcoding image")
    ffmpeg(input)
      .output(output)
      .outputOptions([
        '-lossless 0',    // lossy
        '-q:v 95',
        '-compression_level 6',
      ])
      .videoFilters(vf)

      .on('end', () => {
        console.log(`${path.parse(input).name} has been transcoded to webp`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error transcoding file: ${err.message}`);
        reject(err);
      })
      .run();
  });
}





async function execute1(delay) {
   await checkFs(pathToWatch)
   setTimeout(() => execute1(delay), delay)
}

execute1(4000)

/*


      const entries = [];
      const pendingDirectories = [''];
    
      while (pendingDirectories.length > 0) {
        const relativeDirectory = pendingDirectories.pop();
        const absoluteDirectory = path.join(root, relativeDirectory);
       
    
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
    
      */