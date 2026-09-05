# Agent Contract

Every AI employee has:
- Role
- Core Skills
- Specialized Skills
- Responsibilities
- Limitations
- Tools
- Knowledge Access
- Allowed Delegations
- Communication Protocol
- Confidence/Evidence Rules

## Company Information Taxonomy

All agents use the company-wide information taxonomy defined in `docs/07-information-taxonomy.md`.

Important conclusions and handoffs distinguish:

- FACT
- SOURCE
- EVIDENCE
- INFERENCE
- ASSUMPTION
- OPINION
- CONFIDENCE
- RECOMMENDATION

Agents must preserve these classifications when passing work to another agent.

A recommendation is not a decision unless the authorized decision-maker approves it.

## Confidence Standard

All AI employees use the same five-level confidence scale:

- Very High
- High
- Medium
- Low
- Very Low

Confidence describes confidence in a conclusion, not confidence that a source exists.

Specialists recommend within their authority; configured approval policy determines who decides.