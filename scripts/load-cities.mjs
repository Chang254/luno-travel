// Loads GeoNames cities (CC BY 4.0) into the Supabase `cities` table.
//
//   npm run cities:load -- [cities500|cities1000|cities5000|cities15000]
//
// The argument is the minimum-population dump to use (default cities1000).
// Needs `curl`, `unzip` and `psql` on the PATH, and SUPABASE_DB_URL in
// .env.local. Rows are upserted, never deleted, since trips reference them.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DUMP_URL = "https://download.geonames.org/export/dump";
/** Neighbourhoods and historical, abandoned or destroyed places aren't trip destinations. */
const EXCLUDED_FEATURE_CODES = new Set(["PPLX", "PPLH", "PPLQ", "PPLW"]);
const COLUMNS = [
  "id",
  "name",
  "ascii_name",
  "country_code",
  "country_name",
  "region_name",
  "latitude",
  "longitude",
  "population",
];

const dump = process.argv[2] ?? "cities1000";
const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) throw new Error("SUPABASE_DB_URL is not set in .env.local");

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

/** Quoted CSV field; an empty region is left unquoted so `\copy` reads it as NULL. */
function toCsvField(value) {
  if (value === null) return "";
  return typeof value === "number" ? String(value) : `"${value.replaceAll('"', '""')}"`;
}

try {
  execFileSync("unzip", ["-oq", download(`${dump}.zip`), "-d", workDir]);

  const regionNames = new Map(
    readRows(download("admin1CodesASCII.txt")).map(([code, name]) => [code, name]),
  );
  const countryNames = new Map(
    readRows(download("countryInfo.txt")).map((row) => [row[0], row[4]]),
  );

  // Columns: https://download.geonames.org/export/dump/readme.txt
  const rows = readRows(join(workDir, `${dump}.txt`))
    .filter((row) => !EXCLUDED_FEATURE_CODES.has(row[7]))
    .map((row) => {
      const [id, name, asciiName, , lat, lng, , , countryCode, , admin1Code, , , , population] =
        row;
      return [
        Number(id),
        name,
        asciiName || name,
        countryCode,
        countryNames.get(countryCode) ?? countryCode,
        regionNames.get(`${countryCode}.${admin1Code}`) || null,
        Number(lat),
        Number(lng),
        Number(population),
      ];
    });

  const csvPath = join(workDir, "cities.csv");
  writeFileSync(csvPath, rows.map((row) => row.map(toCsvField).join(",")).join("\n"));

  const updates = COLUMNS.slice(1).map((column) => `${column} = excluded.${column}`);
  const sqlPath = join(workDir, "load.sql");
  writeFileSync(
    sqlPath,
    [
      `create temp table cities_staging (
        id bigint, name text, ascii_name text, country_code char(2), country_name text,
        region_name text, latitude double precision, longitude double precision, population bigint
      );`,
      `\\copy cities_staging (${COLUMNS}) from '${csvPath}' with (format csv)`,
      `insert into public.cities (${COLUMNS})
        select ${COLUMNS} from cities_staging
        on conflict (id) do update set ${updates.join(", ")};`,
      `select count(*) as cities from public.cities;`,
    ].join("\n"),
  );

  try {
    execFileSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "--single-transaction", "-f", sqlPath], {
      stdio: "inherit",
    });
  } catch {
    // Rethrown without the command, which contains the database password.
    throw new Error("psql failed; see its output above");
  }
  console.log(`Loaded ${rows.length} cities from ${dump}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
