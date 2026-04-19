#!/bin/bash

# April 13th Commits (4 commits)

# 1
git add server/package.json
GIT_AUTHOR_DATE="2026-04-13T10:00:00" GIT_COMMITTER_DATE="2026-04-13T10:00:00" git commit -m "chore(backend): add nodemon dev script to package.json"

# 2
git add server/src/services/auth.service.ts
GIT_AUTHOR_DATE="2026-04-13T12:00:00" GIT_COMMITTER_DATE="2026-04-13T12:00:00" git commit -m "fix(backend): properly save user fullName during registration"

# 3
git add server/src/services/expense.service.ts
GIT_AUTHOR_DATE="2026-04-13T14:00:00" GIT_COMMITTER_DATE="2026-04-13T14:00:00" git commit -m "feat(backend): implement getMyExpenses service logic for global history"

# 4
git add server/src/controllers/expense.controller.ts server/src/routes/expense.routes.ts
GIT_AUTHOR_DATE="2026-04-13T16:00:00" GIT_COMMITTER_DATE="2026-04-13T16:00:00" git commit -m "feat(backend): expose GET /api/expenses/me endpoint"


# April 14th Commits (5 commits)

# 5
git add server/src/services/settlement.service.ts
GIT_AUTHOR_DATE="2026-04-14T10:00:00" GIT_COMMITTER_DATE="2026-04-14T10:00:00" git commit -m "feat(backend): implement getMySettlements service logic for global history"

# 6
git add server/src/controllers/settlement.controller.ts server/src/routes/settlement.routes.ts
GIT_AUTHOR_DATE="2026-04-14T12:00:00" GIT_COMMITTER_DATE="2026-04-14T12:00:00" git commit -m "feat(backend): expose GET /api/settlements/me endpoint"

# 7
git add src/lib/services.ts
GIT_AUTHOR_DATE="2026-04-14T14:00:00" GIT_COMMITTER_DATE="2026-04-14T14:00:00" git commit -m "feat(frontend): integrate listMine methods for Activity history"

# 8
git add src/routes/activity.tsx src/routeTree.gen.ts
GIT_AUTHOR_DATE="2026-04-14T16:00:00" GIT_COMMITTER_DATE="2026-04-14T16:00:00" git commit -m "feat(frontend): build chronological Activity history page"

# 9
git add src/components/AppShell.tsx
GIT_AUTHOR_DATE="2026-04-14T18:00:00" GIT_COMMITTER_DATE="2026-04-14T18:00:00" git commit -m "fix(frontend): add Activity to nav and fix render phase redirect freeze"

# Push
git push origin main
