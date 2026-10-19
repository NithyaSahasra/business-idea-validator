from app.services.scoring_service import ScoringService
from app.schemas.reports import DimensionAssessment


def test_deterministic_weighted_scoring():
    assessments = [
        DimensionAssessment(dimension="Customer Need Evidence", weight=25, score=80, justification="Strong customer signal", source_ids=[1]),
        DimensionAssessment(dimension="Competitive Landscape and Differentiation", weight=20, score=70, justification="Clear whitespace", source_ids=[2]),
        DimensionAssessment(dimension="Market Demand Signals", weight=20, score=90, justification="Growing search trends", source_ids=[1, 2]),
        DimensionAssessment(dimension="Monetization Feasibility", weight=20, score=60, justification="Standard SaaS subscription", source_ids=[3]),
        DimensionAssessment(dimension="Evidence Quality", weight=15, score=80, justification="Multiple official pricing sources", source_ids=[1, 2, 3])
    ]
    # Expected weighted sum:
    # 80*0.25 = 20
    # 70*0.20 = 14
    # 90*0.20 = 18
    # 60*0.20 = 12
    # 80*0.15 = 12
    # Total = 76

    score, status, dims = ScoringService.calculate_opportunity_score(assessments, credible_sources_count=5)
    assert score == 76
    assert status == "calculated"
    assert len(dims) == 5


def test_provisional_score_capping_under_insufficient_sources():
    assessments = [
        DimensionAssessment(dimension="Customer Need Evidence", weight=25, score=95, justification="Assumed high", source_ids=[1]),
        DimensionAssessment(dimension="Competitive Landscape and Differentiation", weight=20, score=90, justification="Few incumbents", source_ids=[]),
        DimensionAssessment(dimension="Market Demand Signals", weight=20, score=95, justification="High interest", source_ids=[]),
        DimensionAssessment(dimension="Monetization Feasibility", weight=20, score=90, justification="SaaS", source_ids=[]),
        DimensionAssessment(dimension="Evidence Quality", weight=15, score=85, justification="Limited sources", source_ids=[1])
    ]
    # Raw score would be > 90, but credible_sources_count is 1 (< 3)
    score, status, dims = ScoringService.calculate_opportunity_score(assessments, credible_sources_count=1)
    assert status == "provisional"
    assert score == 60  # Capped at 60 as per spec


def test_score_clamping():
    assessments = [
        DimensionAssessment(dimension="Customer Need Evidence", weight=25, score=150, justification="Above 100", source_ids=[]),
        DimensionAssessment(dimension="Competitive Landscape and Differentiation", weight=20, score=-20, justification="Below 0", source_ids=[]),
        DimensionAssessment(dimension="Market Demand Signals", weight=20, score=50, justification="Normal", source_ids=[]),
        DimensionAssessment(dimension="Monetization Feasibility", weight=20, score=50, justification="Normal", source_ids=[]),
        DimensionAssessment(dimension="Evidence Quality", weight=15, score=50, justification="Normal", source_ids=[])
    ]
    score, status, dims = ScoringService.calculate_opportunity_score(assessments, credible_sources_count=4)
    # 150 clamped to 100 (*0.25 = 25)
    # -20 clamped to 0 (*0.20 = 0)
    # 50 * 0.20 = 10
    # 50 * 0.20 = 10
    # Total = 52.5 -> Python 3 banker's round(52.5) evaluates to 52
    assert score == 52
    assert status == "calculated"


def test_empty_assessments_marked_unavailable():
    score, status, dims = ScoringService.calculate_opportunity_score([], credible_sources_count=0)
    assert score is None
    assert status == "unavailable"
