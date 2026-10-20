import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const branch = "agent/remote-legal-development";
const catalog = "preview/development/current.json";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const summary = (text) => {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n");
};
if (
  process.env.GITHUB_ACTIONS !== "true" ||
  process.env.GITHUB_EVENT_NAME !== "push" ||
  process.env.GITHUB_REF !== `refs/heads/${branch}`
)
  throw Error("Development branch push workflow only");
const source = process.env.GITHUB_SHA;
if (!/^[a-f0-9]{40}$/.test(source ?? "") || git("rev-parse", "HEAD") !== source)
  throw Error("Source commit mismatch");
if (git("diff", "--cached", "--name-only"))
  throw Error("Unexpected staged files");
if (
  git("diff", "--name-only")
    .split("\n")
    .filter(Boolean)
    .some((path) => path !== catalog)
)
  throw Error("Unexpected modified source files");
git("fetch", "origin", `refs/heads/${branch}`);
if (git("rev-parse", "FETCH_HEAD") !== source) {
  summary(
    "A newer source commit exists. This run did not publish; the newer run owns publication.",
  );
  process.exit(0);
}
git("add", "--", catalog);
const staged = git("diff", "--cached", "--name-only");
if (!staged) {
  summary(`Catalog is already current for source ${source}.`);
  process.exit(0);
}
if (staged !== catalog)
  throw Error("Only the generated development catalog may be published");
git("config", "user.name", "github-actions[bot]");
git(
  "config",
  "user.email",
  "41898282+github-actions[bot]@users.noreply.github.com",
);
git("commit", "-m", "chore: generate development legal catalog");
// A concurrent push is rejected by git; never overwrite or force-push newer source.
git("push", "origin", `HEAD:refs/heads/${branch}`);
summary(`Published catalog ${git("rev-parse", "HEAD")} from source ${source}.`);
