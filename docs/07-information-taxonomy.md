# Company Information Taxonomy

## Purpose

Provide one shared classification system for information used by all AI employees.

The taxonomy prevents facts, evidence, inference, assumptions, opinions, and recommendations from being treated as interchangeable.

## Core Classification

### FACT

A factual statement that can be verified from reliable evidence.

A FACT should be traceable to supporting evidence and sources when the claim matters to company decisions or published content.

### SOURCE

The origin of information used by the company.

Examples:
- Official document
- Primary dataset
- Original research
- Direct statement
- Reputable secondary source

A SOURCE is not itself proof of every claim it contains.

### EVIDENCE

Information extracted from a source that supports, contradicts, or qualifies a claim.

Evidence must remain traceable to its source.

### INFERENCE

A conclusion derived from one or more pieces of evidence rather than directly stated by a source.

Inference must not be presented as a directly established fact.

### ASSUMPTION

An unverified premise accepted temporarily for analysis, planning, or execution.

Assumptions must be explicitly identified and must not be silently promoted to facts.

### OPINION

A judgment, interpretation, preference, or subjective assessment.

Opinion is not evidence by itself.

### CONFIDENCE

The company's stated confidence in a conclusion.

Use the company-wide scale:

- Very High
- High
- Medium
- Low
- Very Low

Confidence must reflect evidence quality, source reliability, consistency, corroboration, recency, and remaining uncertainty.

### RECOMMENDATION

An action proposed based on the available evidence, analysis, objectives, and constraints.

A recommendation is not a decision unless the responsible authority approves it.

## Relationship

Use the following conceptual chain when applicable:

SOURCE -> EVIDENCE -> FACT / INFERENCE -> CONCLUSION -> CONFIDENCE -> RECOMMENDATION

ASSUMPTION and OPINION may influence analysis when explicitly identified, but neither becomes FACT automatically.

## Rules

1. Never present an inference as a directly verified fact.
2. Never present an assumption as a fact.
3. Never treat an opinion as evidence.
4. A source does not automatically prove a claim.
5. Evidence must be traceable for important claims.
6. Conflicting evidence must be disclosed.
7. Missing evidence must be disclosed when material.
8. Confidence describes the conclusion, not the existence of the source.
9. Recommendations remain recommendations until the authorized decision-maker approves them.
10. Agents must preserve these classifications when handing work to another agent.

## Minimum Handoff Fields

When an agent passes an important finding to another agent, include where applicable:

- classification
- claim_or_statement
- evidence_refs
- source_refs
- assumptions
- inference
- confidence
- recommendation

## Authority

This taxonomy is a company-wide standard.

Agent-specific skills may add detail, but they must not redefine these classifications or confidence levels.