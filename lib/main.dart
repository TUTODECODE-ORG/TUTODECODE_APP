// ============================================================
// main.dart — Point d'entrée ultra-minimal de TutoDeCode
// Règle : Ce fichier ne contient QUE le bootstrap de l'app.
// Toute la logique métier vit dans lib/features/
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Features — Chaque import vient de son propre "bloc" isolé
import 'features/home/home_page.dart';
import 'features/courses/ui/chapter_page.dart';
import 'features/ghost_ai/ui/ai_chat_page.dart';
import 'features/ghost_ai/ui/ai_config_page.dart';
import 'features/courses/providers/courses_provider.dart';

// Pages secondaires (pas encore migrées en features)
import 'pages/roadmap.dart';
import 'pages/dashboard.dart';
import 'pages/lab.dart';
import 'pages/admin.dart';
import 'pages/legal.dart';

// Thème centralisé
import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const TutoDeCodeApp());
}

class TutoDeCodeApp extends StatelessWidget {
  const TutoDeCodeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => CoursesProvider(),
      child: MaterialApp(
        title: 'TUTODECODE',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        initialRoute: '/',
        routes: {
          // ── Core navigation ──────────────────────────────
          '/':          (_) => HomePage(),
          '/chapter':   (_) => ChapterPage(),

          // ── Ghost AI ─────────────────────────────────────
          '/ai':        (_) => const AIChatPage(),
          '/ai-config': (_) => const AIConfigPage(),

          // ── Pages secondaires ────────────────────────────
          '/roadmap':   (_) => RoadmapPage(),
          '/dashboard': (_) => DashboardPage(),
          '/lab':       (_) => LabPage(),
          '/admin':     (_) => AdminPage(),
          '/legal':     (_) => LegalPage(),
        },
      ),
    );
  }
}
