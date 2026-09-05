# Initial Data Model

Core entities:
Company, Agent, Department, Task, TaskHandoff, Project, Content, Idea,
ResearchRecord, Source, Evidence, Decision, Approval, Asset, Publication,
Metric, Learning, KnowledgeItem, ActivityLog.

Evidence:
claim, source, source_type, retrieved_at, reliability, confidence, notes.

TaskHandoff:
from_agent, to_agent, task_type, objective, input_refs, evidence_refs,
constraints, expected_output, priority, status, created_at, completed_at.
