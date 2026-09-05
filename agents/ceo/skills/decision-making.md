# CEO Decision-Making Skill

## Purpose

Provide a consistent process for making company-level decisions.

## Decision Process

### 1. Define the Objective

State exactly what decision needs to be made.

### 2. Collect Inputs

Review:

- Relevant tasks
- Research
- Evidence
- Previous decisions
- Agent recommendations
- Company priorities
- Known constraints

### 3. Separate Information Types

Classify important information as:

- FACT
- EVIDENCE
- ASSUMPTION
- OPINION
- CONFIDENCE

Do not treat assumptions or opinions as verified facts.

### 4. Evaluate Options

For each meaningful option, consider:

- Expected benefit
- Strategic alignment
- Evidence quality
- Required resources
- Dependencies
- Risks
- Reversibility
- Time sensitivity

### 5. Request Specialist Input

If the decision requires specialist knowledge, delegate a Task Package to the appropriate AI employee.

Do not guess when a specialist can provide better evidence.

### 6. Resolve Conflicts

If agents provide conflicting recommendations:

1. Identify the disagreement.
2. Identify the evidence supporting each position.
3. Check whether the evidence is reliable.
4. Request additional research if necessary.
5. Record the unresolved uncertainty if it cannot be resolved.

### 7. Make the Decision

Choose the option that best satisfies the company objective while considering evidence, risk, resources, and constraints.

### 8. Record the Decision

Important decisions should record:

- decision_id
- objective
- decision
- alternatives_considered
- evidence
- assumptions
- risks
- confidence
- rationale
- owner_approval_required
- owner_approval_status

### 9. Communicate the Decision

Send the decision to the relevant AI employees through structured Task Packages.

Each recipient should know:

- What was decided
- Why it was decided
- What they need to do
- Expected output
- Priority
- Constraints

## Owner Approval

Request Owner approval when:

- The action is sensitive.
- The action is difficult to reverse.
- The action materially changes company strategy.
- The system explicitly marks the action as requiring approval.

Do not assume Owner approval.

## Confidence

Use confidence to communicate uncertainty.

High confidence:
Strong evidence and little meaningful uncertainty.

Medium confidence:
Reasonable evidence but meaningful uncertainty remains.

Low confidence:
Insufficient or conflicting evidence.

Low confidence decisions should generally trigger additional research or Owner review.

## Output Format

When reporting an important decision, use:

### Decision
What was decided.

### Evidence
The strongest supporting evidence.

### Assumptions
What is not verified.

### Alternatives
Important alternatives considered.

### Risks
Important risks or failure conditions.

### Confidence
High / Medium / Low.

### Recommendation
What should happen next.

### Approval
Whether Owner approval is required.