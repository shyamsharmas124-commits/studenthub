# Contributing & Git Workflow

## Branching

- `main` — always deployable. Nothing gets pushed here directly.
- `feature/<short-description>` — new features (e.g. `feature/coupon-claiming`)
- `fix/<short-description>` — bug fixes (e.g. `fix/duplicate-email-index`)
- `chore/<short-description>` — tooling, deps, docs, refactors with no behavior change

## Workflow

1. Branch off the latest `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-feature-name
   ```
2. Commit in small, logical chunks. Prefer several small commits over one giant one — it makes review and rollback easier.
3. Write commit messages in the imperative mood, and lead with the "what":
   ```
   Add password change endpoint with current-password verification
   Fix duplicate-email index push failure with cleanup script
   Refactor notification creation to use shared notify() helper
   ```
4. Push and open a PR against `main`. Fill in: what changed, why, and how you tested it.
5. At least a self-review pass before merging: re-read your own diff as if you were reviewing someone else's code.
6. Squash-merge feature branches into `main` to keep history readable; delete the branch after merge.

## Commit message conventions (Conventional Commits, loosely)

```
feat: add sponsored coupon claiming
fix: resolve duplicate email index push failure
chore: add Docker + docker-compose for local dev
docs: document embedding vs referencing decisions
refactor: extract notify() helper for real-time + DB notification writes
```

## Before opening a PR

- [ ] `npm run dev` boots cleanly on both `server` and `client`
- [ ] No secrets committed (`.env` is gitignored — double check `git status` before committing)
- [ ] `npx prisma db push` runs without errors against a dev database
- [ ] New endpoints are added to `API_DOCUMENTATION.md`
- [ ] Checklist in `CHECKLIST.md` reflects reality, not aspiration — only check a box once it's actually shipped and tested
