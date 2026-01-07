from typing import Optional, Dict
from app.config import settings


class SpeechToText:
    """OpenAI Whisper-based speech-to-text service."""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        """Singleton pattern to avoid loading model multiple times."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _load_model(self):
        """Lazy load the Whisper model."""
        if self._model is None:
            import whisper
            self._model = whisper.load_model(settings.WHISPER_MODEL)
        return self._model
    
    async def transcribe(
        self,
        audio_path: str,
        language: str = "tr"
    ) -> Dict:
        """
        Transcribe audio to text using OpenAI Whisper.
        
        Args:
            audio_path: Path to audio file (wav, mp3, etc.)
            language: Language code (tr for Turkish)
            
        Returns:
            Dictionary with text, segments, and language
        """
        try:
            model = self._load_model()
            
            result = model.transcribe(
                audio_path,
                language=language,
                task="transcribe",
                verbose=False
            )
            
            return {
                "text": result.get("text", "").strip(),
                "segments": result.get("segments", []),
                "language": result.get("language", language)
            }
        except Exception as e:
            print(f"Transcription error: {e}")
            return {
                "text": "",
                "segments": [],
                "language": language,
                "error": str(e)
            }
    
    async def detect_language(self, audio_path: str) -> str:
        """
        Detect the language of the audio.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Detected language code
        """
        try:
            model = self._load_model()
            
            # Load audio and pad/trim to 30 seconds
            import whisper
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)
            
            # Make log-Mel spectrogram
            mel = whisper.log_mel_spectrogram(audio).to(model.device)
            
            # Detect language
            _, probs = model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            
            return detected_lang
        except Exception as e:
            print(f"Language detection error: {e}")
            return "tr"  # Default to Turkish


# Alternative implementation using OpenAI API (if Whisper model is too heavy)
class SpeechToTextAPI:
    """OpenAI API-based speech-to-text (alternative to local Whisper)."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
    
    async def transcribe(
        self,
        audio_path: str,
        language: str = "tr"
    ) -> Dict:
        """
        Transcribe audio using OpenAI API.
        
        Requires OPENAI_API_KEY environment variable.
        """
        try:
            from openai import OpenAI
            
            client = OpenAI(api_key=self.api_key)
            
            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="verbose_json"
                )
            
            return {
                "text": transcript.text,
                "segments": transcript.segments if hasattr(transcript, "segments") else [],
                "language": transcript.language if hasattr(transcript, "language") else language
            }
        except Exception as e:
            print(f"API transcription error: {e}")
            return {
                "text": "",
                "segments": [],
                "language": language,
                "error": str(e)
            }
