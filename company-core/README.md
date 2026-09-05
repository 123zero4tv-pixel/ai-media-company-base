# Company Core

The Company Core is the system-of-record for the AI Media Company.

It is separate from individual AI employee prompts. Agents operate through company state, tasks, handoffs, decisions, approvals, evidence, knowledge, metrics, and audit records.

## Core entities

- CompanyState
- AgentState
- Task
- TaskHandoff
- ContentItem
- ResearchRecord
- Source
- Evidence
- Decision
- Approval
- KnowledgeItem
- Metric
- AuditLog

## Operating rules

1. Every executable unit of work is represented by a Task.
2. Tasks have an owner agent, status, priority, timestamps, inputs, outputs, and failure information.
3. Cross-agent work uses TaskHandoff; agents do not silently change another agent's responsibilities.
4. Important claims preserve classification, evidence references, source references, assumptions, inference, and confidence.
5. A Recommendation is not a Decision.
6. A Decision that requires owner approval remains pending until an authorized Approval exists.
7. QA can reject content and create a revision task.
8. Every material state transition produces an AuditLog entry.
9. Company Core contains company state only; it must not contain trading-company concepts, broker/exchange state, portfolio state, or trading strategy state.

## Task lifecycle

QUEUED -> ASSIGNED -> IN_PROGRESS -> BLOCKED / WAITING_APPROVAL / READY_FOR_QA -> COMPLETED

A failed task uses FAILED and may be retried with retry_count and last_error recorded.

## Content lifecycle

RESEARCH -> IDEA -> CEO_DECISION -> WRITING -> QA -> PUBLISH_READY -> PUBLISHED -> ANALYTICS

QA rejection returns content to the appropriate revision stage.
