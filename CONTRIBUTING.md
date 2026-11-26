# Contributing to Skillcraft

Anyone can open an issue or pull request. Share what you tried, what the agent did, and what a better result would look like. A small, reproducible example helps reviewers check the change.

## Skills

- Put each skill in `skills/<skill-name>/SKILL.md`. Follow the [Agent Skills specification](https://agentskills.io/specification), and keep optional references and scripts inside the skill directory.
- Try a representative prompt and check that the skill is discoverable with `npx skills add . --list`.
- For changes based on an agent run, describe the original failure and the expected result after the change. Use redacted or synthetic examples.

## Tooling and evaluations

- Explain which agent or workflow the change improves and how someone else can reproduce the result.
- For changes to the TypeScript installer, run `npm ci`, `npm run build`, and `npm pack --dry-run`.
- In the pull request, describe the change and the checks you ran.

By submitting a contribution, you agree to license it under the project's [MIT License](LICENSE). Only submit material you have permission to share.
