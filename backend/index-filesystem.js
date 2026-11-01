const fs = require('node:fs/promises');
const path = require('node:path');



async function main() {
  const root = path.resolve(
    process.argv[2] || '/media/pi/hdd1/media/images/aopce',
  );
  const index = await indexFilesystem(root);
  process.stdout.write(`${JSON.stringify(index, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`Unable to index filesystem: ${error.message}`);
  process.exitCode = 1;
});
