### MentalOS Magical Agent Roadmap

This document outlines how to evolve Sentimental/MentalOS into a context-aware, playful, and transparent self-discovery OS with agentic flows, third‑party “voices,” provenance, and GitHub‑like history. It is optimized for a 6‑hour hackathon sprint and a 2‑day follow‑up.

## Vision and Principles
- **Context-as-code**: Your mind model lives as Markdown files. The agent learns by updating these files safely, with provenance.
- **Playful transparency**: The agent opens files while answering, highlights new knowledge, and shows “why” via citations.
- **Self-discovery first**: Missing info triggers gentle interviews to fill gaps—no hardcoding; the model grows from you.
- **Many perspectives**: Invite family/partner/friends (“voices”) to answer tailored questions; their input builds your profile.
- **Consent and control**: myKeys governs what is visible to whom, and when.

## Product Modules (URL aliases)
- `myOS` (/myos): Core mind files (AboutMe, identity, patterns, relationships, etc.)
- `myRepo` (/myrepo): History, diffs, provenance, restore points
- `myMirror` (/mymirror): See yourself through others (friend/partner/therapist voices)
- `myKeys` (/mykeys): Permissions, consent, share tokens
- `myStory` (/mystory): Narrative studio and format generation
- `myGraph` (/mygraph): Progress, completeness, trends
- `myLab` (/mylab): What‑ifs and experiments
- `myStack` (/mystack): Integrations and plugins

## Architecture Overview
- Frontend (React + Vite):
  - CodeMirror editor with inline highlight of agent edits
  - Chat pane (per active file) with interview mode
  - “Why” panel displaying citations: which files/lines informed an answer
  - Playful micro‑animations (confetti, unlock toasts)
- Backend (Flask):
  - Knowledge objects validator (JSON Schema) → safe file edits
  - Provenance engine: records “what changed, why, and from where”
  - History snapshots: `.history/<file>/<timestamp>.md`
  - Share/voice links with tokens and gated access rules
  - Agent router orchestrating Q→A→knowledge extraction→missing‑info interviews

## Data Model
- Source of truth: `MentalOS/user_data/<user_id>/*.md`
- Knowledge objects (schema already in `mental_model_schema.json`):
  - `placeholder_update`, `therapist_note`, `summary_update`, `conclusion`, `cross_link`
- Provenance record (new):
  - `{ id, timestamp, user_id, operation, file, section?, from_messages?, from_files?, diff?, confidence }`
- Checkpoints (new):
  - `{ basics_complete: boolean, missing_fields: string[], unlocked_folders: string[], entitlements?: string[] }`

## Agent Orchestration (Core Loops)
1) Answering with receipts (provenance):
   - Receive question → Query knowledge files → If confidence high, synthesize answer with citations to file sections → Open those files in UI and highlight relevant lines → Render “Why” panel.
2) Missing info → Interview:
   - If low coverage/confidence, derive target fields from `knowledge_map.json` → Ask 1–3 playful questions → Produce `placeholder_update` or `summary_update` → Save → Highlight insertions.
3) Third‑party voices (family/partner/friends):
   - Generate tailored question set for a named role (e.g., “partner”) → Create/refresh a `voices/<name>.md` scaffold → Issue share token → Collect responses via `/share/<token>` → Convert to knowledge objects and update relevant files with provenance back to voice source.
4) Therapist mode:
   - Toggle unlocks `TherapistNotes/private.md` → Save `therapist_note` and `conclusion` objects with confidence and evidence.

## Playful UX Behaviors
- Auto‑opening files and smooth scrolling to cited sections when answering “why”.
- Inline diff‑highlights for newly inserted text; fade after a few seconds.
- “Vau” moments: confetti + toast on first‑time field completion or folder unlock.
- Locked folders show a friendly hint: “Finish basics to unlock” + 1‑click “Resume interview”.

## Backend Endpoints (minimal additions)
- Files/history (versioning):
  - `GET /api/mental-os/history/<file>?user_id=...` → `[ {timestamp, summary, size} ]`
  - Snapshots on every successful write to `.history`.
- Checkpoints/gating:
  - `GET /api/mental-os/checkpoints?user_id=...` → `{ basics_complete, missing_fields, unlocked_folders, entitlements? }`
- Provenance:
  - `GET /api/mental-os/provenance/<file>?user_id=...` → recent provenance entries for that file
- Agent ask (with receipts):
  - `POST /api/mental-os/agent/ask` → `{ question, user_id, scope? }` returns `{ answer, citations: [{file, lines, excerpt}], sources: [knowledge_objects_applied] }`
- Voices (extend existing share):
  - `POST /api/mental-os/voices/start` → `{ user_id, label, role }` returns `{ url, file }`
  - `GET/PUT /api/mental-os/share/<token>`: already present; ensure PUT stores raw answer + emits knowledge objects

## Frontend Additions
- Top‑nav modules (myOS/myRepo/myMirror/...): route aliases, not separate apps.
- myRepo: history list for active file + click‑to‑diff using existing `DiffViewer`.
- “Why” panel: contextual side panel rendering `{file, lines, excerpt}`; clicking a citation opens/scrolls the file.
- Discover Me button: starts/resumes interview from `knowledge_map.json` or backend suggestions.
- Counsellor Mode toggle: hides/reveals `TherapistNotes`; “Save therapist note” action in chat footer.
- Voices:
  - “Invite a voice” button in `voices` folder → `POST /voices/start` → show share link.
  - Voice answers appear in a “Pending insights” strip; applying them shows highlights.

## Security and Consent
- Share tokens scoped to specific files/questions; time‑limited; single‑use by default.
- myKeys governs visibility: AboutMe basics may be previewable, deep folders require mutual unlock.
- All provenance records are local by default; no external telemetry without explicit opt‑in.

## Development Tools and Libraries
- Frontend: React 18/19, Vite 7, CodeMirror, DaisyUI/Tailwind, `diff-match-patch`.
- Backend: Flask, `jsonschema`, file snapshots, `patch_engine.py` for safe edits, OpenAI (or hackathon LLMs).
- Optional (stretch): local embeddings for semantic “why” (e.g., `sentence-transformers`), but heuristics suffice during hackathon.

## 6‑Hour Hackathon Milestones (Do first)
1) Baseline loop: run backend + MentalOS app → verify GET/PUT files and chat.
2) Checkpoints: implement `/checkpoints`; lock/unlock folders in UI; show progress chip.
3) History: snapshot on write; `GET /history/<file>`; myRepo history list + diff viewer.
4) Why panel: augment answers with `{citations}`; open/scroll files and highlight cited ranges.
5) Voices: wire “Invite voice” → reuse `/share` → accept PUT responses → convert to `placeholder_update` → apply + highlight.
6) Vau effects: confetti + unlock toasts; achievements appended to `SessionSummaries.md` via `summary_update`.

Deliverable: Ask a question → see answer + citations; if missing, guided interview fills basics → folder unlock → history visible; invite a partner to answer one question → profile updates with provenance.

## 2‑Day Expansion Plan
- Agent router: confidence scoring, field targeting, fallback interviews.
- Rich provenance API + UI timeline per file.
- Counsellor Mode: therapist notes + conclusions with evidence and confidence.
- Reciprocity rule: preview AboutMe only if both parties have basics complete.
- myGraph: simple charts for completeness and file growth.
- myStack: list of integrations; stubs for future plugins.

## Testing Strategy
- Unit: knowledge object application; placeholder replacement; snapshot creation.
- Integration: end‑to‑end flows (ask → cite; missing → interview → update; voice invite → response → update).
- UX: locked → unlock transitions; highlight timing; provenance navigation.

## Demo Script (5 minutes)
1) Fresh user → Discover Me → answer 2 basics → unlock cue.
2) Ask “What makes me happy?” → answer with citations opens files.
3) Show myRepo history and diffs.
4) Toggle Counsellor Mode → add therapist note.
5) Invite partner voice → paste answer → instant profile update with provenance.

---

Keep edits incremental, visible, and reversible. The OS should always show its work: files, diffs, and reasons.


## Adoption, Onboarding, and Playfulness (Added)
- Gentle onboarding: start at `AboutMe.md`, show 2–3 playful icebreaker questions and a visible progress chip.
- “Open while answering”: the agent opens files it cites, autoscrolls, and highlights the exact lines used.
- Micro-rewards: confetti on first field completion, badges for folder unlocks, “streak” nudge for journaling.
- Low‑friction invitations: one click to “Invite a voice” with clear scope (1–3 questions, read‑only preview of basics).
- No dead ends: when data is missing, ask 1–2 focused questions or propose a tiny task (e.g., fill City only).

## Agent → Family/Partner/Friends Flow (Added)
1) User selects topic (e.g., “communication at home”) and target role (partner/friend).
2) Backend drafts 3–5 short, kind questions tailored to the role (from `knowledge_map.json` + context).
3) User sends a scoped link (token limited to the topic and 7 days).
4) Invitee replies in a playful UI (progress, privacy note, approximate time).
5) Backend transforms answers into knowledge objects with provenance tagged `source: voice/<name>`.
6) Frontend shows a “Pending insights” strip; applying them highlights changes and updates history.
7) User can view “Why” for any future answer, seeing which voice informed it.

## Evidence Base, Boundaries, and Safety (Added)
- Grounding principles: reflective listening, motivational interviewing spirit, CBT‑style cognitive restructuring prompts, self‑compassion framing, attachment‑aware reflections.
- Clear boundary: this is a self‑reflection tool, not a diagnostic or crisis service; include visible disclaimer.
- Crisis protocol: detect high‑risk phrases (non‑diagnostic heuristics). If triggered, show supportive copy, crisis resources by region, and disable sharing for that session.
- Therapist collaboration: Counsellor Mode keeps private notes separate; consent gating for what a therapist can view.
- Bias and model limitations: show “Why” + file sources; encourage user edits; never claim certainty.

## Privacy, Consent, and myKeys (Added)
- Consent screens for: (a) storing local files, (b) inviting voices, (c) therapist preview.
- myKeys policy examples:
  - Basics (AboutMe table): previewable with mutual unlock.
  - Deep folders: private by default; explicit grant per folder or per section.
  - Voice scopes: question‑bound, time‑limited, one‑time read.
- Data minimization: ask least necessary questions first; allow redaction before sharing.
- Local‑first default: files remain local unless the user explicitly exports/shares.

## Research Readiness (Added)
- Study framing: reflective journaling + guided questions improve self‑awareness and emotion regulation.
- Suggested measures (pre/post and weekly):
  - Wellbeing: WHO‑5; Mood: PANAS‑SF
  - Anxiety/Depression (optional/consented): GAD‑7, PHQ‑9
  - Self‑concept clarity: SCC scale; Reflective functioning: RFQ‑8 (adapted)
  - Alliance with tool/agent: Working Alliance Inventory – Short Revised (adapted for digital coach)
- Outcomes: completeness scores, engagement (sessions, words), goal progress, perceived insight (single‑item), qualitative reflections.
- Ethics: informed consent, withdrawal anytime, anonymized aggregates, crisis escalation info, data minimization.
- Analysis plan: paired deltas (pre/post), mixed models for longitudinal trajectories, thematic analysis of reflections.

## KPIs and Success Signals (Added)
- Time‑to‑basics complete (<10 minutes median).
- Weekly return rate and 4‑week retention.
- “Why viewed” frequency (trust and transparency proxy).
- Number of adopted insights (edits accepted) and cross‑links created.
- Voice invites sent → responses applied.

## Global and Cultural Readiness (Added)
- Multilingual support: UI and content editable in user’s language; agent respects and mirrors language choice.
- Cultural calibration: role‑ and region‑aware question templates (e.g., collectivist vs individualist norms) selected via locale or user preference.
- Local crisis resources: region‑specific hotline lists and guidance; fallback to WHO/IFRC resources when unknown.
- Consent and norms: myKeys presets for stricter privacy defaults; explainers adapted to cultural expectations for sharing with family/therapists.
- Data and compliance: local‑first by default; optional data residency hints and export; GDPR/CCPA‑friendly patterns.
- Fairness checks: track “Why” usage and correction rates across locales; routine prompt reviews to reduce cultural bias.
- Accessibility & inclusivity: right‑to‑left scripts, font fallbacks, and tone/style adjustments for plain language.

