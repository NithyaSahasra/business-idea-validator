import asyncio
import logging
import signal
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy import text, and_
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import ResearchJob
from app.services.research_service import ResearchService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("idealens.worker")

running = True


def handle_shutdown(signum, frame):
    global running
    logger.info("Shutdown signal received. Finishing active jobs...")
    running = False


signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)


def claim_next_job(db: Session) -> ResearchJob | None:
    """
    Claims the next queued job atomically using conditional UPDATE.
    Prevents race conditions if multiple workers run concurrently.
    """
    queued_job = (
        db.query(ResearchJob)
        .filter(ResearchJob.status == "queued")
        .order_by(ResearchJob.created_at.asc())
        .first()
    )
    if not queued_job:
        return None

    now = datetime.now(timezone.utc)
    # Atomic conditional update
    rows_affected = db.execute(
        text(
            "UPDATE research_jobs "
            "SET status = 'in_progress', started_at = :now, progress_updated_at = :now "
            "WHERE id = :job_id AND status = 'queued'"
        ),
        {"now": now, "job_id": queued_job.id}
    ).rowcount
    db.commit()

    if rows_affected == 1:
        db.refresh(queued_job)
        return queued_job
    return None


def recover_stale_jobs(db: Session):
    """
    Recovers jobs stuck in 'in_progress' for more than 15 minutes without progress updates.
    """
    timeout_threshold = datetime.now(timezone.utc) - timedelta(minutes=15)
    stale_jobs = (
        db.query(ResearchJob)
        .filter(
            ResearchJob.status == "in_progress",
            ResearchJob.progress_updated_at < timeout_threshold
        )
        .all()
    )
    for job in stale_jobs:
        if job.attempt_count < 2:
            logger.warning(f"Re-queuing abandoned job {job.id} (attempt {job.attempt_count + 1})")
            job.status = "queued"
            job.attempt_count += 1
            job.progress_updated_at = datetime.now(timezone.utc)
        else:
            logger.error(f"Marking abandoned job {job.id} as failed after exceeding max attempts")
            job.status = "failed"
            job.error_code = "WORKER_TIMEOUT"
            job.error_message = "Research job stalled and exceeded recovery attempt threshold."
            job.progress_updated_at = datetime.now(timezone.utc)
        db.commit()


async def run_worker_loop(single_run: bool = False, poll_interval: float = 2.0):
    logger.info(f"IdeaLens Research Worker initialized. (single_run={single_run})")
    while running:
        db = SessionLocal()
        try:
            recover_stale_jobs(db)
            job = claim_next_job(db)
            if job:
                logger.info(f"Claimed research job {job.id} for Idea: '{job.idea.name}'")
                await ResearchService.process_job(db, job)
            else:
                if single_run:
                    break
                await asyncio.sleep(poll_interval)
        except Exception as e:
            logger.exception(f"Unexpected error in worker loop: {e}")
            await asyncio.sleep(poll_interval)
        finally:
            db.close()


if __name__ == "__main__":
    is_once = "--once" in sys.argv
    asyncio.run(run_worker_loop(single_run=is_once))
