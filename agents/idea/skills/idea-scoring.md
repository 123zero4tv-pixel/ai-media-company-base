# Idea Scoring Skill

## Purpose

Provide a consistent decision-support method for comparing content ideas.

The score is an assessment tool. It is not a forecast, guarantee, or fact.

## Scoring Scale

Score each applicable criterion from **1 to 5**:

- **1 — Very Weak**
- **2 — Weak**
- **3 — Moderate**
- **4 — Strong**
- **5 — Very Strong**

Do not use false precision such as 4.7 unless the task explicitly requires finer granularity.

## Core Criteria

Use these criteria unless the task provides a different approved rubric:

| Criterion | Meaning |
|---|---|
| Audience Relevance | How directly the idea addresses a defined audience need, curiosity, or problem |
| Topic Strength | Strength and substance of the underlying topic |
| Evidence Quality | Quality, reliability, recency, and corroboration of supporting evidence |
| Differentiation | How meaningfully the idea differs from existing content |
| Hook Potential | Strength of the opening promise or curiosity mechanism |
| Usefulness | Likely practical, educational, informational, or entertainment value |
| Platform Fit | Suitability for the intended platform and format |
| Production Feasibility | Ability to produce the idea with available resources and constraints |
| Timeliness | Relevance to current events, trends, seasonality, or audience timing when applicable |
| Brand Fit | Alignment with company positioning, standards, and audience expectations |
| Learning Value | Potential to generate useful information about audience or content performance |

Not every criterion must be used for every task. Explain omitted criteria when their omission materially affects the ranking.

## Weighting

When no custom weighting is specified, use equal weighting across the applicable criteria.

If weighting is required, document:

- criterion
- weight
- reason for weight
- resulting score

Weights should reflect the content objective rather than arbitrary preference.

## Calculation

For equal weighting:

`overall_score = sum(criteria_scores) / number_of_applicable_criteria`

For weighted scoring:

`overall_score = sum(criteria_score × criterion_weight) / sum(criterion_weights)`

Keep the calculation reproducible.

## Evidence Quality Rule

Evidence Quality must not be inflated merely because a source exists.

Consider:

- Source reliability
- Primary vs secondary sourcing
- Recency
- Corroboration
- Directness to the claim
- Conflicting evidence
- Missing evidence

A creative idea can score highly on originality while scoring low on Evidence Quality. Do not compensate for weak evidence by inventing certainty.

## Ranking Rules

1. Rank against the stated objective.
2. Compare ideas using the same rubric within the same decision set.
3. Explain material differences in scores.
4. If scores are close, identify the uncertainty instead of manufacturing a precise distinction.
5. If an idea has a critical unresolved evidence problem, flag it even if its total score is high.
6. A lower-scoring idea may be recommended when it has materially lower risk, lower production cost, or stronger strategic fit. Explain why.

## Confidence

Score confidence separately from idea potential.

Use the company-wide scale:

- Very High
- High
- Medium
- Low
- Very Low

Confidence reflects confidence in the assessment based on available evidence. It does not mean confidence that the content will achieve a particular number of views, clicks, or conversions.

## Required Output

For each evaluated idea, provide when applicable:

- Idea ID
- Core concept
- Key audience
- Score by criterion
- Overall score
- Ranking
- Evidence basis
- Important assumptions
- Inferences
- Risks
- Confidence
- Recommendation

## Taxonomy

Follow `docs/07-information-taxonomy.md`.

Keep these classifications distinct:

- FACT
- SOURCE
- EVIDENCE
- INFERENCE
- ASSUMPTION
- OPINION
- CONFIDENCE
- RECOMMENDATION

A score is an analytical assessment, not a FACT.
A prediction is an INFERENCE unless directly supported by appropriate evidence.
A recommendation remains a RECOMMENDATION until the authorized decision-maker approves it.

## Quality Checks

Before finalizing a ranking:

- Confirm the objective is explicit.
- Confirm the audience is defined.
- Confirm the same applicable criteria were used across candidates.
- Check that evidence references are preserved.
- Identify important assumptions and missing evidence.
- Check for material conflicts in evidence.
- Verify calculations.
- Separate confidence from score.
- State the recommended next action.
