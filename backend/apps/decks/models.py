from django.db import models
from django.conf import settings

class Deck(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    subject = models.CharField(max_length=150, db_index=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_decks'
    )

    class Meta:
        db_table = 'recall_decks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.subject})"


class Flashcard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')
    question = models.TextField()
    answer = models.TextField()
    explanation = models.TextField(blank=True, null=True)
    mnemonic = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Spaced Repetition (SM-2 Algorithm variables)
    easiness_factor = models.FloatField(default=2.5)
    interval_days = models.PositiveIntegerField(default=0)
    consecutive_repetitions = models.PositiveIntegerField(default=0)
    due_date = models.DateTimeField(db_index=True)
    last_reviewed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'recall_flashcards'
        ordering = ['due_date']

    def __str__(self):
        return f"Q: {self.question[:30]}..."
