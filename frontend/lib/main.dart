import 'package:flutter/material';
import 'package:flutter_riverpod/flutter_riverpod';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive local offline caching databases
  await Hive.initFlutter();
  await Hive.openBox('recall_offline_cache');
  await Hive.openBox('study_reviews_queue');

  runApp(
    const ProviderScope(
      child: RecallApp(),
    ),
  );
}

class RecallApp extends StatelessWidget {
  const RecallApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Recall Spaced Repetition',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        primaryColor: const Color(0xFF004AC6),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF004AC6),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.interTextTheme(),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF2563EB),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const Scaffold(
        body: Center(
          child: Text('Recall Applet Engine Initialized'),
        ),
      ),
    );
  }
}
