import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';

class ReviewSyncPayload {
  final String cardId;
  final String rating;
  final String timestamp;

  ReviewSyncPayload({
    required this.cardId,
    required this.rating,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'card_id': cardId,
    'rating': rating,
    'timestamp': timestamp,
  };
}

class SpacedRecallSyncService {
  final Dio _dio;
  final Box _cacheBox = Hive.box('recall_offline_cache');
  final Box _queueBox = Hive.box('study_reviews_queue');

  SpacedRecallSyncService(this._dio);

  /// Record review instantly. Decouple network states: if offline or laggy,
  /// record review in Hive and scheduling changes locally immediately.
  Future<void> recordCardStudyReview({
    required String cardId,
    required String rating,
  }) async {
    final timestamp = DateTime.now().toIso8601String();
    
    // Save locally in study review queue first to preserve session
    final localLogs = _queueBox.get('sync_queue', defaultValue: []) as List;
    localLogs.add({
      'cardId': cardId,
      'rating': rating,
      'timestamp': timestamp,
    });
    await _queueBox.put('sync_queue', localLogs);

    // Try background sync immediately, but fail gracefully
    try {
      await synchronizeOfflineReviews();
    } catch (e) {
      // Intended fail - user continues active session completely frictionless
      print("System is currently offline. Review saved locally for subsequent synchronizations.");
    }
  }

  /// Bulk synchronization uploads scheduled local logs and updates downstream decks
  Future<void> synchronizeOfflineReviews() async {
    final localLogs = _queueBox.get('sync_queue', defaultValue: []) as List;
    if (localLogs.isEmpty) return;

    try {
      final response = await _dio.post(
        '/api/v1/cards/sync/',
        data: {
          'reviews': localLogs.map((item) => {
            'card_id': item['cardId'],
            'rating': item['rating'],
            'created_at': item['timestamp'],
          }).toList()
        },
      );

      if (response.statusCode == 200) {
        // Clear queue upon secure server validation
        await _queueBox.put('sync_queue', []);
        
        // Cache downstream decks state updates locally offline
        final updatedDecks = response.data['decks'];
        await _cacheBox.put('cached_decks', updatedDecks);
      }
    } catch (e) {
      rethrow; // Propagate connection issues up without deleting logs
    }
  }
}
