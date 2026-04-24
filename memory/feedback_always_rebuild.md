---
name: Always rebuild after JSX changes
description: Never tell the user to rebuild manually — always run docker compose up -d --build automatically after any JSX/frontend change
type: feedback
---

Always run `docker compose up -d --build` immediately after making any JSX/frontend changes, followed by migrate + config:cache + route:cache. Never leave it as an instruction for the user to run themselves.

**Why:** User explicitly said "never say this always run after changes" when I listed JSX rebuild as a pending manual step.

**How to apply:** Any time a .jsx, .css, or frontend asset file is changed, immediately trigger the rebuild as part of the same task — do not defer it or describe it as a step for the user.
