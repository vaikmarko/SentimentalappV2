### MentalOS: Product Overview for Academic Validation and Pilot

Audience: Mental‑health professor and research partners at Tallinn University. Purpose: evaluate conceptual soundness, ethics, and feasibility for a class pilot (~80 participants).

## What MentalOS Is
MentalOS is a personal, private self‑discovery workspace where people map aspects of their mind into simple Markdown files and interact with a transparent AI agent. The agent helps reflect, asks tailored questions, and updates files with clear citations and version history. Users can optionally invite a partner/friend/therapist to contribute perspectives through scoped, consented “voice” links.

## Key Experiences
- Guided self‑reflection: bite‑sized interviews fill foundational fields (name, age, role, location, relationship status) and unlock deeper areas (values, habits, relationships, history, goals).
- Answer with “Why”: When asked a question (e.g., “Why am I stuck?”) the agent cites specific files/lines; the UI auto‑opens and highlights the sources.
- Multiple perspectives: Invite a partner/friend/therapist to answer a few questions; their input updates relevant files with provenance (“from Partner voice”).
- Versioned growth: Every change is snapshotted; users can view diffs and restore points like a GitHub for the mind.

## Scientific Rationale (brief)
- Reflective journaling and structured questioning are associated with increased self‑awareness and wellbeing.
- Transparency (provenance) can build trust and promote corrective edits, reducing hallucination harm from LLMs.
- Multiple‑perspective reflection (partner/friend) supports perspective taking and social context awareness.
- Therapist collaboration with clear consent boundaries enables feedback loops without replacing clinical care.

## Boundaries and Safety
- MentalOS is a reflective tool, not diagnostic or crisis care.
- Crisis protocol: high‑risk expression triggers a supportive prompt with crisis resources; sharing is disabled for that session.
- Consent controls (myKeys):
  - Basics preview possible with mutual unlock.
  - Deep folders require explicit user grants.
  - Voice links are scoped to a topic, time‑limited, and default single‑use.

## What Data Exists and Where
- Local Markdown files under `MentalOS/user_data/<user_id>`. Default is local‑first.
- Each update records provenance: what changed, where it came from, and confidence.
- Users can export or delete their data at any time.

## Pilot Proposal (80 students)
- Duration: 2–4 weeks.
- Arms: single‑group pre/post with weekly check‑ins.
- Onboarding: 5–10 minutes to complete basics and unlock first folder.
- Weekly flow: one reflective session (10–15 minutes) and one perspective invite.
- Measures:
  - Pre/post: WHO‑5, PANAS‑SF; optional GAD‑7, PHQ‑9 (consented); SCC; RFQ‑8 (adapted); alliance metric (adapted WAI‑SR for digital coach).
  - Weekly: perceived insight (single‑item), session helpfulness (1–5), goal progress (1–5), qualitative reflection (2–3 sentences).
  - System metrics: completeness %, number of edits accepted, “Why” views, invites sent/applied, retention.
- Ethics: informed consent and withdrawal; anonymized analysis; crisis resources provided; no therapist access without explicit consent.

## Example Student Flow
1) Student completes basics (AboutMe) and unlocks “values”.
2) Student asks: “What makes me happy?” Agent cites `AboutMe.md` and `interests-passions.md` and opens them.
3) Student invites a friend for 3 questions about “how I communicate.” Friend responds; updates appear with highlights and provenance.
4) Student views myRepo history to see how their understanding has changed over time.

## Implementation Snapshot
- Frontend: React + Vite, CodeMirror editor, chat panel, “Why” panel, playful toasts/confetti.
- Backend: Flask, knowledge‑object schema validation, file snapshots, provenance logs, share endpoints.

## Risks and Mitigations
- Model errors → Mitigation: show sources, encourage edits, keep tone suggestive not prescriptive.
- Privacy concerns → Mitigation: local‑first storage, explicit consent gates, scoped tokens.
- Over‑reliance on AI → Mitigation: position as reflective companion; encourage human support when needed.

## What We Ask From You
- Review of scientific framing, measures, and safety.
- Suggestions on ethical boundaries and crisis protocol language.
- Feedback on feasibility for classroom use and consent flow.

If validated, we’ll run the class pilot, analyze results (quant + qual), and iterate with your guidance.

## Global and Cultural Readiness
- Multilingual experience: agent follows the user’s language; UI strings are translatable; examples and metaphors localized.
- Region‑aware safety: crisis resources map to the user’s region; global fallback when unknown.
- Cultural sensitivity: role‑specific question banks adapt emphasis (family/community vs individual agency) based on locale or user selection.
- Ethical framing: consent copy and privacy presets reflect local expectations; no assumptions about therapist roles or family disclosure.
- Accessibility: support right‑to‑left scripts, plain‑language variants, and device performance constraints.


