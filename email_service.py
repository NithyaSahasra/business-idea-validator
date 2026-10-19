import logging
import httpx
from typing import Optional
from app.config import settings

logger = logging.getLogger("idealens.email")


class EmailService:
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        Sends an email via Resend API if configured, or logs in local dev mode.
        Never pretends an email was sent if an error occurs.
        """
        if settings.RESEND_API_KEY and not settings.RESEND_API_KEY.startswith("re_your_"):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "from": settings.EMAIL_FROM,
                            "to": [to_email],
                            "subject": subject,
                            "html": html_content,
                        },
                    )
                    if response.status_code in (200, 201):
                        logger.info(f"Email successfully dispatched to {to_email} via Resend")
                        return True
                    else:
                        logger.error(f"Resend error: {response.status_code} {response.text}")
                        return False
            except Exception as e:
                logger.error(f"Failed to communicate with Resend: {e}")
                return False

        # In local development mode without Resend key, explicitly log to stdout
        if not settings.is_production:
            logger.warning(
                f"[LOCAL DEV EMAIL SIMULATION - NOT SENT TO REAL INBOX]\n"
                f"To: {to_email}\n"
                f"Subject: {subject}\n"
                f"Content preview: {html_content[:200]}..."
            )
            return True

        logger.error(f"Email cannot be sent: No RESEND_API_KEY configured in production environment.")
        return False

    @classmethod
    async def send_verification_email(cls, to_email: str, full_name: str, token: str) -> bool:
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        subject = "Verify your IdeaLens account"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1E293B;">
            <h2 style="color: #2563EB;">Welcome to IdeaLens, {full_name}!</h2>
            <p>Please verify your email address to validate your business ideas with real-world market evidence.</p>
            <p style="margin: 28px 0;">
                <a href="{verify_url}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Verify My Email Address
                </a>
            </p>
            <p style="color: #64748B; font-size: 14px;">This link will expire in 24 hours. If you did not create an IdeaLens account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94A3B8;">Or copy this URL into your browser: {verify_url}</p>
        </div>
        """
        return await cls.send_email(to_email, subject, html)

    @classmethod
    async def send_password_reset_email(cls, to_email: str, full_name: str, token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Reset your IdeaLens password"
        html = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1E293B;">
            <h2 style="color: #2563EB;">Password Reset Request</h2>
            <p>Hello {full_name}, we received a request to reset your IdeaLens password.</p>
            <p style="margin: 28px 0;">
                <a href="{reset_url}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Reset Password
                </a>
            </p>
            <p style="color: #64748B; font-size: 14px;">This link is single-use and will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94A3B8;">Or copy this URL into your browser: {reset_url}</p>
        </div>
        """
        return await cls.send_email(to_email, subject, html)
