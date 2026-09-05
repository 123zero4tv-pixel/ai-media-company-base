# Initial Data Model

Core entities:
Company, Agent, Department, Task, TaskHandoff, Project, Content, Idea,
ResearchRecord, Source, Evidence, Decision, Approval, Asset, Publication,
Metric, Learning, KnowledgeItem, ActivityLog.

## Evidence

Every important evidence record preserves:

- evidence_id
- classification: FACT | SOURCE | EVIDENCE | INFERENCE | ASSUMPTION | OPINION | CONFIDENCE | RECOMMENDATION
- claim_or_statement
- source_refs
- evidence_type: SUPPORTING | CONTRADICTING | QUALIFYING
- retrieved_at
- reliability
- confidence
- notes

Reliability and confidence use the company-wide five-level scale:
Very High, High, Medium, Low, Very Low.

## Task

Task fields include:

task_id, type, title, objective, owner_agent_id, requester_agent_id,
priority, status, input_refs, output_refs, depends_on, retry_count,
max_retries, last_error, created_at, started_at, completed_at.

## TaskHandoff

TaskHandoff fields include:

handoff_id, task_id, from_agent, to_agent, objective, input_refs,
evidence_refs, source_refs, assumptions, inference, confidence,
recommendation, requested_action, status.

## Decision and Approval

Decision records distinguish recommendations from authorized decisions.

Decision fields:
decision_id, subject, recommendation_refs, decision, decided_by,
approval_id, reason, created_at.

Approval fields:
approval_id, decision_id, required_from, status, comment,
created_at, resolved_at.

## Audit Log

Every material state transition is recorded with:

event_id, timestamp, actor_type, actor_id, event_type, entity_type,
entity_id, summary, metadata.

The detailed Company Core contract is defined in `company-core/schema.json`.
