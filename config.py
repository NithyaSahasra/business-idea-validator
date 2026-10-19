from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DATABASE_URL: str = "sqlite:///./idealens_dev.db"
    JWT_SECRET: str = "idealens_jwt_super_secret_key_change_in_production_min32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    TAVILY_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "IdeaLens <no-reply@idealens.com>"

    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    MOCK_RESEARCH: bool = True
    ENVIRONMENT: str = "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.ENVIRONMENT.lower() == "production":
            if self.MOCK_RESEARCH:
                raise ValueError("MOCK_RESEARCH cannot be true in production environment!")
            if not self.JWT_SECRET or "change_in_production" in self.JWT_SECRET:
                raise ValueError("A secure JWT_SECRET must be configured in production!")
            if not self.DATABASE_URL or self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("A hosted MySQL database must be configured in production!")
        return self


settings = Settings()
