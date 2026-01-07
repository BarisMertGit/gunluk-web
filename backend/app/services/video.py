import subprocess
import tempfile
import os
import json
from typing import Optional


class VideoProcessor:
    """FFmpeg-based video processing service."""
    
    @staticmethod
    async def compress_video(
        input_path: str,
        output_path: Optional[str] = None,
        quality: str = "medium"
    ) -> str:
        """
        Compress video using FFmpeg with H.264 codec.
        
        Args:
            input_path: Path to input video
            output_path: Path for output video (optional)
            quality: Quality preset (low, medium, high)
            
        Returns:
            Path to compressed video
        """
        crf_values = {"low": 28, "medium": 23, "high": 18}
        crf = crf_values.get(quality, 23)
        
        if not output_path:
            fd, output_path = tempfile.mkstemp(suffix=".mp4")
            os.close(fd)
        
        cmd = [
            "ffmpeg",
            "-i", input_path,
            "-c:v", "libx264",
            "-crf", str(crf),
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            "-y",
            output_path
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        return output_path
    
    @staticmethod
    async def generate_thumbnail(
        video_path: str,
        output_path: Optional[str] = None,
        timestamp: float = 1.0,
        width: int = 480
    ) -> str:
        """
        Extract thumbnail from video at specified timestamp.
        
        Args:
            video_path: Path to video file
            output_path: Path for output image (optional)
            timestamp: Time in seconds to extract frame
            width: Output width (height auto-scaled)
            
        Returns:
            Path to thumbnail image
        """
        if not output_path:
            fd, output_path = tempfile.mkstemp(suffix=".jpg")
            os.close(fd)
        
        cmd = [
            "ffmpeg",
            "-ss", str(timestamp),
            "-i", video_path,
            "-vframes", "1",
            "-vf", f"scale={width}:-1",
            "-y",
            output_path
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        return output_path
    
    @staticmethod
    async def get_duration(video_path: str) -> float:
        """
        Get video duration in seconds.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Duration in seconds
        """
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            video_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
        
        return float(data.get("format", {}).get("duration", 0))
    
    @staticmethod
    async def extract_audio(
        video_path: str,
        output_path: Optional[str] = None,
        format: str = "wav"
    ) -> str:
        """
        Extract audio track from video.
        
        Args:
            video_path: Path to video file
            output_path: Path for output audio (optional)
            format: Audio format (wav, mp3, etc.)
            
        Returns:
            Path to audio file
        """
        if not output_path:
            fd, output_path = tempfile.mkstemp(suffix=f".{format}")
            os.close(fd)
        
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vn",  # No video
            "-acodec", "pcm_s16le" if format == "wav" else "libmp3lame",
            "-ar", "16000",  # 16kHz for Whisper
            "-ac", "1",  # Mono
            "-y",
            output_path
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        return output_path
    
    @staticmethod
    async def create_preview_clip(
        video_path: str,
        output_path: Optional[str] = None,
        start: float = 0,
        duration: float = 5
    ) -> str:
        """
        Create a short preview clip from video.
        
        Args:
            video_path: Path to video file
            output_path: Path for output clip (optional)
            start: Start time in seconds
            duration: Clip duration in seconds
            
        Returns:
            Path to preview clip
        """
        if not output_path:
            fd, output_path = tempfile.mkstemp(suffix=".mp4")
            os.close(fd)
        
        cmd = [
            "ffmpeg",
            "-ss", str(start),
            "-i", video_path,
            "-t", str(duration),
            "-c:v", "libx264",
            "-crf", "28",
            "-preset", "ultrafast",
            "-an",  # No audio for preview
            "-y",
            output_path
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        return output_path
