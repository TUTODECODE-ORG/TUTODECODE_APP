import 'package:flutter/material.dart';

/// Tokens de design unifiés pour TutoDeCode.
/// Toujours utiliser ces constantes, jamais de Color() inline dans les widgets.
abstract class TdcColors {
  // Fonds
  static const bg         = Color(0xFF0F111A); // fond principal de l'app
  static const surface    = Color(0xFF161925); // cartes, sidebars, panels
  static const surfaceAlt = Color(0xFF1E212D); // éléments dans une surface (inputs, tags)

  // Bordures
  static const border     = Color(0xFF2A2D3E);
  static const borderSubtle = Color(0xFF1E212D);

  // Accents
  static const accent     = Color(0xFF6366F1); // indigo — couleur primaire
  static const accentDim  = Color(0x1A6366F1); // indigo 10% opacité
  static const success    = Color(0xFF10B981); // vert — OK, complété
  static const warning    = Color(0xFFF59E0B); // ambre — attention
  static const danger     = Color(0xFFEF4444); // rouge — erreur
  static const info       = Color(0xFF3B82F6); // bleu — info

  // Niveaux de cours
  static const levelBeginner    = Color(0xFF10B981); // vert
  static const levelIntermediate = Color(0xFF6366F1);// indigo
  static const levelAdvanced    = Color(0xFFF59E0B); // orange

  // Texte
  static const textPrimary   = Colors.white;
  static const textSecondary = Color(0xFF8B9EB7);
  static const textMuted     = Color(0xFF4B5568);
}

abstract class TdcSpacing {
  static const xs  = 4.0;
  static const sm  = 8.0;
  static const md  = 16.0;
  static const lg  = 24.0;
  static const xl  = 32.0;
  static const xxl = 48.0;
}

abstract class TdcRadius {
  static const sm = BorderRadius.all(Radius.circular(8));
  static const md = BorderRadius.all(Radius.circular(12));
  static const lg = BorderRadius.all(Radius.circular(16));
  static const xl = BorderRadius.all(Radius.circular(20));
}

/// Thème Material principal de l'application.
ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: TdcColors.bg,
    primaryColor: TdcColors.accent,

    colorScheme: ColorScheme.dark(
      primary: TdcColors.accent,
      secondary: TdcColors.success,
      surface: TdcColors.surface,
      background: TdcColors.bg,
      error: TdcColors.danger,
      onPrimary: Colors.white,
      onSurface: TdcColors.textPrimary,
      onBackground: TdcColors.textPrimary,
    ),

    cardTheme: CardThemeData(
      color: TdcColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: TdcRadius.lg,
        side: BorderSide(color: TdcColors.border),
      ),
      elevation: 0,
      margin: EdgeInsets.zero,
    ),

    appBarTheme: AppBarTheme(
      backgroundColor: TdcColors.bg,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: TdcColors.textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      iconTheme: IconThemeData(color: TdcColors.textSecondary),
    ),

    dividerTheme: DividerThemeData(
      color: TdcColors.border,
      thickness: 1,
      space: 1,
    ),

    textTheme: TextTheme(
      displayLarge: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold),
      titleLarge:   TextStyle(color: TdcColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
      titleMedium:  TextStyle(color: TdcColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
      bodyLarge:    TextStyle(color: TdcColors.textPrimary, fontSize: 15),
      bodyMedium:   TextStyle(color: TdcColors.textSecondary, fontSize: 14),
      labelSmall:   TextStyle(color: TdcColors.textMuted, fontSize: 11, letterSpacing: 1.2),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: TdcColors.accent,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
        padding: EdgeInsets.symmetric(horizontal: TdcSpacing.lg, vertical: TdcSpacing.md),
        textStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
      ),
    ),

    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: TdcColors.textPrimary,
        side: BorderSide(color: TdcColors.border),
        shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
        padding: EdgeInsets.symmetric(horizontal: TdcSpacing.lg, vertical: TdcSpacing.md),
      ),
    ),

    iconTheme: IconThemeData(color: TdcColors.textSecondary, size: 20),

    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: TdcColors.surfaceAlt,
      contentPadding: EdgeInsets.symmetric(horizontal: TdcSpacing.md, vertical: TdcSpacing.sm),
      border: OutlineInputBorder(
        borderRadius: TdcRadius.md,
        borderSide: BorderSide(color: TdcColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: TdcRadius.md,
        borderSide: BorderSide(color: TdcColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: TdcRadius.md,
        borderSide: BorderSide(color: TdcColors.accent, width: 1.5),
      ),
      hintStyle: TextStyle(color: TdcColors.textMuted),
    ),

    scrollbarTheme: ScrollbarThemeData(
      thumbColor: MaterialStateProperty.all(TdcColors.border),
      radius: Radius.circular(4),
      thickness: MaterialStateProperty.all(4),
    ),
  );
}
