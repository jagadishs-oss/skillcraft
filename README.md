# Skillcraft

[`learn-from-run`](skills/learn-from-run/SKILL.md) reviews completed agent runs and updates existing skills when a verified recovery or a clearer completion check will help the next run.

## Skill only

Run from a local checkout to install the skill with the [skills CLI](https://www.skills.sh/docs). Give your agent the completed run or relevant excerpt and the target skill directory when invoking it.

```sh
npx skills add . --skill learn-from-run
```

From GitHub, use `npx skills add jagadishs-oss/skillcraft --skill learn-from-run`.

## Automatic learning in Codex

Skillcraft's npm CLI registers a user-level Codex `Stop` hook on macOS and Linux. It requires Node.js 22 or newer. Choose the directory containing the canonical skill sources you want the agent to update.

After the package is published to npm:

```sh
npx @jagadishs-oss/skillcraft install --skills-root /path/to/repo/skills
```

To install the CLI directly from GitHub:

```sh
npx --package=git+https://github.com/jagadishs-oss/skillcraft.git skillcraft install --skills-root /path/to/repo/skills
```

From a local Skillcraft checkout:

```sh
npm ci
npm run build
node dist/cli.cjs install --skills-root ./skills
```

Open `/hooks` in Codex to review and trust the registration. Codex must have write access to the chosen skills directory. The installer preserves other hooks and keeps its runtime in the Codex user directory, so it can run after the npm process exits. Re-run the installer to change the skills root or update the installed runtime. Disable the Skillcraft handler through `/hooks` to stop automatic learning. [Codex hook documentation](https://learn.chatgpt.com/docs/hooks)

The hook requests a learning pass after each normal completed turn. That pass only edits eligible skill Markdown in the chosen directory and reports useful changes. Review them with `git diff` in the source repository.

## Release check

Run `npm ci` and `npm pack --dry-run` to check the package contents. Public npm publication and public GitHub availability are separate release steps.
