# DevQuest — Duolingo for Roblox game dev

### Master plan: from zero to production

Working title "DevQuest" (final name pending trademark/domain check). Owner: Tawfeeq. Created 2026-06-12.

---

## 1. Vision & thesis

A habit-forming app that teaches kids (target: ages 10–15) to build real Roblox games through 5-minute daily quests. Duolingo mechanics (streaks, XP, skill path, leagues) wrapped around a payoff loop Duolingo can't match: **lessons culminate in real games, published on Roblox, played by real people.**

- The product sells _becoming a game developer_, not "learning to code."
- The moat is the closed loop with the real toolchain: a Roblox Studio plugin that verifies quests were completed in the kid's actual project.
- Buyer is the parent; user is the kid. Both must love it.

**North-star metric:** weekly active learners who shipped something (published/updated a game in the last 30 days).

---

## 2. Product overview (end state)

1. **Learning app** (web first, mobile later): daily quests, 6 exercise types, skill path, streaks/XP/energy, leagues, parent dashboard.
2. **Studio plugin**: pairs with the account, verifies "do it for real" missions inside Roblox Studio, awards XP, tracks published-game stats.
3. **Showcase loop**: every unit ends in a publishable milestone; the app celebrates live play counts; weekly build challenges with a featured gallery.
4. **AI tutor** (later, premium): explains errors, reviews kid code — Claude-powered, child-safe, parent-visible transcripts.

---

## 3. Phase 0 — Validation (Weeks 1–3, ~$300)

Do not skip. Goal: evidence of pull before writing product code.

- [ ] Lurk + post in Roblox dev communities (DevForum, r/robloxgamedev, Hidden Devs Discord). Catalog the "how do I start scripting?" questions — these are your curriculum and your SEO keywords.
- [ ] Interview 10 parents + 10 kids/teens (friends, local coding clubs, Discord). Key questions: what have they tried, what did they pay for, where did the kid quit, would they pay $10/mo for X.
- [ ] Competitive teardown: official Roblox Creator Hub tutorials, Tynker, Codecademy, Zenva, Code Kingdoms, AlvinBlox/TheDevKing YouTube. Document: none combine habit mechanics + real-toolchain verification. Confirm that's still true.
- [ ] Landing page + waitlist (Carrd/Framer + email capture). Run $150–300 of TikTok/Meta ads targeting parents of 9–14s. Measure conversion.
- [ ] Lock decisions: age band (recommend 10–15), platform order (web → mobile), working name shortlist + domain/trademark availability.

**Exit criteria:** ≥300 waitlist signups OR ≥15 of 20 interviews showing strong pull (parent says "I'd pay today"). If neither, fix positioning before building.

---

## 4. Phase 1 — Legal & business foundation (Weeks 2–4, parallel, ~$1–2k)

- [ ] Form an entity (LLC or local equivalent), business bank account.
- [ ] **COPPA/GDPR-K architecture decision (critical, do this before writing auth code):** parent creates the account and consents; child is a _profile_ under the parent with no email/PII beyond a display name. This single design choice removes most child-privacy risk.
- [ ] One consult with a lawyer experienced in kids' apps (~$500–1k): privacy policy, ToS, consent flow review before public launch.
- [ ] Read Roblox ToS/Community Standards re: plugins, HttpService use, and off-platform links (links to external sites have strict rules — plan the in-Roblox funnel accordingly).
- [ ] Payments: use a merchant of record (Paddle or Lemon Squeezy) — handles global sales tax, sells to the _parent_.
- [ ] Register domain, social handles, file trademark application for the chosen name.

---

## 5. Phase 2 — Curriculum & product design (Weeks 3–8)

The curriculum IS the product. Architecture: **Track → Unit → Lesson → Exercise.**

### Track 1: "Your first game: Obby" (MVP scope, ~30 lessons)

**Unit 1 — Studio basics (7 lessons, no code):** install/navigate Studio; parts and properties; move/scale/rotate; anchoring; color, material, transparency; spawn points; _capstone: build a 5-stage obby layout._

**Unit 2 — First scripts (8 lessons):** what's a script; variables; changing properties from code; print and output window; functions; `Touched` events; if statements; _capstone: kill brick + touch-opened door._

**Unit 3 — Game logic (8 lessons):** loops; debounce (why your door fires 10 times); parameters and arguments; checkpoints and respawn; leaderstats (stage counter); randomness (moving platforms); polish scripting (color cycling); _capstone: full checkpoint system with stage leaderboard._

**Unit 4 — Ship it (7 lessons):** lighting and atmosphere; game icon and thumbnail; game settings and permissions; publishing; updating a live game; getting your first players (safely); reading your stats; _capstone: publish, share, hit 10 plays._

### Exercise types (each lesson = 4–7 exercises, 30–90 seconds each)

1. Fill-in-the-blank code (tap tokens into slots)
2. Order-the-lines (drag to arrange a script)
3. Spot the bug
4. Predict the output (multiple choice)
5. Free-type micro-code (tolerant checker: whitespace/case/quote normalization)
6. **In-Studio mission** ("now do it for real") — honor-system + screenshot in MVP; plugin-verified in Phase 7

### Learning design rules

- ~40% new concept, ~60% review per lesson; spaced-repetition queue for weak skills.
- A "look what I made" moment at least every 3 lessons.
- Reading level: 5th grade. Tone: encouraging, dry-funny, never pandering (teens detect cringe instantly).

### Meta-game spec

- XP per exercise; bonus for no-mistake lessons.
- Streaks with streak freeze (earnable, not just purchasable).
- **Energy** system (recharges daily) rather than punitive hearts — kinder for kids; premium = unlimited.
- Badges tied to _real_ milestones: "First script," "First publish," "First 10 players."
- Leagues/friends: Phase 7, not MVP.

### Design

- Brand: name, mascot (ownable character — e.g., a robot blacksmith), bright-but-not-babyish palette.
- Design in code with a strong component system (faster than Figma for a solo dev with AI); ~15 core screens.
- Sound effects and micro-animations are NOT optional — juice drives kid retention.

### Content pipeline

- Lessons authored as JSON files in the repo, validated by a schema, rendered by one lesson player.
- Internal previewer page to review lessons quickly.
- Workflow: AI drafts lessons → human (you, later a teacher contractor) reviews every kid-facing word.

---

## 6. Phase 3 — Architecture & stack decisions (Weeks 5–6)

**Web-first PWA.** Rationale: app-store kids-category review is heavy, web ships fastest, parents pay on web (no 30% store cut). Mobile (Expo/React Native or Capacitor wrapper) after PMF.

| Layer            | Choice                                  | Notes                                                                                                            |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend         | Next.js + TypeScript + Tailwind         | App Router; Zustand + React Query                                                                                |
| Backend/DB       | Supabase (Postgres, Auth, RLS, Storage) | Parent = auth user; child = profile row. RLS everywhere.                                                         |
| Code checking    | Static normalization/AST-lite in MVP    | Do NOT build a Luau sandbox in week 1. Phase 7: Luau→WASM (Luau is open source) or server-side sandboxed runner. |
| Payments         | Paddle or Lemon Squeezy                 | Merchant of record; parent-facing only                                                                           |
| Analytics        | PostHog                                 | No ad trackers on child surfaces; COPPA-safe config                                                              |
| Email            | Resend/Loops                            | Parent emails only, never the child                                                                              |
| Errors/uptime    | Sentry + a basic uptime monitor         |                                                                                                                  |
| Hosting          | Vercel + Supabase                       | <$100/mo until real scale                                                                                        |
| Studio plugin    | Luau plugin via Creator Store           | Pairs via short code; HttpService → backend API; reads place structure to verify missions                        |
| AI tutor (later) | Claude API                              | Strict child-safety system prompt, topic filtering, parent-visible transcripts                                   |

**Core data model:** `parents` (auth) → `child_profiles` → `progress` / `streaks` / `xp_events`; content: `tracks` → `units` → `lessons` → `exercises` (content itself versioned in repo JSON, IDs referenced by progress rows); `capstone_submissions`; `subscriptions`.

---

## 7. Phase 4 — MVP build (Weeks 7–18)

Scope discipline: Track 1 only, 6 exercise types, streak+XP+energy, parent/child accounts, capstone submission, parent progress email. NO leagues, NO plugin, NO AI tutor, NO mobile apps.

- **W1–2:** repo + CI, design system, auth (parent + child profiles, COPPA flow), lesson JSON schema + player rendering 2 exercise types.
- **W3–4:** all 6 exercise types; full lesson flow (energy, mistakes, XP award screen); streak system with local-timezone day boundaries.
- **W5–6:** skill-path home screen; progress persistence; onboarding + placement ("played Roblox before?"); sounds/animations.
- **W7–8:** content sprint — Units 1–2 authored, reviewed, playtested; internal previewer.
- **W9–10:** Units 3–4; capstone flow (publish walkthrough + submission form + manual review queue); parent dashboard v1 + weekly email.
- **W11:** polish, empty states, error handling, text-input moderation (any free text a kid enters), rate limiting.
- **W12:** private alpha — 10–20 kids, watch sessions, instrument funnels, fix bleeding.

Budget if contracting: designer $3–8k, teacher/curriculum reviewer $1–2k. Solo + AI: mostly time.

---

## 8. Phase 5 — Beta (Weeks 19–26)

- Recruit 100–300 families: waitlist, coding clubs, 2–3 micro-influencer shoutouts ($200–500 each).
- Weekly cohort review; rewrite the worst drop-off lesson every week (this loop is Duolingo's actual secret).
- Build **Studio plugin v1** during beta (pairing + 3 verifiable missions) — it's the wow for launch.
- Pricing research with beta parents: target $8–12/mo or $60–90/yr family plan; fake-door test annual.

**Gate to launch:** D1 ≥ 55%, D7 ≥ 30%, D30 ≥ 15%; lesson completion ≥ 80%; Unit 2 capstone ≥ 40%; unprompted "my kid asks to play it" quotes.

---

## 9. Phase 6 — Launch (Months 7–8)

- Free tier: limited daily energy. Premium: unlimited + parent reports + (soon) plugin missions and AI tutor.
- Channels, in order of expected ROI:
  1. **Roblox dev YouTube/TikTok creators** — sponsorships; exactly-right audience, underpriced.
  2. Waitlist + beta families (referral incentive: streak freezes / a premium month).
  3. Parent communities: Facebook groups, homeschool networks, "screen time guilt" angle.
  4. SEO: "how to make a Roblox game" cluster — huge volume; start publishing in beta.
  5. Product Hunt / HN for buzz (secondary).
- **In-Roblox funnel experiment:** a free obby where gates are code puzzles; promote the app on parent-facing surfaces and social (respect Roblox link rules). Tracked promo codes.
- 60-day goals: 5,000 registered families, 3–5% paid conversion, D30 holding ≥ 15%.

---

## 10. Phase 7 — Growth (Months 9–18)

- Studio plugin GA; "real mission" tracks: tower defense, tycoon, multiplayer basics.
- Leagues + friends; weekly build challenges with featured gallery (moderated).
- AI tutor (premium): error explainer + project code review; safety rails + parent transcript visibility.
- Mobile apps (Expo) once web PMF is proven; kids-category/app-review compliance.
- B2B tier: clubs/schools — classroom dashboard, seat licenses ($5–8/seat/mo).
- Localization: Brazil + SEA are massive Roblox markets.
- Hiring order: founding engineer → curriculum lead → community manager → growth.
- Optional seed raise once D30 ≥ 20% with paying users; otherwise bootstrap.

---

## 11. Phase 8 — Production hardening (continuous from launch)

- Security: RLS audit, dependency scanning, secrets management, rate limits, pen test before scale.
- Compliance: lawyer-reviewed COPPA audit, privacy policy, ToS; GDPR-K/UK AADC if serving EU/UK; data retention + deletion policy; "delete my child's data" flow.
- Reliability: backups + restore drills, status page, on-call basics.
- Support: parent help center, refunds, abuse reporting; human review queue for all UGC (names, submissions).

---

## 12. Budget summary (bootstrap path)

| Stage                                    | Cost                                   |
| ---------------------------------------- | -------------------------------------- |
| Validation + legal                       | $1.5–3k                                |
| MVP (with design/curriculum contractors) | $5–10k                                 |
| Beta + launch marketing                  | $3–6k                                  |
| Running costs pre-scale                  | <$100/mo                               |
| **Total to launched product**            | **~$10–20k + 6–8 months focused time** |

---

## 13. Top risks & mitigations

1. **Roblox platform risk** (API/plugin/ToS changes, or they build it): move fast, own the parent relationship + curriculum brand; long-term hedge = same loop on Godot/UEFN.
2. **COPPA misstep:** parent-account architecture from day 1 + one legal review before launch.
3. **Churn cliff at difficulty spikes:** weekly worst-lesson rewrite ritual; dense "I made a thing" moments.
4. **Creator marketing flops:** diversify across 5+ small creators before betting big on one.
5. **Solo-founder burnout:** strict MVP scope; everything in this plan marked Phase 7+ stays out of the MVP.

---

## 14. Division of labor

**Claude (in Claude Code) can build:** the entire web app, lesson schema + player, all draft curriculum content, Studio plugin, in-Roblox funnel experience (via Studio MCP), parent emails, marketing site, SEO articles, analytics wiring.

**Founder must do:** entity/legal/banking, payment-provider KYC, final review of every kid-facing word, user interviews, creator outreach + relationships, alpha/beta recruitment, watching real kids use it.

---

## 15. Implementation prompt sequence

Run these one per session/milestone, in order. Each assumes this file exists at `D:\Roblox Tests\DEVQUEST_PLAN.md`.

**M1 — Core product skeleton:** see kickoff prompt in section 16.

**M2 — Content engine + Track 1:** "Following DEVQUEST_PLAN.md section 5, author the complete Track 1 curriculum (all 4 units, 30 lessons) as lesson JSON files, build the internal previewer page, and playtest each lesson by rendering it. Flag any lesson where an exercise type doesn't fit the concept."

**M3 — Accounts, persistence, COPPA flow:** "Implement Supabase auth per DEVQUEST_PLAN.md sections 4 and 6: parent signup with consent flow, child profiles (display name only), RLS policies, progress/streak/XP persistence, and the parent dashboard with weekly-email template. Include tests for the RLS policies."

**M4 — Studio plugin v1:** "Build the Roblox Studio plugin per DEVQUEST_PLAN.md section 6: account pairing via short code, backend endpoints, and verification for 3 missions from Unit 2 (kill brick, touch-door, checkpoint). Use the Roblox Studio MCP to build and test it live in Studio."

**M5 — Payments + launch site:** "Integrate Lemon Squeezy subscriptions (parent-facing, free tier with daily energy vs premium unlimited) and build the marketing/landing site with waitlist import, per DEVQUEST_PLAN.md sections 8–9."

**M6 — Hardening:** "Do a pre-launch pass per DEVQUEST_PLAN.md section 11: security review of RLS and API routes, rate limiting, error tracking, moderation queue for user text, backup strategy, and a load test of the lesson API."

---

## 16. M1 kickoff prompt (the exact prompt)

> Read D:\Roblox Tests\DEVQUEST_PLAN.md, then start Milestone 1: build the core product skeleton in a new folder `D:\Roblox Tests\devquest`.
>
> - Next.js + TypeScript + Tailwind, git repo, runnable locally. No auth or payments yet — single local demo profile.
> - Define the lesson content JSON schema (tracks → units → lessons → exercises) supporting all 6 exercise types from plan section 5, with a validator.
> - Build the lesson player: one exercise per screen, progress bar, energy, mistake handling, XP award screen, streak counter — Duolingo-style flow, kid-friendly bright design, with sound/animation hooks stubbed.
> - Build the skill-path home screen (units as a vertical path, locked/current/done states) reading from the content files.
> - Author Unit 2 lesson 6 ("Touched events") as real reviewed-quality content so the loop is testable end to end.
> - Verify by running the app and completing the lesson yourself; show me how to run it; commit milestone as you go.
