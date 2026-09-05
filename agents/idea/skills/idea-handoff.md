# Idea Handoff Skill

## Purpose

Define how Idea AI transfers an evaluated content opportunity to another agent without losing context, evidence, uncertainty, or decision authority.

## Handoff Principles

1. Preserve the original objective.
2. Preserve source and evidence references.
3. Preserve FACT, INFERENCE, ASSUMPTION, and OPINION classifications.
4. Preserve score and confidence separately.
5. Preserve known risks and evidence gaps.
6. State exactly what decision or action is requested.
7. Never convert a recommendation into a decision during handoff.
8. Do not omit uncertainty merely to make the idea appear stronger.

## Standard Idea Package

Every substantive handoff should contain, when applicable:

- `idea_id`
- `task_id`
- `objective`
- `audience`
- `topic`
- `core_concept`
- `angle`
- `promise`
- `hook`
- `format`
- `platform`
- `differentiation`
- `evidence_refs`
- `source_refs`
- `assumptions`
- `inference`
- `risks`
- `score`
- `ranking`
- `confidence`
- `recommendation`
- `requested_action`

Fields may be omitted only when genuinely not applicable. Do not replace missing information with invented values.

## Evidence Preservation

For each important factual or analytical input:

- retain the source reference,
- retain the evidence reference when available,
- retain relevant classification,
- retain conflicts or limitations,
- retain the confidence assessment.

If evidence is incomplete, state the gap explicitly.

## CEO Handoff

Normal flow:

**Idea AI → CEO AI**

The CEO receives enough information to decide whether an idea should proceed.

The handoff should emphasize:

- why the idea matters,
- who it serves,
- evidence supporting the opportunity,
- key uncertainty,
- comparative ranking,
- recommendation,
- decision requested.

The CEO's approval is a decision. Idea AI's recommendation is not.

## Writer Handoff

Normal flow:

**CEO-approved Idea → Writer AI**

Only pass an idea to Writer as an execution candidate when the workflow indicates that CEO approval has occurred.

Writer should receive:

- approved concept,
- intended audience,
- angle,
- hook direction,
- platform and format,
- evidence/source references,
- factual constraints,
- assumptions that must not be presented as facts,
- required next action.

Idea AI must not silently alter approved strategic intent.

## Producer Handoff

Normal flow:

**CEO-approved Idea → Producer AI**

When production planning is requested, provide:

- approved concept,
- audience,
- format,
- platform,
- hook direction,
- key evidence requirements,
- production constraints,
- risks and dependencies.

Do not imply that an unapproved idea is ready for production.

## Handoff Status

Use an explicit status where the company workflow supports it:

- `DRAFT`
- `RESEARCH_REQUIRED`
- `READY_FOR_CEO`
- `CEO_APPROVED`
- `CEO_REJECTED`
- `READY_FOR_WRITER`
- `READY_FOR_PRODUCER`
- `BLOCKED`

Do not assign an approval status without the corresponding authority or recorded decision.

## Decision Boundary

A handoff must clearly distinguish:

- **Recommendation** — what Idea AI proposes.
- **Decision** — what the authorized decision-maker approved or rejected.
- **Next Action** — what the receiving agent should do next.

## Validation Before Handoff

Before sending an Idea Package:

- Objective is clear.
- Audience is defined.
- Concept is understandable without hidden context.
- Evidence and sources are traceable.
- Important assumptions are explicit.
- Inferences are labeled.
- Risks and evidence gaps are visible.
- Score and confidence are separate.
- Recommendation is explicit.
- Requested action is explicit.
- Approval state is accurate.

## Failure Handling

If required handoff information is missing:

1. Mark the package `BLOCKED` or `RESEARCH_REQUIRED` as appropriate.
2. Identify the missing information.
3. State why it matters.
4. Request the appropriate next action.
5. Do not fabricate the missing field.

## Taxonomy Compliance

Follow `docs/07-information-taxonomy.md`.

The handoff must preserve:

- FACT
- SOURCE
- EVIDENCE
- INFERENCE
- ASSUMPTION
- OPINION
- CONFIDENCE
- RECOMMENDATION

A receiving agent must be able to distinguish what is known, what supports it, what is inferred, what is assumed, how confident the assessment is, and what action is being recommended.
