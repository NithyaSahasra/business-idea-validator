from typing import List, Tuple, Optional
from app.schemas.reports import DimensionAssessment

DIMENSION_WEIGHTS = {
    "Customer Need Evidence": 25,
    "Competitive Landscape and Differentiation": 20,
    "Market Demand Signals": 20,
    "Monetization Feasibility": 20,
    "Evidence Quality": 15
}


class ScoringService:
    @staticmethod
    def calculate_opportunity_score(
        assessments: List[DimensionAssessment],
        credible_sources_count: int
    ) -> Tuple[Optional[int], str, List[DimensionAssessment]]:
        """
        Calculates the final opportunity score deterministically based on the 5 fixed dimensions.
        Enforces bounds, caps provisional scores if < 3 credible sources, or marks unavailable.
        """
        # If no assessments or very deficient evidence, mark as unavailable
        if not assessments or len(assessments) < 3:
            return None, "unavailable", assessments

        assessment_map = {a.dimension: a for a in assessments}
        validated_assessments: List[DimensionAssessment] = []
        weighted_sum = 0
        total_weight = 0

        for dim_name, weight in DIMENSION_WEIGHTS.items():
            item = assessment_map.get(dim_name)
            if item:
                # Clamp score between 0 and 100
                clamped_score = max(0, min(100, item.score))
                validated_item = DimensionAssessment(
                    dimension=dim_name,
                    weight=weight,
                    score=clamped_score,
                    justification=item.justification,
                    source_ids=item.source_ids or []
                )
            else:
                # Fallback assessment if LLM omitted a dimension
                clamped_score = 40
                validated_item = DimensionAssessment(
                    dimension=dim_name,
                    weight=weight,
                    score=clamped_score,
                    justification="Dimension inferred with limited direct empirical evidence.",
                    source_ids=[]
                )

            validated_assessments.append(validated_item)
            weighted_sum += clamped_score * weight
            total_weight += weight

        if total_weight == 0:
            return None, "unavailable", validated_assessments

        raw_score = round(weighted_sum / 100)

        # Provisional rule: If fewer than 3 credible, relevant sources are available,
        # mark the score as provisional and cap at 60.
        if credible_sources_count < 3:
            score_status = "provisional"
            final_score = min(raw_score, 60)
        else:
            score_status = "calculated"
            final_score = raw_score

        return final_score, score_status, validated_assessments
