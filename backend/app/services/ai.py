from typing import List, Optional
import re


class AIService:
    """AI service for summarization and auto-tagging."""
    
    _instance = None
    _summarizer = None
    _sentiment_analyzer = None
    
    # Turkish keywords for auto-tagging
    KEYWORDS = {
        "iş": ["iş", "çalışma", "ofis", "toplantı", "proje", "müşteri"],
        "aile": ["aile", "anne", "baba", "kardeş", "çocuk", "eş"],
        "arkadaş": ["arkadaş", "dostlar", "buluşma", "parti"],
        "sağlık": ["sağlık", "doktor", "hastane", "spor", "egzersiz", "koşu"],
        "eğlence": ["film", "dizi", "müzik", "konser", "oyun"],
        "yemek": ["yemek", "restoran", "kahve", "kahvaltı", "akşam yemeği"],
        "seyahat": ["seyahat", "tatil", "gezi", "uçuş", "otel"],
        "stres": ["stres", "endişe", "kaygı", "gergin", "yorgun"],
        "başarı": ["başarı", "kazandım", "tamamladım", "bitirdim"],
        "öğrenme": ["öğrendim", "kurs", "kitap", "okudum", "araştırma"],
    }
    
    # Mood-related words for sentiment
    POSITIVE_WORDS = [
        "mutlu", "harika", "güzel", "mükemmel", "sevindim", "başardım",
        "huzurlu", "neşeli", "keyifli", "eğlenceli", "minnettar"
    ]
    
    NEGATIVE_WORDS = [
        "üzgün", "kötü", "sinirli", "yorgun", "stresli", "endişeli",
        "hayal kırıklığı", "mutsuz", "sıkıcı", "berbat", "korkunç"
    ]
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _load_summarizer(self):
        """Lazy load the summarization model."""
        if self._summarizer is None:
            try:
                from transformers import pipeline
                self._summarizer = pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn",
                    device=-1  # CPU
                )
            except Exception as e:
                print(f"Could not load summarizer: {e}")
                self._summarizer = None
        return self._summarizer
    
    async def summarize(self, text: str, max_length: int = 100) -> str:
        """
        Generate a summary from the transcript.
        
        Args:
            text: Full transcript text
            max_length: Maximum summary length
            
        Returns:
            Summary text (2-3 sentences)
        """
        if not text or len(text.split()) < 30:
            return text
        
        try:
            summarizer = self._load_summarizer()
            if summarizer:
                # BART requires English, so for Turkish we use extractive summary
                # or translate -> summarize -> translate back
                # For now, use simple extractive approach
                return self._extractive_summary(text, max_sentences=2)
            else:
                return self._extractive_summary(text, max_sentences=2)
        except Exception as e:
            print(f"Summarization error: {e}")
            return self._extractive_summary(text, max_sentences=2)
    
    def _extractive_summary(self, text: str, max_sentences: int = 2) -> str:
        """Simple extractive summarization for Turkish text."""
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= max_sentences:
            return text
        
        # Score sentences by keyword importance
        scored = []
        for i, sentence in enumerate(sentences):
            score = 0
            words = sentence.lower().split()
            
            # First sentence bonus
            if i == 0:
                score += 2
            
            # Keyword scoring
            for category, keywords in self.KEYWORDS.items():
                for keyword in keywords:
                    if keyword in sentence.lower():
                        score += 1
            
            # Length penalty for very short sentences
            if len(words) < 5:
                score -= 1
            
            scored.append((score, i, sentence))
        
        # Get top sentences in original order
        scored.sort(reverse=True)
        top_indices = sorted([s[1] for s in scored[:max_sentences]])
        
        summary = ". ".join([sentences[i] for i in top_indices])
        return summary + "."
    
    async def auto_tag(self, text: str) -> List[str]:
        """
        Extract relevant tags from text.
        
        Args:
            text: Transcript or note text
            
        Returns:
            List of relevant tags (max 5)
        """
        if not text:
            return []
        
        text_lower = text.lower()
        found_tags = []
        
        for tag, keywords in self.KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if tag not in found_tags:
                        found_tags.append(tag)
                    break
        
        return found_tags[:5]
    
    async def analyze_sentiment(self, text: str) -> float:
        """
        Analyze sentiment of the text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Sentiment score from -1 (negative) to 1 (positive)
        """
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in self.POSITIVE_WORDS if word in text_lower)
        negative_count = sum(1 for word in self.NEGATIVE_WORDS if word in text_lower)
        
        total = positive_count + negative_count
        if total == 0:
            return 0.0
        
        score = (positive_count - negative_count) / max(total, 1)
        return max(-1.0, min(1.0, score))
    
    async def suggest_mood(self, text: str) -> Optional[str]:
        """
        Suggest a mood based on text analysis.
        
        Args:
            text: Transcript or note text
            
        Returns:
            Suggested mood type
        """
        sentiment = await self.analyze_sentiment(text)
        
        mood_map = {
            (0.5, 1.0): "happy",
            (0.2, 0.5): "peaceful",
            (-0.2, 0.2): "neutral",
            (-0.5, -0.2): "anxious",
            (-1.0, -0.5): "sad"
        }
        
        for (low, high), mood in mood_map.items():
            if low <= sentiment < high:
                return mood
        
        return "neutral"
