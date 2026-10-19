import logging
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse
from app.config import settings

logger = logging.getLogger("idealens.search")


class SearchService:
    MAX_SEARCH_BUDGET = 6

    @staticmethod
    def classify_source_type(url: str, title: str, snippet: str) -> str:
        text = f"{url.lower()} {title.lower()} {snippet.lower()}"
        if "pricing" in text or "cost" in text or "/plans" in text:
            return "pricing"
        if any(forum in url.lower() for forum in ["reddit.com", "news.ycombinator.com", "quora.com", "producthunt.com"]):
            return "forum"
        if any(term in text for term in ["report", "gartner", "forrester", "mckinsey", "market research", "statista"]):
            return "industry_research"
        if any(term in text for term in ["features", "about", "product", "software", "platform", "solution"]):
            return "company"
        return "general"

    @classmethod
    async def perform_search(
        cls,
        query: str,
        api_key: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Executes a real web search request via Tavily Search API.
        """
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": False,
            "include_raw_content": False,
            "max_results": max_results
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("results", [])
                else:
                    logger.error(f"Tavily search API error: {res.status_code} {res.text}")
                    return []
        except Exception as e:
            logger.error(f"Tavily network request failed: {e}")
            return []

    @classmethod
    async def collect_evidence_for_idea(
        cls,
        idea_name: str,
        description: str,
        problem: str,
        target_audience: str,
        geography: str,
        category: Optional[str] = None,
        business_model: Optional[str] = None,
        known_competitors: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Gathers evidence with a strict budget of up to 6 focused queries.
        Deduplicates URLs, classifies sources, and normalizes output.
        """
        if settings.MOCK_RESEARCH or not settings.TAVILY_API_KEY or settings.TAVILY_API_KEY.startswith("tvly-your"):
            if settings.is_production:
                raise RuntimeError("Production cannot use mock research or missing Tavily API key.")
            return cls._get_mock_evidence(idea_name, target_audience, geography)

        # Build focused queries within budget
        queries = [
            # 1. Direct competitors
            f"{idea_name} {category or ''} competitors alternatives {geography}".strip(),
            # 2. Indirect solutions solving the problem
            f"{problem} existing solutions alternatives {geography}".strip(),
            # 3. Customer pain points & complaints
            f"{target_audience} {problem} complaints pain points reviews".strip(),
            # 4. Market demand & trends
            f"{category or idea_name} market trends adoption {geography}".strip(),
        ]

        if known_competitors:
            comp_sample = known_competitors.split(",")[0].strip()
            # 5. Pricing of known or prominent competitor
            queries.append(f"{comp_sample} pricing plans cost tiers".strip())
        else:
            queries.append(f"{category or idea_name} SaaS pricing models cost".strip())

        # 6. Specific audience / geographic demand
        queries.append(f"{target_audience} willingness to pay for {category or idea_name} {geography}".strip())

        queries = queries[:cls.MAX_SEARCH_BUDGET]

        seen_urls = set()
        collected_sources: List[Dict[str, Any]] = []

        for q in queries:
            results = await cls.perform_search(q, settings.TAVILY_API_KEY, max_results=4)
            for item in results:
                raw_url = item.get("url", "").strip()
                if not raw_url or raw_url in seen_urls:
                    continue

                seen_urls.add(raw_url)
                title = item.get("title", "Untitled Source").strip()
                snippet = item.get("content", "").strip()
                source_type = cls.classify_source_type(raw_url, title, snippet)
                score = item.get("score")

                # Sanitize untrusted content (truncate extremely long chunks to prevent prompt bloating)
                clean_snippet = snippet[:1500] if snippet else "No excerpt available."

                collected_sources.append({
                    "title": title[:500],
                    "url": raw_url[:2048],
                    "source_type": source_type,
                    "retrieved_at": datetime.now(timezone.utc),
                    "evidence_summary": clean_snippet,
                    "relevance_score": float(score) if score is not None else None
                })

        return collected_sources

    @staticmethod
    def _get_mock_evidence(idea_name: str, target_audience: str, geography: str) -> List[Dict[str, Any]]:
        """
        Deterministic, realistic fixture for local development and testing.
        Explicitly labeled in source records.
        """
        now = datetime.now(timezone.utc)
        return [
            {
                "title": f"Leading Market Solutions & Competitive Landscape ({idea_name})",
                "url": "https://example.com/industry-report/market-landscape",
                "source_type": "industry_research",
                "retrieved_at": now,
                "evidence_summary": f"In {geography}, current solutions serve mid-market enterprises but leave {target_audience} underserved due to complex onboarding and enterprise-tier pricing.",
                "relevance_score": 0.92
            },
            {
                "title": "AlphaCorp: Modern Automated Business Tools",
                "url": "https://example.com/alphacorp/product",
                "source_type": "company",
                "retrieved_at": now,
                "evidence_summary": "AlphaCorp offers automated workflows for small teams starting at $49/month, though users note lack of real-time validation and evidence gathering.",
                "relevance_score": 0.88
            },
            {
                "title": "AlphaCorp Official Pricing & Plans",
                "url": "https://example.com/alphacorp/pricing",
                "source_type": "pricing",
                "retrieved_at": now,
                "evidence_summary": "Starter: $29/mo (limited features), Professional: $89/mo (full analytics), Enterprise: Custom quote.",
                "relevance_score": 0.85
            },
            {
                "title": f"Practitioner Forum: Discussions on pain points for {target_audience}",
                "url": "https://example.com/community/discussions/customer-needs",
                "source_type": "forum",
                "retrieved_at": now,
                "evidence_summary": f"Founders and students consistently express frustration with manual research taking dozens of hours. Over 70% of respondents desire an automated validation summary.",
                "relevance_score": 0.81
            },
            {
                "title": "BetaVentures: Lightweight Validation Framework",
                "url": "https://example.com/betaventures/overview",
                "source_type": "company",
                "retrieved_at": now,
                "evidence_summary": "BetaVentures provides template-based validation guides without automated web crawling or live competitor intelligence.",
                "relevance_score": 0.79
            }
        ]
