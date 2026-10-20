import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const root = new URL("../preview/development/", import.meta.url);
const base =
  "https://raw.githubusercontent.com/KINGTAEHEE/jideutno-legal/refs/heads/agent/remote-legal-development/preview/development/";
const source = JSON.parse(readFileSync(new URL("source.json", root), "utf8"));
const documents = new Map();
function requireValue(ok, message) {
  if (!ok) throw Error(message);
}
function text(value, max, label) {
  requireValue(
    typeof value === "string" && value.length > 0 && value.length <= max,
    `Invalid ${label}`,
  );
}
function timestamp(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d\d-\d\dT.*Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}
function version(value) {
  return (
    value === null ||
    (typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value))
  );
}
function compareVersion(a, b) {
  const aa = a.split(".").map(Number),
    bb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (aa[i] !== bb[i]) return aa[i] - bb[i];
  return 0;
}
function document(input, expectedKind) {
  requireValue(input && typeof input === "object", "Missing document");
  const { path, ...metadata } = input;
  text(input.id, 100, "document ID");
  text(input.title, 120, "document title");
  requireValue(
    /^[a-zA-Z0-9_-]+$/.test(input.id) && input.kind === expectedKind,
    "Invalid document identity",
  );
  requireValue(
    input.effectiveDate === null ||
      (typeof input.effectiveDate === "string" &&
        /^\d{4}-\d\d-\d\d$/.test(input.effectiveDate)),
    "Invalid document date",
  );
  requireValue(
    typeof path === "string" &&
      /^(documents|notices)\/[a-zA-Z0-9_-]+\.html$/.test(path) &&
      path.endsWith(`/${input.id}.html`),
    "Invalid immutable document path",
  );
  requireValue(
    path.startsWith(expectedKind === "notice" ? "notices/" : "documents/"),
    "Invalid document directory",
  );
  const bytes = readFileSync(new URL(path, root));
  requireValue(
    !bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])),
    "HTML must use UTF-8 without BOM",
  );
  const html = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  requireValue(
    bytes.length <= 512 * 1024 &&
      /<html[\s>]/i.test(html) &&
      /<head[\s>]/i.test(html) &&
      /<body[\s>]/i.test(html) &&
      !/<(?:script|iframe|object|embed|form|input|button|base|link|svg|math|video|audio)\b|\bon\w+\s*=|http-equiv\s*=\s*["']?refresh|javascript\s*:|@import|url\s*\(/i.test(
        html,
      ),
    `Unsafe document: ${path}`,
  );
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  documents.set(path, sha256);
  return { ...metadata, url: base + path, sha256 };
}
requireValue(source.schemaVersion === 1, "Invalid schemaVersion");
text(source.revision, 100, "catalog revision");
requireValue(
  Array.isArray(source.notices) && source.notices.length <= 100,
  "Invalid notices array (maximum 100)",
);
const catalog = {
  schemaVersion: 1,
  revision: source.revision,
  documents: Object.fromEntries(
    ["terms", "privacy", "delete"].map((kind) => [
      kind,
      document(source.documents?.[kind], kind),
    ]),
  ),
  notices: source.notices.map((n) => {
    text(n.id, 100, "notice ID");
    text(n.title, 120, "notice title");
    text(n.summary, 1000, "notice summary");
    requireValue(/^[a-zA-Z0-9_-]+$/.test(n.id), "Invalid notice ID");
    requireValue(
      Number.isSafeInteger(n.revision) && n.revision >= 1,
      "Invalid notice revision",
    );
    requireValue(
      Number.isSafeInteger(n.priority) && n.priority >= 0,
      "Invalid notice priority",
    );
    requireValue(
      timestamp(n.publishedAt) &&
        timestamp(n.startsAt) &&
        (n.endsAt === null ||
          (timestamp(n.endsAt) &&
            Date.parse(n.endsAt) > Date.parse(n.startsAt))),
      "Invalid notice schedule",
    );
    requireValue(
      Array.isArray(n.platforms) &&
        n.platforms.length > 0 &&
        n.platforms.every((p) => ["android", "ios"].includes(p)),
      "Invalid notice platforms",
    );
    requireValue(
      Number.isSafeInteger(n.minProtocol) && n.minProtocol >= 1,
      "Invalid notice minProtocol",
    );
    requireValue(
      version(n.minAppVersion) &&
        version(n.maxAppVersion) &&
        (!n.minAppVersion ||
          !n.maxAppVersion ||
          compareVersion(n.minAppVersion, n.maxAppVersion) <= 0),
      "Invalid notice app version range",
    );
    return { ...n, document: document(n.document, "notice") };
  }),
};
requireValue(
  new Set(catalog.notices.map((n) => n.id)).size === catalog.notices.length,
  "Duplicate notice",
);
const output = JSON.stringify(catalog, null, 2) + "\n";
requireValue(Buffer.byteLength(output) <= 64 * 1024, "Catalog too large");
const baseIndex = process.argv.indexOf("--base");
if (baseIndex !== -1) {
  const ref = process.argv[baseIndex + 1];
  requireValue(
    typeof ref === "string" && ref.length > 0 && !ref.startsWith("-"),
    "Invalid base reference",
  );
  const paths = execFileSync(
    "git",
    [
      "ls-tree",
      "-r",
      "--name-only",
      ref,
      "--",
      "preview/development/documents",
      "preview/development/notices",
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const path of paths) {
    const old = execFileSync("git", ["show", `${ref}:${path}`]);
    requireValue(
      old.equals(readFileSync(new URL(`../${path}`, import.meta.url))),
      `Published content is immutable; add a new ID: ${path}`,
    );
  }
  const hasOldSource = execFileSync(
    "git",
    ["ls-tree", "--name-only", ref, "--", "preview/development/source.json"],
    { encoding: "utf8" },
  ).trim();
  const oldSource = hasOldSource
    ? JSON.parse(
        execFileSync(
          "git",
          ["show", `${ref}:preview/development/source.json`],
          { encoding: "utf8" },
        ),
      )
    : { notices: [] };
  const oldNotices = new Map(oldSource.notices.map((n) => [n.id, n]));
  for (const n of source.notices) {
    const old = oldNotices.get(n.id);
    if (!old) continue;
    requireValue(
      n.revision >= old.revision,
      `Notice revision cannot decrease: ${n.id}`,
    );
    const body = (value) =>
      JSON.stringify({
        title: value.title,
        summary: value.summary,
        document: value.document,
      });
    requireValue(
      body(n) === body(old) || n.revision > old.revision,
      `Increase notice revision for changed content: ${n.id}`,
    );
  }
}
if (process.argv.includes("--check"))
  requireValue(
    readFileSync(new URL("current.json", root), "utf8") === output,
    "Run node tools/build-development.mjs",
  );
else writeFileSync(new URL("current.json", root), output);
console.log(
  `Development catalog verified: ${documents.size} documents, ${catalog.notices.length} notice(s).`,
);
