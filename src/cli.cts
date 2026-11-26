#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import {
  copyFileSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync,
  statSync, writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const learnerPath = "skills/learn-from-run/SKILL.md";
const usage = "Usage: skillcraft install --skills-root <directory>";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readObject(path: string, missing?: Record<string, unknown>): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (missing && isRecord(error) && error.code === "ENOENT") return missing;
    throw error;
  }
  if (!isRecord(value)) throw new Error(`Expected a JSON object in ${path}`);
  return value;
}

function atomicWrite(path: string, write: (temporaryPath: string) => void): void {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  try {
    write(temporaryPath);
    renameSync(temporaryPath, path);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function writeJson(path: string, data: unknown): void {
  atomicWrite(path, (temporaryPath) => {
    writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  });
}

function shellQuote(path: string): string {
  return "'" + path.replaceAll("'", "'\\''") + "'";
}

function install(directory: string): void {
  if (process.platform === "win32") {
    throw new Error("The hook installer currently supports macOS and Linux.");
  }
  const skillsRoot = realpathSync(directory);
  if (!statSync(skillsRoot).isDirectory()) throw new Error("The skills root must be a directory.");

  const codexHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
  const hooksPath = join(codexHome, "hooks.json");
  let hooksDestination = hooksPath;
  try {
    hooksDestination = realpathSync(hooksPath);
  } catch (error) {
    if (!isRecord(error) || error.code !== "ENOENT") throw error;
  }
  const config = readObject(hooksDestination, {});
  const hooks = config.hooks === undefined ? {} : config.hooks;
  if (!isRecord(hooks)) throw new Error(`Invalid hooks object in ${hooksPath}`);
  const stop = hooks.Stop === undefined ? [] : hooks.Stop;
  if (!Array.isArray(stop)) throw new Error(`Invalid Stop hook list in ${hooksPath}`);

  const runtime = join(codexHome, "skillcraft");
  const installedCli = join(runtime, "dist", "cli.cjs");
  const installedSkill = join(runtime, learnerPath);
  const command = `node ${shellQuote(installedCli)} hook`;
  const registered = stop.some((group: unknown) =>
    isRecord(group) && Array.isArray(group.hooks) &&
    group.hooks.some((handler: unknown) => isRecord(handler) && handler.command === command),
  );

  mkdirSync(dirname(installedCli), { recursive: true });
  mkdirSync(dirname(installedSkill), { recursive: true });
  atomicWrite(installedCli, (temporaryPath) => copyFileSync(__filename, temporaryPath));
  atomicWrite(installedSkill, (temporaryPath) => copyFileSync(join(__dirname, "..", learnerPath), temporaryPath));
  writeJson(join(runtime, "config.json"), { skillsRoot });

  if (!registered) {
    hooks.Stop = [...stop, {
      hooks: [{ type: "command", command, timeout: 5, statusMessage: "Checking for skill improvements" }],
    }];
    config.hooks = hooks;
    writeJson(hooksDestination, config);
  }
  console.log(`Skillcraft hook registered in ${hooksPath}\nSkills root: ${skillsRoot}\nReview and trust it in Codex with /hooks.`);
}

function runHook(): Record<string, unknown> {
  try {
    const event: unknown = JSON.parse(readFileSync(0, "utf8"));
    if (!isRecord(event) || event.hook_event_name !== "Stop" ||
        event.stop_hook_active !== false || event.permission_mode === "plan") return {};

    const runtime = join(__dirname, "..");
    const skill = join(runtime, learnerPath);
    const { skillsRoot } = readObject(join(runtime, "config.json"));
    if (typeof skillsRoot !== "string" || !statSync(skillsRoot).isDirectory() ||
        !statSync(skill).isFile()) return {};

    return {
      decision: "block",
      reason: [
        `Run Skillcraft's end-of-turn learning pass. Read the trusted local skill at ${JSON.stringify(skill)}.`,
        `Follow its automatic-run workflow. The only eligible source root is ${JSON.stringify(skillsRoot)}.`,
        "Review the work that just finished and preserve its result in the final response.",
        "If no eligible skill needs updating, finish without editing.",
      ].join(" "),
    };
  } catch {
    return {};
  }
}

const args = process.argv.slice(2);
try {
  if (args[0] === "hook" && args.length === 1) {
    console.log(JSON.stringify(runHook()));
  } else if (args[0] === "install" && args[1] === "--skills-root" && args.length === 3) {
    install(args[2]);
  } else if (args.length === 0 || (args[0] === "--help" && args.length === 1)) {
    console.log(usage);
  } else {
    throw new Error(usage);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
