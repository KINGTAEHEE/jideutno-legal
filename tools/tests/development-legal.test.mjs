import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  cpSync,
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const project = fileURLToPath(new URL("../../", import.meta.url));
function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "jideutno-legal-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(join(project, "tools"), join(root, "tools"), { recursive: true });
  cpSync(join(project, "preview"), join(root, "preview"), { recursive: true });
  git(root, "init", "-q");
  git(root, "config", "user.name", "test");
  git(root, "config", "user.email", "test@example.invalid");
  git(root, "add", ".");
  git(root, "commit", "-qm", "published baseline");
  return root;
}
const sourcePath = (root) => join(root, "preview/development/source.json");
const catalogPath = (root) => join(root, "preview/development/current.json");
function edit(root, change) {
  const source = JSON.parse(readFileSync(sourcePath(root), "utf8"));
  change(source);
  writeFileSync(sourcePath(root), JSON.stringify(source, null, 2) + "\n");
}
function build(root, ...args) {
  return spawnSync(process.execPath, ["tools/build-development.mjs", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}
function addNotice(root) {
  edit(root, (s) => {
    const n = structuredClone(s.notices[0]);
    n.id = "second";
    n.title = "새 공지";
    n.document.id = "second-r1";
    n.document.path = "notices/second-r1.html";
    s.notices.push(n);
  });
  const html =
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>새 공지</title></head><body><h1>새 공지</h1><p>본문이에요.</p></body></html>\n';
  writeFileSync(join(root, "preview/development/notices/second-r1.html"), html);
  return html;
}
test("generates a newly authored notice with the exact HTML digest and immutable URL", (t) => {
  const root = fixture(t),
    html = addNotice(root);
  assert.equal(build(root, "--base", "HEAD").status, 0);
  const catalog = JSON.parse(readFileSync(catalogPath(root), "utf8"));
  assert.equal(catalog.notices.length, 2);
  assert.equal(
    catalog.notices[1].document.sha256,
    createHash("sha256").update(html).digest("hex"),
  );
  assert.match(catalog.notices[1].document.url, /\/notices\/second-r1\.html$/);
  assert.equal(build(root, "--check", "--base", "HEAD").status, 0);
});
test("allows expiration and withdrawal while preserving published HTML", (t) => {
  const root = fixture(t);
  edit(root, (s) => {
    s.notices[0].endsAt = "2026-10-20T00:00:00Z";
  });
  assert.equal(build(root, "--base", "HEAD").status, 0);
  edit(root, (s) => {
    s.notices = [];
  });
  assert.equal(build(root, "--base", "HEAD").status, 0);
  assert.deepEqual(
    JSON.parse(readFileSync(catalogPath(root), "utf8")).notices,
    [],
  );
});
test("rejects changed or removed published bodies and unversioned content edits", (t) => {
  const root = fixture(t);
  edit(root, (s) => {
    s.notices[0].summary = "바뀐 내용";
  });
  assert.match(
    build(root, "--base", "HEAD").stderr,
    /Increase notice revision/,
  );
  edit(root, (s) => {
    s.notices[0].revision++;
  });
  assert.equal(build(root, "--base", "HEAD").status, 0);
  const p = join(
    root,
    "preview/development/notices/development-notice-20261019-r1.html",
  );
  writeFileSync(p, readFileSync(p, "utf8") + "\n");
  assert.match(build(root, "--base", "HEAD").stderr, /immutable/);
  unlinkSync(p);
  assert.notEqual(build(root, "--base", "HEAD").status, 0);
});
for (const [label, change] of [
  [
    "invalid metadata",
    (s) => {
      s.notices[0].title = "";
    },
  ],
  [
    "invalid platforms",
    (s) => {
      s.notices[0].platforms = ["web"];
    },
  ],
  [
    "invalid schedule",
    (s) => {
      s.notices[0].startsAt = "2026-10-20T09:00:00+09:00";
    },
  ],
  [
    "invalid version range",
    (s) => {
      s.notices[0].minAppVersion = "1.1.2";
      s.notices[0].maxAppVersion = "1.1.1";
    },
  ],
  [
    "duplicate notices",
    (s) => {
      s.notices.push(s.notices[0]);
    },
  ],
])
  test(`rejects ${label} before writing the live catalog`, (t) => {
    const root = fixture(t),
      before = readFileSync(catalogPath(root), "utf8");
    edit(root, change);
    assert.notEqual(build(root).status, 0);
    assert.equal(readFileSync(catalogPath(root), "utf8"), before);
  });
test("handles the first PR whose base has no development source", (t) => {
  const root = fixture(t);
  const original = git(root, "rev-parse", "HEAD");
  git(root, "checkout", "--orphan", "empty");
  git(root, "rm", "-rf", ".");
  writeFileSync(join(root, "README.md"), "Baseline\n");
  git(root, "add", ".");
  git(root, "commit", "-qm", "empty base");
  const base = git(root, "rev-parse", "HEAD");
  git(root, "checkout", "--detach", original);
  assert.equal(build(root, "--base", base).status, 0);
});
function publisher(root, sha, extra = {}) {
  return spawnSync(process.execPath, ["tools/publish-development.mjs"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      GITHUB_STEP_SUMMARY: "",
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_NAME: "push",
      GITHUB_REF: "refs/heads/agent/remote-legal-development",
      GITHUB_SHA: sha,
      ...extra,
    },
  });
}
function remote(t, root) {
  const path = join(root, "remote.git");
  mkdirSync(path);
  git(path, "init", "--bare", "-q");
  git(root, "remote", "add", "origin", path);
  git(
    root,
    "push",
    "-q",
    "origin",
    "HEAD:refs/heads/agent/remote-legal-development",
  );
  return path;
}
test("publishes only the generated catalog to the development branch and then becomes a no-op", (t) => {
  const root = fixture(t);
  edit(root, (s) => {
    s.revision = "development-publish-test";
  });
  git(root, "add", "preview/development/source.json");
  git(root, "commit", "-qm", "edit source");
  const sha = git(root, "rev-parse", "HEAD"),
    origin = remote(t, root);
  assert.equal(build(root).status, 0);
  const result = publisher(root, sha);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Published catalog/);
  assert.equal(
    git(root, "diff", "--name-only", `${sha}..HEAD`),
    "preview/development/current.json",
  );
  assert.equal(
    git(origin, "rev-parse", "refs/heads/agent/remote-legal-development"),
    git(root, "rev-parse", "HEAD"),
  );
  const latest = git(root, "rev-parse", "HEAD");
  assert.match(publisher(root, latest).stdout, /already current/);
});
test("skips a stale source and cannot write to production or from a pull request", (t) => {
  const root = fixture(t),
    origin = remote(t, root),
    old = git(root, "rev-parse", "HEAD");
  edit(root, (s) => {
    s.revision = "newer-source";
  });
  git(root, "add", "preview/development/source.json");
  git(root, "commit", "-qm", "newer source");
  git(
    root,
    "push",
    "-q",
    "origin",
    "HEAD:refs/heads/agent/remote-legal-development",
  );
  const latest = git(root, "rev-parse", "HEAD");
  git(root, "checkout", "--detach", old);
  assert.match(publisher(root, old).stdout, /newer source commit/);
  assert.equal(
    git(origin, "rev-parse", "refs/heads/agent/remote-legal-development"),
    latest,
  );
  assert.notEqual(
    publisher(root, old, { GITHUB_REF: "refs/heads/main" }).status,
    0,
  );
  assert.notEqual(
    publisher(root, old, { GITHUB_EVENT_NAME: "pull_request" }).status,
    0,
  );
});

test("rejects BOM and scripts before publishing a new body", (t) => {
  const root = fixture(t);
  const html = addNotice(root);
  const path = join(root, "preview/development/notices/second-r1.html");
  writeFileSync(path, "\ufeff" + html);
  assert.match(build(root).stderr, /without BOM/);
  writeFileSync(
    path,
    html.replace("</body>", "<script>void 0</script></body>"),
  );
  assert.match(build(root).stderr, /Unsafe document/);
});

test("the guide templates form a valid publishable notice", (t) => {
  const root = fixture(t);
  const entry = JSON.parse(
    readFileSync(join(project, "templates/notice.json"), "utf8"),
  );
  edit(root, (s) => s.notices.push(entry));
  cpSync(
    join(project, "templates/notice.html"),
    join(root, "preview/development", entry.document.path),
  );
  assert.equal(build(root, "--base", "HEAD").status, 0);
});
