import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.config import settings
from app.schemas.reports import (
    StructuredReport, CompetitorItem, MarketDemandAnalysis,
    TargetAudienceAnalysis, PricingAnalysis, DimensionAssessment
)

logger = logging.getLogger("idealens.llm")


class LLMService:
    @classmethod
    async def synthesize_validation_report(
        cls,
        idea: Dict[str, Any],
        sources: List[Dict[str, Any]]
    ) -> StructuredReport:
        """
        Synthesizes the validation report using OpenAI or structured mock fixture.
        Validates the schema strictly and ensures cited source IDs exist in the retrieved sources.
        """
        valid_source_ids = {s["id"] for s in sources if "id" in s}

        if settings.MOCK_RESEARCH or not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-your"):
            if settings.is_production:
                raise RuntimeError("Production cannot use mock research or missing OpenAI API key.")
            return cls._get_mock_structured_report(idea, valid_source_ids)

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        # Build evidence text with stable source IDs
        evidence_text = "\n\n".join([
            f"[Source ID {s['id']}] Title: {s['title']}\n"
            f"URL: {s['url']}\n"
            f"Type: {s['source_type']}\n"
            f"Evidence: {s['evidence_summary']}"
            for s in sources
        ])

        system_prompt = (
            "You are a rigorous, evidence-driven venture analyst and market researcher for IdeaLens.\n"
            "Your mission: synthesize empirical evidence to validate a submitted business idea.\n"
            "CRITICAL RULES:\n"
            "1. CITE ONLY provided [Source ID <id>] numbers. Do not invent citations, URLs, or market statistics.\n"
            "2. Distinguish empirical facts from AI interpretations and hypotheses.\n"
            "3. If evidence is lacking for a point, state that limitation clearly.\n"
            "4. Return ONLY a valid JSON object matching the requested schema.\n"
            "5. Assess the 5 required dimensions for the opportunity score:\n"
            "   - 'Customer Need Evidence' (Weight: 25)\n"
            "   - 'Competitive Landscape and Differentiation' (Weight: 20)\n"
            "   - 'Market Demand Signals' (Weight: 20)\n"
            "   - 'Monetization Feasibility' (Weight: 20)\n"
            "   - 'Evidence Quality' (Weight: 15)\n"
            "   Scores must be integers between 0 and 100 with evidence-backed justifications."
        )

        user_prompt = f"""
Business Idea Submission:
- Name: {idea.get('name')}
- Description: {idea.get('description')}
- Problem: {idea.get('problem')}
- Target Audience: {idea.get('target_audience')}
- Geography: {idea.get('geography')}
- Category: {idea.get('category') or 'Not specified'}
- Business Model: {idea.get('business_model') or 'Not specified'}
- Known Competitors: {idea.get('known_competitors') or 'None specified'}

Retrieved Web Evidence:
{evidence_text if evidence_text else 'No external sources retrieved.'}

Provide a comprehensive, evidence-linked report in valid JSON format matching the schema.
"""

        # Bounded retries (up to 2 attempts)
        for attempt in range(2):
            try:
                response = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    timeout=45.0
                )
                raw_json = response.choices[0].message.content
                data = json.loads(raw_json)

                # Validate against Pydantic schema
                report = StructuredReport.model_validate(data)

                # Sanitize source IDs to ensure they refer strictly to retrieved sources
                cls._sanitize_source_ids(report, valid_source_ids)
                return report

            except Exception as e:
                logger.warning(f"LLM synthesis attempt {attempt + 1} failed: {e}")
                if attempt == 1:
                    raise RuntimeError(f"Failed to generate structured report via LLM: {str(e)}")

        raise RuntimeError("LLM synthesis failed after bounded retries.")

    @classmethod
    def _sanitize_source_ids(cls, report: StructuredReport, valid_ids: set):
        for comp in report.competitors:
            comp.source_ids = [sid for sid in comp.source_ids if sid in valid_ids]
        report.market_demand.source_ids = [sid for sid in report.market_demand.source_ids if sid in valid_ids]
        report.target_audience_analysis.source_ids = [sid for sid in report.target_audience_analysis.source_ids if sid in valid_ids]
        report.pricing_analysis.source_ids = [sid for sid in report.pricing_analysis.source_ids if sid in valid_ids]
        for dim in report.dimension_assessments:
            dim.source_ids = [sid for sid in dim.source_ids if sid in valid_ids]

    @classmethod
    def _get_mock_structured_report(cls, idea: Dict[str, Any], valid_ids: set) -> StructuredReport:
        sorted_ids = sorted(list(valid_ids))
        id1 = sorted_ids[0] if len(sorted_ids) > 0 else 1
        id2 = sorted_ids[1] if len(sorted_ids) > 1 else id1
        id3 = sorted_ids[2] if len(sorted_ids) > 2 else id1
        id4 = sorted_ids[3] if len(sorted_ids) > 3 else id2
        id5 = sorted_ids[4] if len(sorted_ids) > 4 else id3

        return StructuredReport(
            executive_summary=(
                f"{idea.get('name')} addresses an active, underserved need in the {idea.get('geography')} market. "
                f"While incumbent tools provide broad workflow features, {idea.get('target_audience')} report friction "
                f"with existing complex alternatives. Early market signals indicate viable demand with realistic pricing opportunities."
            ),
            key_findings=[
                f"Customer demand in {idea.get('geography')} is largely driven by unmet needs for simplicity and automation.",
                "Incumbents cater to enterprise buyers, leaving student founders and agile teams priced out.",
                "Monetization feasibility is strong under a tiered subscription or usage-based tier."
            ],
            competitors=[
                CompetitorItem(
                    name="AlphaCorp",
                    website_url="https://example.com/alphacorp/product",
                    product_url="https://example.com/alphacorp/product",
                    pricing_url="https://example.com/alphacorp/pricing",
                    description="Established workflow automation platform for small to mid-sized businesses.",
                    target_customers="Mid-market operations teams and established organizations.",
                    features=["Automated task creation", "Reporting dashboards", "Team permissions"],
                    strengths=["Established brand presence", "Wide integration directory"],
                    weaknesses=["High starting price point", "Complex multi-step setup"],
                    competitor_type="direct",
                    source_ids=[id2, id3]
                ),
                CompetitorItem(
                    name="BetaVentures Framework",
                    website_url="https://example.com/betaventures/overview",
                    product_url="https://example.com/betaventures/overview",
                    pricing_url=None,
                    description="Manual guide and template framework for early-stage idea checking.",
                    target_customers="First-time student entrepreneurs and accelerators.",
                    features=["Checklist templates", "Interview guides"],
                    strengths=["Low cost", "Accessible methodology"],
                    weaknesses=["Completely manual execution", "No live data or competitor search"],
                    competitor_type="indirect",
                    source_ids=[id5]
                )
            ],
            market_demand=MarketDemandAnalysis(
                qualitative_signals=[
                    "High frequency of community forum discussions regarding validation roadblocks.",
                    "Surge in early-stage founder interest in automated intelligence over manual spreadsheets."
                ],
                relevant_keywords=[
                    "business idea validation",
                    "automated market research",
                    "competitor analysis for startups",
                    "idea testing tools"
                ],
                pain_points=[
                    "Spending 20+ hours compiling competitor research manually.",
                    "Inability to verify whether a market problem has genuine willingness-to-pay."
                ],
                industry_evidence=[
                    "Industry research notes over 35% of startups fail due to building products without market need."
                ],
                evidence_limitations=[
                    "Quantitative search volume data not integrated; assessment reflects qualitative public discussions."
                ],
                source_ids=[id1, id4]
            ),
            target_audience_analysis=TargetAudienceAnalysis(
                primary_segment=str(idea.get("target_audience")),
                needs=[
                    "Rapid, objective feedback on commercial viability.",
                    "Transparent links to real competitor pricing and customer complaints."
                ],
                early_adopters=[
                    "Bootstrapped founders",
                    "University entrepreneurship students",
                    "Solo developers evaluating side projects"
                ],
                characteristics=[
                    "High technical literacy",
                    "Budget-conscious but willing to pay for clear time-savings"
                ],
                assumptions_and_personas=[
                    "Persona: 'Alex the Student Founder' — needs to present validated research to pitch competitions."
                ],
                source_ids=[id4]
            ),
            pricing_analysis=PricingAnalysis(
                competitor_pricing_summary="Competitor offerings range from $29/mo (entry) to $89/mo (professional tiers).",
                differentiation_opportunities=[
                    "Offer an accessible starter tier or pay-per-validation model.",
                    "Focus on verifiable citation links as a trust anchor over generic AI output."
                ],
                pricing_hypotheses=[
                    "Hypothesis: A $19/month or $9/report pay-as-you-go tier will maximize conversion among students."
                ],
                positioning_recommendations=[
                    "Position as the trustworthy, evidence-first validation copilot, not a generic text generator."
                ],
                source_ids=[id3]
            ),
            opportunities=[
                "Capturing the underserved student founder and incubator niche.",
                "Building defensibility through verifiable, live-retrieved evidence citations."
            ],
            risks=[
                "Incumbents adding light AI features to existing platforms.",
                "Ensuring search API costs remain sustainable as query volume grows."
            ],
            unknowns=[
                "Exact willingness-to-pay for single-report downloads versus ongoing monthly subscriptions."
            ],
            next_steps=[
                "Conduct 10 qualitative interviews with student entrepreneurs to test the $19 pricing hypothesis.",
                "Build a public showcase report on a trending business idea to drive organic discovery."
            ],
            dimension_assessments=[
                DimensionAssessment(
                    dimension="Customer Need Evidence",
                    weight=25,
                    score=78,
                    justification="Forum discussions and market data demonstrate consistent pain points regarding manual competitor research.",
                    source_ids=[id1, id4]
                ),
                DimensionAssessment(
                    dimension="Competitive Landscape and Differentiation",
                    weight=20,
                    score=72,
                    justification="Direct competitors exist but are geared toward enterprise teams with cumbersome onboarding.",
                    source_ids=[id2, id5]
                ),
                DimensionAssessment(
                    dimension="Market Demand Signals",
                    weight=20,
                    score=75,
                    justification="Strong qualitative demand indicators across startup communities and incubator cohorts.",
                    source_ids=[id1]
                ),
                DimensionAssessment(
                    dimension="Monetization Feasibility",
                    weight=20,
                    score=70,
                    justification="Established willingness-to-pay demonstrated by incumbent pricing tiers between $29-$89/month.",
                    source_ids=[id3]
                ),
                DimensionAssessment(
                    dimension="Evidence Quality",
                    weight=15,
                    score=82,
                    justification="Evidence includes verified competitor pricing pages, product specs, and community discussions.",
                    source_ids=[id1, id2, id3, id4, id5]
                )
            ],
            evidence_limitations=[
                "Search results reflect web snapshots available at the time of research.",
                "Numerical search volumes are omitted to preserve evidence integrity."
            ]
        )
