// Builds server/data/cities.json from the GeoNames dump (CC BY 4.0).
//
//   npm run cities:build -- [cities500|cities1000|cities5000|cities15000]
//
// The argument is the minimum-population dump to use (default cities5000).
// Needs `curl` and `unzip` on the PATH.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DUMP_URL = "https://download.geonames.org/export/dump";
/** Neighbourhoods and historical, abandoned or destroyed places aren't trip destinations. */
const EXCLUDED_FEATURE_CODES = new Set(["PPLX", "PPLH", "PPLQ", "PPLW"]);

const dump = process.argv[2] ?? "cities5000";
const outPath = join(import.meta.dirname, "../server/data/cities.json");
const workDir = mkdtempSync(join(tmpdir(), "geonames-"));

function download(file) {
  const target = join(workDir, file);
  execFileSync("curl", ["-fsSL", "-o", target, `${DUMP_URL}/${file}`]);
  return target;
}

function readRows(path) {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("\t"));
}

try {
  execFileSync("unzip", ["-oq", download(`${dump}.zip`), "-d", workDir]);

  const admin1Names = new Map(
    readRows(download("admin1CodesASCII.txt")).map(([code, name]) => [code, name]),
  );

  // Columns: https://download.geonames.org/export/dump/readme.txt
  const cities = readRows(join(workDir, `${dump}.txt`))
    .filter((row) => !EXCLUDED_FEATURE_CODES.has(row[7]))
    .map((row) => {
      const [id, name, asciiName, , lat, lng, , , countryCode, , admin1Code, , , , population] =
        row;
      return [
        Number(id),
        name,
        asciiName === name ? "" : asciiName,
        countryCode,
        admin1Names.get(`${countryCode}.${admin1Code}`) ?? "",
        Number(lat),
        Number(lng),
        Number(population),
      ];
    })
    .sort((a, b) => b[7] - a[7]);

  writeFileSync(outPath, `${JSON.stringify(cities)}\n`);
  console.log(`Wrote ${cities.length} cities from ${dump} to ${outPath}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
