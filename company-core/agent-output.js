const ROLE_OUTPUTS = {
  ceo: (input) => ({ decision: null, recommendation: input.recommendation || null, rationale: [], approval_required: true, confidence: 'Medium' }),
  research: (input) => ({ topic: input.topic || null, evidence: [], sources: [], conflicts: [], conclusion: null, confidence: 'Low', recommendation: null }),
  idea: (input) => ({ ideas: [], scoring: [], ranked_idea: null, rationale: [], confidence: 'Medium', recommendation: null }),
  writer: (input) => ({ title: null, hook: null, script: null, caption: null, description: null, cta: null, platform_adaptations: {}, source_refs: input.source_refs || [], evidence_refs: input.evidence_refs || [] }),
  producer: () => ({ production_plan: [], scenes: [], visuals: [], voice: null, b_roll: [], coordination_notes: [] }),
  visual: () => ({ assets: [], thumbnail_direction: null, illustration_direction: null, graphics: [], brand_notes: [] }),
  video: () => ({ scenes: [], subtitles: null, voice: null, music: null, sound_effects: [], formats: [] }),
  qa: () => ({ verdict: 'REVIEW_REQUIRED', issues: [], fact_checks: [], evidence_gaps: [], copyright_risks: [], brand_checks: [], platform_checks: [], confidence: 'Low', revision_required: true }),
  publisher: () => ({ title: null, description: null, hashtags: [], schedule: null, platform_variants: {}, publication_status: 'NOT_PUBLISHED' }),
  analytics: () => ({ metrics: [], findings: [], evidence: [], diagnosis: null, learning: [], recommendation: null, confidence: 'Low' })
};

function buildAgentOutput(agentId, input = {}) {
  const builder = ROLE_OUTPUTS[agentId];
  if (!builder) throw new Error(`Unknown agent: ${agentId}`);
  const output = builder(input);
  return {
    ...output,
    taxonomy: { FACT: [], SOURCE: output.sources || output.source_refs || [], EVIDENCE: output.evidence || output.evidence_refs || [], INFERENCE: [], ASSUMPTION: [], OPINION: [], CONFIDENCE: output.confidence || 'Low', RECOMMENDATION: output.recommendation || null },
    generated_at: new Date().toISOString(),
    execution_mode: 'structured_role_output'
  };
}

module.exports = { buildAgentOutput };