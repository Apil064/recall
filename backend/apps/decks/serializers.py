from rest_framework import serializers
from .models import Deck, Flashcard

class FlashcardSerializer(serializers.ModelSerializer):
    is_due = serializers.SerializerMethodField()

    class Meta:
        model = Flashcard
        fields = [
            'id', 'deck', 'question', 'answer', 'explanation', 'mnemonic',
            'easiness_factor', 'interval_days', 'consecutive_repetitions',
            'due_date', 'last_reviewed_at', 'is_due'
        ]
        read_only_fields = [
            'easiness_factor', 'interval_days', 'consecutive_repetitions', 
            'due_date', 'last_reviewed_at'
        ]

    def get_is_due(self, obj):
        from django.utils import timezone
        return obj.due_date <= timezone.now()


class DeckSerializer(serializers.ModelSerializer):
    cards = FlashcardSerializer(many=True, read_only=True)
    cards_count = serializers.IntegerField(source='cards.count', read_only=True)
    mastery_percent = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'description', 'subject', 'tags', 
            'created_by', 'created_at', 'cards_count', 'mastery_percent', 'cards'
        ]
        read_only_fields = ['created_by']

    def get_mastery_percent(self, obj):
        total_cards = obj.cards.count()
        if total_cards == 0:
            return 0
        mature_cards = obj.cards.filter(interval_days__gt=15).count()
        young_cards = obj.cards.filter(interval_days__gt=0, interval_days__lte=15).count()
        return round(((mature_cards * 1.0 + young_cards * 0.45) / total_cards) * 100)
