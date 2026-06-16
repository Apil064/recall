import os
from celery import shared_task
import google.generativeai as genai
from django.conf import settings
from apps.decks.models import Deck, Flashcard
import json
from django.utils import timezone

@shared_task
def generate_ai_flashcards_task(deck_id, notes_text, target_complexity, card_count=8):
    """
    Celery task running asynchronously in the background. Isolate deep network latency
    and heavy generative processing away from API threads.
    """
    try:
        deck = Deck.objects.get(id=deck_id)
    except Deck.DoesNotExist:
        return f"Deck {deck_id} does not exist. Aborting ai generation task."

    # Configure the Gemini client safely inside the lazy-load worker process
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "GEMINI_API_KEY missing in environment secrets. Task halted."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3.5-flash')

    system_instruction = (
        "You are an educational memory scientist. Divide complex textbooks "
        "into short individual questions (front card) paired with precise "
        "atomic descriptions (back card). Return purely a valid JSON list of "
        "objects containing 'question' and 'answer'."
    )

    prompt = (
        f"Deconstruct the academic material into exactly {card_count} active recall cards.\n"
        f"Complexity requirement: '{target_complexity}'\n\n"
        f"Academic material:\n\"{notes_text}\""
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "system_instruction": system_instruction
            }
        )
        
        cards_raw = json.loads(response.text.strip())
        
        # Batch insert created flashcards matching proper schemas
        for item in cards_raw:
            Flashcard.objects.create(
                deck=deck,
                question=item.get('question'),
                answer=item.get('answer'),
                due_date=timezone.now()
            )
            
        return f"Successfully compiled and stored {len(cards_raw)} flashcards in Deck {deck.title}."
        
    except Exception as e:
        return f"Generative compilation failed: {str(e)}"
