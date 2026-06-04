"""
Configuration for PPE Detection Worker
Environment-based settings for production deployment
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings"""

    # Model paths
    MODEL_PATH ***REMOVED*** os.getenv(
        "MODEL_PATH",
        Path(__file__).parent.parent.parent / "models" / "ppe_detector.pt"
    )

    # Redis connection
    REDIS_HOST ***REMOVED*** os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT ***REMOVED*** int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB ***REMOVED*** int(os.getenv("REDIS_DB", "0"))

    # Detection thresholds
    CONFIDENCE_THRESHOLD ***REMOVED*** float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
    IOU_THRESHOLD ***REMOVED*** float(os.getenv("IOU_THRESHOLD", "0.45"))

    # Processing
    IMAGE_SIZE ***REMOVED*** int(os.getenv("IMAGE_SIZE", "640"))
    MAX_BATCH_SIZE ***REMOVED*** int(os.getenv("MAX_BATCH_SIZE", "1"))

    # Logging
    LOG_LEVEL ***REMOVED*** os.getenv("LOG_LEVEL", "INFO")

    # Performance monitoring
    ENABLE_METRICS ***REMOVED*** os.getenv("ENABLE_METRICS", "true").lower() ***REMOVED******REMOVED*** "true"


settings ***REMOVED*** Settings()
