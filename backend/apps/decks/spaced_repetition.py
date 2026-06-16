import datetime
from django.utils import timezone

def score_from_rating(rating: str) -> int:
    """
    Map rating qualities to SuperMemo (SM-2) scores (0-5)
    'again' -> 1 (Complete blackout / incorrect)
    'hard'  -> 3 (Correct but struggled)
    'good'  -> 4 (Correct with mental hesitation)
    'easy'  -> 5 (Instant exact recall)
    """
    mapping = {
        'again': 1,
        'hard': 3,
        'good': 4,
        'easy': 5
    }
    return mapping.get(rating, 3)


def calculate_sm2(
    easiness_factor: float,
    interval_days: int,
    repetitions: int,
    rating: str
) -> tuple[float, int, int, datetime.datetime]:
    """
    SuperMemo-2 Spaced Repetition Algorithm.
    Returns:
        (new_easiness_factor, new_interval_days, new_repetitions, next_due_date)
    """
    score = score_from_rating(rating)

    if score >= 3:
        if repetitions == 0:
            interval_days = 1
        elif repetitions == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * easiness_factor)
        repetitions += 1
    else:
        # Incorrect retrieval - reset scheduling streak
        repetitions = 0
        interval_days = 1

    # Update difficulty rating (easiness factor)
    easiness_factor = easiness_factor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
    if easiness_factor < 1.3:
        easiness_factor = 1.3

    next_due_date = timezone.now() + datetime.timedelta(days=interval_days)

    return (
        round(easiness_factor, 2),
        interval_days,
        repetitions,
        next_due_date
    )
