# Skillcraft

Skillcraft is an open-source project for improving AI agents and their skills. It welcomes reusable skills, tools for building and improving them, and evaluations that show how agents behave in real workflows.

## Skills

[`learn-from-run`](skills/learn-from-run/SKILL.md), the first skill in the collection, reviews completed runs and updates existing skills when a verified recovery or a clearer completion check will help the next run.

Install it with the [skills CLI](https://www.skills.sh/docs). Give your agent the completed run or relevant excerpt and the target skill directory when invoking it.

```sh
npx skills add jagadishs-oss/skillcraft --skill learn-from-run
```

## Tools

### Automatic learning in Codex

Skillcraft's npm CLI registers a user-level Codex `Stop` hook on macOS and Linux. It requires Node.js 22 or newer. Choose the directory containing the canonical skill sources you want the agent to update.

Install from npm once the release is approved:

```sh
npx @jagadish-oss/skillcraft install --skills-root /path/to/repo/skills
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

## Contributing

Anyone can propose a new skill, improve an existing one, or contribute tooling or an evaluation. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to submit a change and verify it.

## License

Skillcraft is available under the [MIT License](LICENSE).
