import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.ideas import router as ideas_router
from app.api.research import router as research_router
from app.api.reports import router as reports_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("idealens.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting IdeaLens API in {settings.ENVIRONMENT} mode (Mock Research: {settings.MOCK_RESEARCH})")
    yield
    logger.info("Stopping IdeaLens API")


app = FastAPI(
    title="IdeaLens API",
    description="Evidence-driven AI business idea validation platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware with strict origin checking (no wildcards with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred. Please try again later."}
    )


# Register all API routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(ideas_router)
app.include_router(research_router)
app.include_router(reports_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
