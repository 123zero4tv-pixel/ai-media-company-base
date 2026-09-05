# Research Evidence Analysis Skill

## Purpose

Analyze evidence and determine how strongly it supports a claim.

The goal is to prevent unsupported conclusions and make uncertainty visible.

## Company Taxonomy

Use the company-wide information taxonomy defined in `docs/07-information-taxonomy.md`.

Classify information as appropriate:

- FACT
- SOURCE
- EVIDENCE
- INFERENCE
- ASSUMPTION
- OPINION
- CONFIDENCE
- RECOMMENDATION

Do not treat assumptions, opinions, or inferences as facts.

## Claim Analysis

For each important claim:

1. State the claim clearly.
2. Identify the evidence supporting it.
3. Identify the source of the evidence.
4. Determine whether the evidence directly supports the claim.
5. Identify contradictory or missing evidence.
6. Assess uncertainty.
7. Assign confidence.
8. Provide a conclusion.

## Evidence Strength

Use:

### Strong

Evidence directly supports the claim and comes from reliable sources with meaningful corroboration.

### Moderate

Evidence supports the claim but has limitations, incomplete corroboration, or meaningful uncertainty.

### Weak

Evidence is indirect, limited, outdated, disputed, or based on unreliable sources.

### Insufficient

There is not enough evidence to reasonably support the claim.

Evidence Strength describes the supporting evidence. Confidence describes confidence in the resulting conclusion. They are related but not interchangeable.

## Confidence

Confidence represents confidence in the conclusion, not confidence in the existence of a source.

Use the company-wide five-level standard:

- Very High
- High
- Medium
- Low
- Very Low

Confidence must reflect:

- Evidence quality
- Source reliability
- Evidence consistency
- Corroboration
- Recency
- Remaining uncertainty

## Conflicting Evidence

When sources disagree:

1. Identify the conflicting claims.
2. Identify the sources supporting each side.
3. Compare source quality.
4. Compare directness of evidence.
5. Check dates and methodology.
6. Determine whether the conflict can be resolved.
7. If unresolved, explicitly report the conflict.

Never hide meaningful conflicting evidence.

## Missing Evidence

Identify important evidence that is unavailable.

Examples:

- Missing primary source
- Missing dataset
- Missing methodology
- Missing publication date
- Insufficient sample size
- Lack of independent corroboration
- Unknown source provenance

Missing evidence should reduce confidence when it materially affects the conclusion.

## Inference

Clearly distinguish information that is directly supported from conclusions inferred from multiple pieces of evidence.

Use:

- Evidence says:
- This suggests:
- Reasonable inference:
- Uncertain inference:

Do not present an inference as a directly established fact.

## Conclusion

Every important research conclusion should contain:

### Claim

What is being evaluated.

### Evidence

What supports or contradicts the claim.

### Sources

Where the evidence comes from.

### Confidence

How confident the Research AI is in the conclusion.

### Conflicts

Important contradictory evidence or unresolved issues.

### Conclusion

The best-supported interpretation of the evidence.

### Recommendation

What the company should consider doing based on the evidence.

A recommendation remains a recommendation until the authorized decision-maker approves it.

## Output Format

Use this structure for important research findings:

```text
CLAIM:
[claim]

EVIDENCE:
- [evidence 1]
- [evidence 2]

SOURCES:
- [source 1]
- [source 2]

EVIDENCE STRENGTH:
[Strong / Moderate / Weak / Insufficient]

CONFLICTS:
[conflicting evidence or None identified]

MISSING EVIDENCE:
[important missing information or None identified]

CONFIDENCE:
[Very High / High / Medium / Low / Very Low]

CONCLUSION:
[best-supported conclusion]

RECOMMENDATION:
[action or next step]
```

## Important Rules

- Evidence must be traceable to a source.
- A source does not automatically prove a claim.
- Multiple sources repeating the same information are not necessarily independent corroboration.
- Do not manufacture evidence.
- Do not hide uncertainty.
- Do not increase confidence simply because many sources agree if they originate from the same underlying source.
- When evidence is insufficient, say so.
- When evidence conflicts, show the conflict.
- Separate facts from interpretation.
- Separate evidence from recommendation.
- Preserve information classifications when handing work to another agent.

## Final Check

Before delivering a research conclusion, verify:

1. Is the claim clearly defined?
2. Is each important piece of evidence traceable?
3. Does the evidence actually support the claim?
4. Are the sources reliable for this specific claim?
5. Is contradictory evidence disclosed?
6. Are important gaps identified?
7. Is confidence justified?
8. Is the conclusion separated from inference?
9. Is the recommendation based on the evidence?
10. Could another agent audit how the conclusion was reached?