"""
PPE Detection Worker for NextVision
YOLOv8-based Personal Protective Equipment detection

Target classes: helmet, vest, gloves, safety_shoe, goggles, mask
"""

import os
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import cv2
import numpy as np
from ultralytics import YOLO
import redis
from loguru import logger

from config import settings


@dataclass
class Detection:
    """Single detection result"""
    class_id: int
    class_name: str
    confidence: float
    bbox: List[int]  # [x1, y1, x2, y2]


@dataclass
class PPEFrameResult:
    """Complete PPE detection result for a frame"""
    frame_id: int
    timestamp: float
    detections: List[Detection]
    image_shape: tuple


class PPEDetector:
    """
    YOLOv8-based PPE detection

    Production-ready, optimized for edge deployment
    """

    # Class mapping (matches HuggingFace model)
    CLASS_NAMES ***REMOVED*** {
        0: "Gloves",
        1: "Vest",
        2: "goggles",
        3: "helmet",
        4: "mask",
        5: "safety_shoe"
    }

    def __init__(self, model_path: Optional[str] ***REMOVED*** None):
        """
        Initialize PPE detector

        Args:
            model_path: Path to .pt model file (defaults to models/ppe_detector.pt)
        """
        if model_path is None:
            model_path ***REMOVED*** settings.MODEL_PATH

        self.model_path ***REMOVED*** Path(model_path)
        self.model ***REMOVED*** None
        self.redis_client ***REMOVED*** None

        logger.info(f"PPE Detector initialized with model: {self.model_path}")

    def load_model(self) -> bool:
        """Load YOLOv8 model into memory"""
        try:
            if not self.model_path.exists():
                logger.error(f"Model file not found: {self.model_path}")
                logger.info("Download model from: https://huggingface.co/Tanishjain9/yolov8n-ppe-detection-6classes")
                return False

            self.model ***REMOVED*** YOLO(str(self.model_path))
            logger.info(f"Model loaded successfully: {self.model_path}")

            # Warmup
            dummy ***REMOVED*** np.zeros((640, 640, 3), dtype***REMOVED***np.uint8)
            _ ***REMOVED*** self.model.predict(dummy, verbose***REMOVED***False)

            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    def connect_redis(self) -> bool:
        """Connect to Redis for pub/sub"""
        try:
            self.redis_client ***REMOVED*** redis.Redis(
                host***REMOVED***settings.REDIS_HOST,
                port***REMOVED***settings.REDIS_PORT,
                db***REMOVED***settings.REDIS_DB,
                decode_responses***REMOVED***True
            )

            # Test connection
            self.redis_client.ping()
            logger.info(f"Connected to Redis: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
            return True

        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            return False

    def detect(
        self,
        image: np.ndarray,
        conf_threshold: float ***REMOVED*** 0.25,
        iou_threshold: float ***REMOVED*** 0.45
    ) -> PPEFrameResult:
        """
        Run PPE detection on a single frame

        Args:
            image: Input image (BGR format from OpenCV)
            conf_threshold: Confidence threshold for detections
            iou_threshold: IoU threshold for NMS

        Returns:
            PPEFrameResult with all detections
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        start_time ***REMOVED*** time.time()

        # Run inference
        results ***REMOVED*** self.model.predict(
            image,
            conf***REMOVED***conf_threshold,
            iou***REMOVED***iou_threshold,
            imgsz***REMOVED***640,
            verbose***REMOVED***False
        )[0]

        # Parse detections
        detections ***REMOVED*** []

        if results.boxes is not None:
            boxes ***REMOVED*** results.boxes.cpu().numpy()

            for box in boxes:
                class_id ***REMOVED*** int(box.cls[0])
                confidence ***REMOVED*** float(box.conf[0])
                bbox ***REMOVED*** box.xyxy[0].astype(int).tolist()

                detections.append(Detection(
                    class_id***REMOVED***class_id,
                    class_name***REMOVED***self.CLASS_NAMES.get(class_id, "unknown"),
                    confidence***REMOVED***confidence,
                    bbox***REMOVED***bbox
                ))

        return PPEFrameResult(
            frame_id***REMOVED***0,  # Will be set by worker
            timestamp***REMOVED***time.time(),
            detections***REMOVED***detections,
            image_shape***REMOVED***image.shape
        )

    def publish_result(self, result: PPEFrameResult, channel: str ***REMOVED*** "ppe:detections"):
        """Publish detection results to Redis"""
        if self.redis_client is None:
            logger.warning("Redis not connected, skipping publish")
            return

        # Convert to JSON-serializable format
        payload ***REMOVED*** {
            "frame_id": result.frame_id,
            "timestamp": result.timestamp,
            "image_shape": result.image_shape,
            "detections": [
                {
                    "class_id": d.class_id,
                    "class_name": d.class_name,
                    "confidence": d.confidence,
                    "bbox": d.bbox
                }
                for d in result.detections
            ]
        }

        try:
            self.redis_client.publish(channel, json.dumps(payload))
            logger.debug(f"Published {len(result.detections)} detections to {channel}")

        except Exception as e:
            logger.error(f"Failed to publish result: {e}")

    def process_frame(
        self,
        image: np.ndarray,
        frame_id: int,
        publish: bool ***REMOVED*** True
    ) -> PPEFrameResult:
        """
        Complete pipeline: detect + publish

        Args:
            image: Input frame
            frame_id: Sequential frame identifier
            publish: Whether to publish to Redis

        Returns:
            PPEFrameResult
        """
        result ***REMOVED*** self.detect(image)
        result.frame_id ***REMOVED*** frame_id

        if publish:
            self.publish_result(result)

        return result

    def run_stream_demo(self, video_path: str, max_frames: int ***REMOVED*** 100):
        """
        Demo: Run detection on video file

        Args:
            video_path: Path to video file
            max_frames: Maximum frames to process (for testing)
        """
        cap ***REMOVED*** cv2.VideoCapture(video_path)

        if not cap.isOpened():
            logger.error(f"Cannot open video: {video_path}")
            return

        frame_count ***REMOVED*** 0
        fps_sum ***REMOVED*** 0
        fps_count ***REMOVED*** 0

        logger.info(f"Starting demo on {video_path}")

        try:
            while frame_count < max_frames:
                ret, frame ***REMOVED*** cap.read()
                if not ret:
                    break

                start ***REMOVED*** time.time()
                result ***REMOVED*** self.process_frame(frame, frame_id***REMOVED***frame_count, publish***REMOVED***False)
                elapsed ***REMOVED*** time.time() - start

                fps ***REMOVED*** 1.0 / elapsed if elapsed > 0 else 0
                fps_sum +***REMOVED*** fps
                fps_count +***REMOVED*** 1

                if frame_count % 10 ***REMOVED******REMOVED*** 0:
                    avg_fps ***REMOVED*** fps_sum / fps_count if fps_count > 0 else 0
                    logger.info(
                        f"Frame {frame_count}: {len(result.detections)} detections, "
                        f"FPS: {avg_fps:.1f}"
                    )

                frame_count +***REMOVED*** 1

        finally:
            cap.release()
            avg_fps ***REMOVED*** fps_sum / fps_count if fps_count > 0 else 0
            logger.info(f"Demo complete. Processed {frame_count} frames at {avg_fps:.1f} FPS")


def main():
    """Demo entry point"""
    detector ***REMOVED*** PPEDetector()

    if not detector.load_model():
        logger.error("Failed to load model")
        return

    logger.info("PPE Detector ready")
    logger.info("Classes: " + ", ".join(detector.CLASS_NAMES.values()))
    logger.info("Model: " + str(detector.model_path))


if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
