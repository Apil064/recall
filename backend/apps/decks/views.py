from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Deck, Flashcard
from .serializers import DeckSerializer, FlashcardSerializer
from .spaced_repetition import calculate_sm2

class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer

    def get_queryset(self):
        return Deck.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FlashcardViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardSerializer

    def get_queryset(self):
        return Flashcard.objects.filter(deck__created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='review')
    def review_card(self, request, pk=None):
        """
        Submits a review for a specific card following SuperMemo (SM-2) guidelines.
        Payload: {"rating": "again" | "hard" | "good" | "easy"}
        """
        card = self.get_object()
        rating = request.data.get('rating')

        if not rating or rating not in ['again', 'hard', 'good', 'easy']:
            return Response(
                {"error": "Please specify a valid SM-2 review rating: 'again', 'hard', 'good', or 'easy'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Re-evaluate spacing intervals using the math engine
        ef, interval, reps, due = calculate_sm2(
            easiness_factor=card.easiness_factor,
            interval_days=card.interval_days,
            repetitions=card.consecutive_repetitions,
            rating=rating
        )

        card.easiness_factor = ef
        card.interval_days = interval
        card.consecutive_repetitions = reps
        card.due_date = due
        card.last_reviewed_at = timezone.now()
        card.save()

        # Update user study streak and heatmap representation in databases
        user = request.user
        user.study_streak_days += 1
        user.save()

        serializer = self.get_serializer(card)
        return Response({
            "status": "Review saved successfully.",
            "card": serializer.data,
            "next_due_date": due,
            "easiness_factor": ef,
            "interval_days": interval
        }, status=status.HTTP_200_OK)
