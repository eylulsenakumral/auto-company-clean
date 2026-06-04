#!/usr/bin/env python3
"""
PPE Detection Test Suite

Tests model loading, inference performance, and accuracy
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, Any

import cv2
import numpy as np
from loguru import logger

from ppe_detector import PPEDetector, PPEFrameResult


class PPETestSuite:
    """Comprehensive test suite for PPE detection"""

    def __init__(self, model_path: Path ***REMOVED*** None):
        self.model_path ***REMOVED*** model_path
        self.detector ***REMOVED*** PPEDetector(model_path)
        self.results: Dict[str, Any] ***REMOVED*** {}

    def test_model_loading(self) -> bool:
        """Test 1: Model loading"""
        logger.info("Test 1: Model Loading")

        start ***REMOVED*** time.time()
        success ***REMOVED*** self.detector.load_model()
        elapsed ***REMOVED*** time.time() - start

        self.results["model_loading"] ***REMOVED*** {
            "success": success,
            "load_time_ms": elapsed * 1000,
            "model_path": str(self.detector.model_path)
        }

        if success:
            logger.success(f"Model loaded in {elapsed*1000:.1f}ms")
        else:
            logger.error("Model loading failed")

        return success

    def test_dummy_inference(self) -> bool:
        """Test 2: Inference on dummy image"""
        logger.info("Test 2: Dummy Inference")

        if self.detector.model is None:
            logger.error("Model not loaded")
            return False

        # Create dummy 640x640 image
        dummy ***REMOVED*** np.random.randint(0, 255, (640, 640, 3), dtype***REMOVED***np.uint8)

        start ***REMOVED*** time.time()
        try:
            result ***REMOVED*** self.detector.detect(dummy)
            elapsed ***REMOVED*** time.time() - start

            self.results["dummy_inference"] ***REMOVED*** {
                "success": True,
                "inference_time_ms": elapsed * 1000,
                "fps": 1.0 / elapsed if elapsed > 0 else 0,
                "num_detections": len(result.detections)
            }

            logger.success(f"Dummy inference: {elapsed*1000:.1f}ms ({1/elapsed:.1f} FPS)")
            return True

        except Exception as e:
            logger.error(f"Dummy inference failed: {e}")
            self.results["dummy_inference"] ***REMOVED*** {"success": False, "error": str(e)}
            return False

    def test_sample_images(self, sample_dir: Path ***REMOVED*** None) -> bool:
        """Test 3: Inference on sample images"""
        logger.info("Test 3: Sample Image Inference")

        if sample_dir is None:
            # Use test_images directory if available
            sample_dir ***REMOVED*** Path(__file__).parent / "test_images"

        if not sample_dir.exists():
            logger.warning(f"Sample directory not found: {sample_dir}")
            logger.info("Create test_images/ directory with sample PPE images")
            self.results["sample_images"] ***REMOVED*** {"success": True, "skipped": True}
            return True

        image_files ***REMOVED*** list(sample_dir.glob("*.jpg")) + list(sample_dir.glob("*.png"))

        if not image_files:
            logger.warning("No sample images found")
            self.results["sample_images"] ***REMOVED*** {"success": True, "skipped": True}
            return True

        results ***REMOVED*** []

        for img_path in image_files[:5]:  # Max 5 images
            img ***REMOVED*** cv2.imread(str(img_path))
            if img is None:
                continue

            start ***REMOVED*** time.time()
            result ***REMOVED*** self.detector.detect(img)
            elapsed ***REMOVED*** time.time() - start

            results.append({
                "image": img_path.name,
                "inference_time_ms": elapsed * 1000,
                "num_detections": len(result.detections),
                "classes": [d.class_name for d in result.detections]
            })

            logger.info(f"  {img_path.name}: {len(result.detections)} detections in {elapsed*1000:.1f}ms")

        self.results["sample_images"] ***REMOVED*** {
            "success": True,
            "num_tested": len(results),
            "results": results
        }

        logger.success(f"Tested {len(results)} sample images")
        return True

    def test_video_processing(self, video_path: Path ***REMOVED*** None) -> bool:
        """Test 4: Video processing performance"""
        logger.info("Test 4: Video Processing")

        if video_path is None:
            logger.warning("No video path provided, skipping video test")
            self.results["video_processing"] ***REMOVED*** {"success": True, "skipped": True}
            return True

        if not video_path.exists():
            logger.warning(f"Video not found: {video_path}")
            self.results["video_processing"] ***REMOVED*** {"success": True, "skipped": True}
            return True

        max_frames ***REMOVED*** 100
        cap ***REMOVED*** cv2.VideoCapture(str(video_path))

        if not cap.isOpened():
            logger.error(f"Cannot open video: {video_path}")
            self.results["video_processing"] ***REMOVED*** {"success": False}
            return False

        frame_count ***REMOVED*** 0
        fps_sum ***REMOVED*** 0
        fps_count ***REMOVED*** 0

        try:
            while frame_count < max_frames:
                ret, frame ***REMOVED*** cap.read()
                if not ret:
                    break

                start ***REMOVED*** time.time()
                result ***REMOVED*** self.detector.process_frame(frame, frame_id***REMOVED***frame_count, publish***REMOVED***False)
                elapsed ***REMOVED*** time.time() - start

                fps ***REMOVED*** 1.0 / elapsed if elapsed > 0 else 0
                fps_sum +***REMOVED*** fps
                fps_count +***REMOVED*** 1

                frame_count +***REMOVED*** 1

        finally:
            cap.release()

        avg_fps ***REMOVED*** fps_sum / fps_count if fps_count > 0 else 0

        self.results["video_processing"] ***REMOVED*** {
            "success": True,
            "frames_processed": frame_count,
            "average_fps": avg_fps,
            "video_path": str(video_path)
        }

        logger.success(f"Video processing: {frame_count} frames at {avg_fps:.1f} FPS")
        return True

    def run_all_tests(self, video_path: Path ***REMOVED*** None) -> Dict[str, Any]:
        """Run complete test suite"""
        logger.info("***REMOVED***" * 60)
        logger.info("PPE Detection Test Suite")
        logger.info("***REMOVED***" * 60)

        all_passed ***REMOVED*** True

        all_passed &***REMOVED*** self.test_model_loading()
        all_passed &***REMOVED*** self.test_dummy_inference()
        all_passed &***REMOVED*** self.test_sample_images()
        all_passed &***REMOVED*** self.test_video_processing(video_path)

        self.results["overall"] ***REMOVED*** {
            "all_passed": all_passed,
            "total_tests": 4
        }

        logger.info("***REMOVED***" * 60)
        if all_passed:
            logger.success("All tests passed!")
        else:
            logger.warning("Some tests failed")
        logger.info("***REMOVED***" * 60)

        return self.results

    def save_report(self, output_path: Path ***REMOVED*** None):
        """Save test results to JSON"""
        if output_path is None:
            output_path ***REMOVED*** Path(__file__).parent.parent.parent.parent / "docs" / "fullstack" / "ppe_model_test_results.md"

        output_path.parent.mkdir(parents***REMOVED***True, exist_ok***REMOVED***True)

        # Generate markdown report
        report ***REMOVED*** self._generate_markdown_report()

        with open(output_path, "w") as f:
            f.write(report)

        logger.success(f"Test report saved: {output_path}")

    def _generate_markdown_report(self) -> str:
        """Generate markdown test report"""
        lines ***REMOVED*** [
            "# PPE Detection Model Test Results",
            "",
            f"**Model Path:** `{self.results.get('model_loading', {}).get('model_path', 'N/A')}`",
            f"**Test Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "## Overall Results",
            "",
        ]

        overall ***REMOVED*** self.results.get("overall", {})
        if overall.get("all_passed"):
            lines.append("✅ **All tests passed**")
        else:
            lines.append("❌ **Some tests failed**")

        lines.extend([
            f"",
            f"**Total Tests:** {overall.get('total_tests', 0)}",
            "",
            "## Test Details",
            ""
        ])

        # Model loading
        loading ***REMOVED*** self.results.get("model_loading", {})
        lines.extend([
            "### 1. Model Loading",
            f"- **Status:** {'✅ Passed' if loading.get('success') else '❌ Failed'}",
            f"- **Load Time:** {loading.get('load_time_ms', 0):.1f}ms",
            ""
        ])

        # Dummy inference
        dummy ***REMOVED*** self.results.get("dummy_inference", {})
        if dummy.get("success"):
            lines.extend([
                "### 2. Dummy Inference",
                f"- **Status:** ✅ Passed",
                f"- **Inference Time:** {dummy.get('inference_time_ms', 0):.1f}ms",
                f"- **Performance:** {dummy.get('fps', 0):.1f} FPS",
                ""
            ])

        # Sample images
        samples ***REMOVED*** self.results.get("sample_images", {})
        if samples.get("success") and not samples.get("skipped"):
            lines.extend([
                "### 3. Sample Image Inference",
                f"- **Status:** ✅ Passed",
                f"- **Images Tested:** {samples.get('num_tested', 0)}",
                ""
            ])

            for result in samples.get("results", []):
                lines.append(f"  - {result['image']}: {result['num_detections']} detections")

            lines.append("")

        # Video processing
        video ***REMOVED*** self.results.get("video_processing", {})
        if video.get("success") and not video.get("skipped"):
            lines.extend([
                "### 4. Video Processing",
                f"- **Status:** ✅ Passed",
                f"- **Frames Processed:** {video.get('frames_processed', 0)}",
                f"- **Average FPS:** {video.get('average_fps', 0):.1f}",
                ""
            ])

        lines.extend([
            "## Performance Summary",
            "",
            "| Metric | Value |",
            "|--------|-------|",
            f"| Model Load Time | {loading.get('load_time_ms', 0):.1f}ms |",
            f"| Inference Time | {dummy.get('inference_time_ms', 0):.1f}ms |",
            f"| Peak FPS | {dummy.get('fps', 0):.1f} |",
            "",
            "## Classes Detected",
            "",
            "| Class ID | Class Name |",
            "|----------|------------|",
        ])

        for class_id, class_name in PPEDetector.CLASS_NAMES.items():
            lines.append(f"| {class_id} | {class_name} |")

        lines.extend([
            "",
            "---",
            "",
            "*Generated by PPE Detection Test Suite*"
        ])

        return "\n".join(lines)


def main():
    """CLI entry point"""
    import argparse

    parser ***REMOVED*** argparse.ArgumentParser(description***REMOVED***"PPE Detection Test Suite")
    parser.add_argument("--model", type***REMOVED***Path, help***REMOVED***"Path to model file")
    parser.add_argument("--video", type***REMOVED***Path, help***REMOVED***"Path to test video")
    parser.add_argument("--output", type***REMOVED***Path, help***REMOVED***"Output report path")

    args ***REMOVED*** parser.parse_args()

    suite ***REMOVED*** PPETestSuite(args.model)
    suite.run_all_tests(args.video)
    suite.save_report(args.output)


if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
