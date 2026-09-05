# Idea Generation Skill

## Purpose

Convert research findings, audience signals, company objectives, and content opportunities into multiple distinct content concepts that can be evaluated and ranked.

This skill governs ideation quality. It does not grant authority to approve strategy or publication.

## Inputs

Use available inputs such as:

- Research Packages
- Trend findings
- Audience needs or questions
- Historical analytics
- Existing content and known gaps
- Company objectives
- Brand constraints
- Platform requirements
- Production constraints

Do not assume an input exists when it has not been provided or retrieved.

## Step 1 — Define the Opportunity

Before generating ideas, identify:

- Objective
- Target audience
- Topic or problem
- Audience need, curiosity, or tension
- Platform
- Format constraints
- Brand constraints
- Evidence requirements

If the objective or audience is materially unclear, escalate instead of generating a large volume of unfocused ideas.

## Step 2 — Extract Research Signals

Convert relevant research into usable signals.

For each important signal, distinguish:

- FACT — verified statement
- SOURCE — origin of the information
- EVIDENCE — information supporting or challenging a claim
- INFERENCE — conclusion derived from evidence
- ASSUMPTION — unverified premise used temporarily
- OPINION — subjective judgment

Preserve references to supporting sources and evidence.

## Step 3 — Generate Angles

Generate multiple materially different angles when practical.

Useful angle types include:

- Explainer
- How-to
- Myth vs reality
- Comparison
- Case study
- Story / narrative
- Data-driven insight
- Problem → solution
- Beginner perspective
- Expert perspective
- Contrarian or counterintuitive angle
- Timely reaction
- FAQ / audience question
- Experiment or test

Do not force every angle type onto every topic. Select angles that fit the objective, audience, evidence, and platform.

## Step 4 — Build Ideas

Turn each viable angle into an Idea Candidate.

Each candidate should define:

- Core concept
- Audience
- Audience need
- Angle
- Central promise
- Hook
- Format
- Platform
- Differentiation
- Evidence basis
- Assumptions
- Production considerations

The hook should communicate the reason the audience should continue watching or reading without making unsupported promises.

## Step 5 — Differentiate Candidates

Before ranking:

1. Compare candidates against existing ideas.
2. Detect duplicates and near-duplicates.
3. Merge redundant candidates when appropriate.
4. Keep separate ideas only when the audience value, angle, promise, or execution is materially different.

Do not create artificial variations merely to increase the number of ideas.

## Step 6 — Evidence Check

For factual or analytical ideas:

- Preserve source references.
- Identify important supporting evidence.
- Identify conflicting evidence.
- Identify missing evidence.
- Mark inference explicitly.
- Mark assumptions explicitly.
- Avoid unsupported trend or audience claims.

If a key claim cannot be adequately supported, either:

- remove the claim,
- downgrade the idea's confidence,
- frame it explicitly as a hypothesis, or
- request additional research.

## Step 7 — Evaluate and Rank

Use `idea-scoring.md` to evaluate candidates.

Rank according to the stated objective rather than personal preference.

Consider:

- Audience relevance
- Topic strength
- Evidence quality
- Differentiation
- Hook potential
- Usefulness
- Platform fit
- Production feasibility
- Timeliness
- Brand fit
- Learning value

Explain material ranking differences.

## Creative Hypotheses

Creative hypotheses are allowed when clearly labeled.

Examples:

- "This angle may create curiosity because..."
- "Hypothesis: the audience may prefer..."
- "Potential hook: ..."

Do not convert a creative hypothesis into a factual claim without evidence.

## Confidence

Use the company-wide scale:

- Very High
- High
- Medium
- Low
- Very Low

Confidence describes confidence in the assessment based on available information. It does not represent guaranteed content performance.

## Output Structure

Return an Idea Generation Package containing:

### Context

- Objective
- Audience
- Topic
- Platform
- Constraints

### Research Signals

For each material signal:

- classification
- statement
- evidence_refs
- source_refs
- uncertainty

### Candidate Ideas

For each candidate:

- idea_id
- concept
- audience
- need
- angle
- promise
- hook
- format
- platform
- differentiation
- evidence_refs
- source_refs
- assumptions
- inference
- risks
- score
- confidence

### Ranking

Provide:

1. Ranked ideas
2. Key reasons for the ranking
3. Important uncertainties
4. Evidence gaps
5. Recommended next action

## Handoff

The normal handoff is:

**Research → Idea AI → CEO**

After CEO approval, an approved idea may proceed to Writer or Producer according to the company workflow.

Idea AI must not treat its own recommendation as approval.

## Quality Gate

Do not finalize the Idea Generation Package until:

- Objective and audience are defined.
- Candidate ideas are materially differentiated.
- Important factual claims have evidence references.
- Sources are preserved.
- Inferences and assumptions are explicit.
- Unsupported claims are removed or qualified.
- Ranking uses a consistent evaluation method.
- Confidence is stated separately from score.
- The next decision or action is clear.
