import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
import jwt
from passlib.hash import argon2
from sqlalchemy.orm import Session
from app.config import settings
from app.models import User, AuthToken


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return argon2.using(type="ID").hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return argon2.verify(plain_password, hashed_password)
        except Exception:
            return False

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @staticmethod
    def create_access_token(user_id: int, email: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(user_id),
            "email": email,
            "exp": expire,
            "type": "access"
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

    @staticmethod
    def decode_access_token(token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            if payload.get("type") != "access":
                return None
            return payload
        except jwt.PyJWTError:
            return None

    @classmethod
    def create_verification_token(cls, db: Session, user_id: int) -> str:
        raw_token = secrets.token_urlsafe(32)
        token_hash = cls.hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

        token_record = AuthToken(
            user_id=user_id,
            token_hash=token_hash,
            purpose="email_verification",
            expires_at=expires_at,
            used_at=None
        )
        db.add(token_record)
        db.commit()
        return raw_token

    @classmethod
    def verify_email_token(cls, db: Session, raw_token: str) -> Optional[User]:
        token_hash = cls.hash_token(raw_token)
        now = datetime.now(timezone.utc)
        record = (
            db.query(AuthToken)
            .filter(
                AuthToken.token_hash == token_hash,
                AuthToken.purpose == "email_verification",
                AuthToken.used_at.is_(None),
                AuthToken.expires_at > now
            )
            .first()
        )
        if not record:
            return None

        record.used_at = now
        record.user.is_email_verified = True
        db.commit()
        db.refresh(record.user)
        return record.user

    @classmethod
    def create_password_reset_token(cls, db: Session, user_id: int) -> str:
        raw_token = secrets.token_urlsafe(32)
        token_hash = cls.hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        token_record = AuthToken(
            user_id=user_id,
            token_hash=token_hash,
            purpose="password_reset",
            expires_at=expires_at,
            used_at=None
        )
        db.add(token_record)
        db.commit()
        return raw_token

    @classmethod
    def reset_password(cls, db: Session, raw_token: str, new_password: str) -> Optional[User]:
        token_hash = cls.hash_token(raw_token)
        now = datetime.now(timezone.utc)
        record = (
            db.query(AuthToken)
            .filter(
                AuthToken.token_hash == token_hash,
                AuthToken.purpose == "password_reset",
                AuthToken.used_at.is_(None),
                AuthToken.expires_at > now
            )
            .first()
        )
        if not record:
            return None

        record.used_at = now
        user = record.user
        user.password_hash = cls.hash_password(new_password)

        # Invalidate all existing refresh tokens for security
        cls.revoke_all_user_refresh_tokens(db, user.id)

        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def create_refresh_token(cls, db: Session, user_id: int) -> str:
        raw_token = secrets.token_urlsafe(48)
        token_hash = cls.hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        token_record = AuthToken(
            user_id=user_id,
            token_hash=token_hash,
            purpose="refresh_token",
            expires_at=expires_at,
            used_at=None
        )
        db.add(token_record)
        db.commit()
        return raw_token

    @classmethod
    def rotate_refresh_token(cls, db: Session, raw_token: str) -> Optional[Tuple[str, User]]:
        token_hash = cls.hash_token(raw_token)
        now = datetime.now(timezone.utc)
        record = (
            db.query(AuthToken)
            .filter(
                AuthToken.token_hash == token_hash,
                AuthToken.purpose == "refresh_token",
                AuthToken.used_at.is_(None),
                AuthToken.expires_at > now
            )
            .first()
        )
        if not record:
            return None

        # Revoke old refresh token
        record.used_at = now

        # Create new rotated refresh token
        new_raw_token = secrets.token_urlsafe(48)
        new_hash = cls.hash_token(new_raw_token)
        new_expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        new_record = AuthToken(
            user_id=record.user_id,
            token_hash=new_hash,
            purpose="refresh_token",
            expires_at=new_expires_at,
            used_at=None
        )
        db.add(new_record)
        db.commit()
        db.refresh(record.user)
        return new_raw_token, record.user

    @classmethod
    def revoke_refresh_token(cls, db: Session, raw_token: str) -> bool:
        token_hash = cls.hash_token(raw_token)
        record = (
            db.query(AuthToken)
            .filter(
                AuthToken.token_hash == token_hash,
                AuthToken.purpose == "refresh_token",
                AuthToken.used_at.is_(None)
            )
            .first()
        )
        if record:
            record.used_at = datetime.now(timezone.utc)
            db.commit()
            return True
        return False

    @classmethod
    def revoke_all_user_refresh_tokens(cls, db: Session, user_id: int):
        now = datetime.now(timezone.utc)
        db.query(AuthToken).filter(
            AuthToken.user_id == user_id,
            AuthToken.purpose == "refresh_token",
            AuthToken.used_at.is_(None)
        ).update({"used_at": now})
        db.commit()
