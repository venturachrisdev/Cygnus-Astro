/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
import { readFileSync, writeFileSync } from 'fs';

function main() {
  const ngc = readFileSync('ngc_catalog.json').toString();
  const messier = readFileSync('messier.json').toString();

  const ngcCatalog = JSON.parse(ngc);
  const messierCatalog = JSON.parse(messier);

  const newNGC = [];

  for (const ngc of ngcCatalog) {
    let found = false;
    for (const mes of Object.values(messierCatalog.data)) {
      const { NGC, name, rightAscension } = mes;
      if (
        (NGC && ngc.Name === NGC.replace(/ /g, '')) ||
        rightAscension === ngc.RA
      ) {
        const names = `${
          ngc['Common names'] ? `${ngc['Common names'].trim()},` : ''
        }${name
          .split(',')
          .map((i) => i.trim())
          .join(',')}`;
        console.log(names);
        newNGC.push({
          ...ngc,
          'Common names': names,
        });
        found = true;
      }
    }

    if (!found) {
      newNGC.push(ngc);
    }
  }

  writeFileSync('ngc.json', JSON.stringify(newNGC, null, 2));
}

main();
