import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod';
import '../../core/services/sync_service.dart';

class FlashcardState {
  final String id;
  final String question;
  final String answer;
  final double easinessFactor;
  final int intervalDays;
  final int repetitions;
  final DateTime dueDate;

  FlashcardState({
    required this.id,
    required this.question,
    required this.answer,
    required this.easinessFactor,
    required this.intervalDays,
    required this.repetitions,
    required this.dueDate,
  });

  FlashcardState copyWith({
    double? easinessFactor,
    int? intervalDays,
    int? repetitions,
    DateTime? dueDate,
  }) {
    return FlashcardState(
      id: id,
      question: question,
      answer: answer,
      easinessFactor: easinessFactor ?? this.easinessFactor,
      intervalDays: intervalDays ?? this.intervalDays,
      repetitions: repetitions ?? this.repetitions,
      dueDate: dueDate ?? this.dueDate,
    );
  }
}

class SpacedRepetitionStudyController extends StateNotifier<List<FlashcardState>> {
  final SpacedRecallSyncService _syncService;

  SpacedRepetitionStudyController(this._syncService, List<FlashcardState> initialCards)
      : super(initialCards);

  /// Evaluate card recall quality using Dart SM-2 algorithm, and trigger double-directional sync
  Future<void> submitStudyReview({
    required String cardId,
    required String rating, // 'again', 'hard', 'good', 'easy'
  }) async {
    // 1. Identify rating score match
    int score = 3;
    if (rating == 'again') score = 1;
    if (rating == 'hard') score = 3;
    if (rating == 'good') score = 4;
    if (rating == 'easy') score = 5;

    // 2. Map and compute target SM-2 scheduling parameters locally
    state = state.map((card) {
      if (card.id == cardId) {
        double newEf = card.easinessFactor;
        int newInterval = card.intervalDays;
        int newReps = card.repetitions;

        if (score >= 3) {
          if (newReps == 0) {
            newInterval = 1;
          } else if (newReps == 1) {
            newInterval = 6;
          } else {
            newInterval = (newInterval * newEf).round();
          }
          newReps += 1;
        } else {
          newReps = 0;
          newInterval = 1;
        }

        newEf = newEf + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
        newEf = max(1.3, newEf);

        return card.copyWith(
          easinessFactor: double.parse(newEf.toStringAsFixed(2)),
          intervalDays: newInterval,
          repetitions: newReps,
          dueDate: DateTime.now().add(Duration(days: newInterval)),
        );
      }
      return card;
    }).toList();

    // 3. Queue up review logs offline-first for Django background uploads
    await _syncService.recordCardStudyReview(cardId: cardId, rating: rating);
  }
}
