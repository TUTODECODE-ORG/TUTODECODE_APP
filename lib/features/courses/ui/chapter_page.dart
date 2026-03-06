import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/atom-one-dark.dart';
import '../providers/courses_provider.dart';
import '../data/course_repository.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/responsive/responsive.dart';

class ChapterPage extends StatefulWidget {
  @override
  _ChapterPageState createState() => _ChapterPageState();
}

class _ChapterPageState extends State<ChapterPage> {
  final ScrollController _contentScroll = ScrollController();

  @override
  void dispose() {
    _contentScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<CoursesProvider>(context);
    final course = prov.currentCourse;
    final chapter = prov.currentChapter;

    if (course == null || chapter == null) {
      return Scaffold(
        backgroundColor: TdcColors.bg,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.folder_open, size: TdcAdaptive.icon(context, 48), color: TdcColors.textMuted),
              SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
              Text('Aucun chapitre sélectionné', style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.body(context))),
              SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
              ElevatedButton(onPressed: () => Navigator.pop(context), child: Text('Retour', style: TextStyle(fontSize: TdcText.button(context)))),
            ],
          ),
        ),
      );
    }

    final chapterIndex = course.chapters.indexWhere((c) => c.id == chapter.id);
    final hasPrev = chapterIndex > 0;
    final hasNext = chapterIndex < course.chapters.length - 1;
    final isCompleted = prov.completed.contains('${course.id}:${chapter.id}');
    final progress = course.chapters.isNotEmpty
        ? (chapterIndex + 1) / course.chapters.length
        : 0.0;

    return ResponsiveBuilder(
      builder: (ctx, type) {
        if (type.isDesktop) {
          return _buildDesktop(ctx, prov, course, chapter, chapterIndex, hasPrev, hasNext, isCompleted, progress);
        }
        return _buildMobileTablet(ctx, prov, course, chapter, chapterIndex, hasPrev, hasNext, isCompleted, progress, type.isTablet);
      },
    );
  }

  Widget _buildDesktop(BuildContext context, CoursesProvider prov, Course course,
      CourseChapter chapter, int index, bool hasPrev, bool hasNext, bool isCompleted, double progress) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: SafeArea(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTOC(context, course, chapter, prov),
            Expanded(
              child: Column(
                children: [
                  _buildHeader(context, course, chapter, index, progress, isCompleted, prov),
                  Expanded(
                    child: Scrollbar(
                      controller: _contentScroll,
                      child: SingleChildScrollView(
                        controller: _contentScroll,
                        padding: EdgeInsets.symmetric(
                          horizontal: TdcAdaptive.padding(context, TdcSpacing.xl), 
                          vertical: TdcAdaptive.padding(context, TdcSpacing.lg)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildMarkdownContent(context, chapter),
                            if (chapter.codeBlocks != null && chapter.codeBlocks!.isNotEmpty) ...[
                              SizedBox(height: TdcAdaptive.space(context, TdcSpacing.xl)),
                              _buildSectionLabel(context, 'Exemples de code'),
                              SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
                              ...chapter.codeBlocks!.map((cb) => _buildCodeBlock(context, cb)),
                            ],
                            SizedBox(height: TdcAdaptive.space(context, TdcSpacing.xxl)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  _buildNavBar(context, course, chapter, prov, hasPrev, hasNext, index, isCompleted),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileTablet(BuildContext context, CoursesProvider prov, Course course,
      CourseChapter chapter, int index, bool hasPrev, bool hasNext, bool isCompleted, double progress, bool isTablet) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      appBar: AppBar(
        backgroundColor: TdcColors.bg,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: TdcColors.accent),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(chapter.title,
                style: TextStyle(color: TdcColors.textPrimary, fontSize: TdcText.body(context), fontWeight: FontWeight.bold),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            Text('Chapitre ${index + 1} / ${course.chapters.length}',
                style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.caption(context))),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: () => prov.toggleCompleted(course.id, chapter.id),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: TdcAdaptive.padding(context, 12), 
                vertical: TdcAdaptive.padding(context, 8)),
              child: Icon(
                isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
                color: isCompleted ? TdcColors.success : TdcColors.textMuted,
                size: TdcAdaptive.icon(context, 24),
              ),
            ),
          ),
          if (isTablet)
            Builder(
              builder: (ctx) => IconButton(
                icon: Icon(Icons.menu_book, color: TdcColors.textSecondary),
                onPressed: () => Scaffold.of(ctx).openEndDrawer(),
              ),
            ),
        ],
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(3),
          child: LinearProgressIndicator(
            value: progress, minHeight: 3,
            backgroundColor: TdcColors.surfaceAlt,
            valueColor: AlwaysStoppedAnimation<Color>(TdcColors.accent),
          ),
        ),
      ),
      endDrawer: isTablet
          ? Drawer(
              backgroundColor: TdcColors.surface,
              width: 300,
              child: SafeArea(child: _buildTOC(context, course, chapter, prov, inDrawer: true)),
            )
          : null,
      body: Column(
        children: [
          Expanded(
            child: Scrollbar(
              controller: _contentScroll,
              child: SingleChildScrollView(
                controller: _contentScroll,
                padding: EdgeInsets.symmetric(
                  horizontal: isTablet ? TdcSpacing.xl : TdcSpacing.md,
                  vertical: TdcSpacing.lg,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMarkdownContent(context, chapter),
                    if (chapter.codeBlocks != null && chapter.codeBlocks!.isNotEmpty) ...[
                      SizedBox(height: TdcSpacing.xl),
                      _buildSectionLabel(context, 'Exemples de code'),
                      SizedBox(height: TdcSpacing.md),
                      ...chapter.codeBlocks!.map((cb) => _buildCodeBlock(context, cb)),
                    ],
                    SizedBox(height: TdcSpacing.xxl),
                  ],
                ),
              ),
            ),
          ),
          _buildNavBar(context, course, chapter, prov, hasPrev, hasNext, index, isCompleted),
        ],
      ),
      floatingActionButton: !isTablet
          ? FloatingActionButton.small(
              onPressed: () => _showTOCBottomSheet(context, course, chapter, prov),
              backgroundColor: TdcColors.surface,
              child: Icon(Icons.list, color: TdcColors.accent),
            )
          : null,
    );
  }

  void _showTOCBottomSheet(BuildContext context, Course course, CourseChapter chapter, CoursesProvider prov) {
    showModalBottomSheet(
      context: context,
      backgroundColor: TdcColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(TdcAdaptive.space(context, 20)))),
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.5,
        maxChildSize: 0.85,
        builder: (_, ctrl) => Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, 12)),
              child: Container(
                width: TdcAdaptive.space(context, 40), 
                height: TdcAdaptive.space(context, 4),
                decoration: BoxDecoration(color: TdcColors.border, borderRadius: BorderRadius.circular(2))),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: TdcAdaptive.padding(context, TdcSpacing.lg)),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(course.title,
                    style: TextStyle(
                      color: TdcColors.textPrimary, 
                      fontSize: TdcText.bodyLarge(context), 
                      fontWeight: FontWeight.bold)),
              ),
            ),
            SizedBox(height: TdcAdaptive.space(context, 8)),
            Divider(color: TdcColors.border, height: 1),
            Expanded(
              child: ListView.builder(
                controller: ctrl,
                padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, TdcSpacing.sm)),
                itemCount: course.chapters.length,
                itemBuilder: (context, index) {
                  final ch = course.chapters[index];
                  final isActive = ch.id == chapter.id;
                  final isDone = prov.completed.contains('${course.id}:${ch.id}');
                  return _buildTOCItem(context, course, ch, index, isActive, isDone, prov);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // TOC
  // ─────────────────────────────────────────────────────
  Widget _buildTOC(BuildContext context, Course course, CourseChapter current, CoursesProvider prov, {bool inDrawer = false}) {
    return Container(
      width: inDrawer ? double.infinity : 280,
      height: double.infinity,
      decoration: BoxDecoration(
        color: TdcColors.surface,
        border: inDrawer ? null : Border(right: BorderSide(color: TdcColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête du cours
          Container(
            padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.lg)),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: TdcColors.border))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                InkWell(
                  onTap: () => Navigator.pop(context),
                  child: Row(
                    children: [
                      Icon(Icons.arrow_back, size: TdcAdaptive.icon(context, 16), color: TdcColors.accent),
                      SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
                      Text('Retour', 
                        style: TextStyle(
                          color: TdcColors.accent, 
                          fontSize: TdcText.bodySmall(context), 
                          fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
                Text(course.title, 
                  style: TextStyle(
                    color: TdcColors.textPrimary, 
                    fontSize: TdcText.body(context), 
                    fontWeight: FontWeight.bold), 
                  maxLines: 2, overflow: TextOverflow.ellipsis),
                SizedBox(height: TdcAdaptive.space(context, TdcSpacing.sm)),
                // Progress bar du cours
                _buildTOCProgressBar(course, prov),
              ],
            ),
          ),
          // Liste des chapitres
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(vertical: TdcSpacing.sm),
              itemCount: course.chapters.length,
              itemBuilder: (context, index) {
                final ch = course.chapters[index];
                final isActive = ch.id == current.id;
                final isDone = prov.completed.contains('${course.id}:${ch.id}');
                return _buildTOCItem(context, course, ch, index, isActive, isDone, prov);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTOCProgressBar(Course course, CoursesProvider prov) {
    final done = prov.courseCompletedCount(course.id);
    final total = course.chapters.length;
    final progress = total > 0 ? done / total : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Progression', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
            Text('$done/$total', style: TextStyle(color: TdcColors.accent, fontSize: TdcText.label(context), fontWeight: FontWeight.bold)),
          ],
        ),
        SizedBox(height: TdcAdaptive.space(context, 6)),
        ClipRRect(
          borderRadius: BorderRadius.circular(2),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: TdcAdaptive.space(context, 4),
            backgroundColor: TdcColors.surfaceAlt,
            valueColor: AlwaysStoppedAnimation<Color>(TdcColors.accent),
          ),
        ),
      ],
    );
  }

  Widget _buildTOCItem(BuildContext context, Course course, CourseChapter ch, int index, bool isActive, bool isDone, CoursesProvider prov) {
    return InkWell(
      onTap: () {
        prov.selectChapter(course.id, ch.id);
        // Scroll content back to top when switching chapters
        if (_contentScroll.hasClients) {
          _contentScroll.animateTo(0, duration: Duration(milliseconds: 300), curve: Curves.easeOut);
        }
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        margin: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, TdcSpacing.sm), 
          vertical: 2),
        padding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, TdcSpacing.md), 
          vertical: TdcAdaptive.padding(context, TdcSpacing.sm + 2)),
        decoration: BoxDecoration(
          color: isActive ? TdcColors.accentDim : Colors.transparent,
          borderRadius: TdcRadius.sm,
          border: isActive ? Border.all(color: TdcColors.accent.withOpacity(0.3)) : null,
        ),
        child: Row(
          children: [
            // État (numéro / check)
            Container(
              width: TdcAdaptive.icon(context, 24),
              height: TdcAdaptive.icon(context, 24),
              decoration: BoxDecoration(
                color: isDone ? TdcColors.success.withOpacity(0.15) : (isActive ? TdcColors.accentDim : TdcColors.surfaceAlt),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDone ? TdcColors.success : (isActive ? TdcColors.accent : TdcColors.border),
                  width: 1.5,
                ),
              ),
              child: Center(
                child: isDone
                    ? Icon(Icons.check, size: TdcAdaptive.icon(context, 13), color: TdcColors.success)
                    : Text('${index + 1}', style: TextStyle(
                        fontSize: TdcText.label(context),
                        fontWeight: FontWeight.bold,
                        color: isActive ? TdcColors.accent : TdcColors.textMuted,
                      )),
              ),
            ),
            SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
            // Titre
            Expanded(
              child: Text(
                ch.title,
                style: TextStyle(
                  fontSize: TdcText.bodySmall(context),
                  color: isActive ? TdcColors.textPrimary : (isDone ? TdcColors.textSecondary : TdcColors.textSecondary),
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (isActive)
              Icon(Icons.chevron_right, size: TdcAdaptive.icon(context, 14), color: TdcColors.accent),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // Header
  // ─────────────────────────────────────────────────────
  Widget _buildHeader(BuildContext context, Course course, CourseChapter chapter, int index, double progress, bool isCompleted, CoursesProvider prov) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, TdcSpacing.xl), 
        vertical: TdcAdaptive.padding(context, TdcSpacing.md)),
      decoration: BoxDecoration(
        color: TdcColors.bg,
        border: Border(bottom: BorderSide(color: TdcColors.border)),
      ),
      child: Row(
        children: [
          // Titre + durée
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(chapter.title, 
                  style: TextStyle(
                    color: TdcColors.textPrimary, 
                    fontSize: TdcText.h3(context), 
                    fontWeight: FontWeight.bold)),
                SizedBox(height: TdcAdaptive.space(context, 4)),
                Row(
                  children: [
                    Icon(Icons.schedule, size: TdcAdaptive.icon(context, 14), color: TdcColors.textMuted),
                    SizedBox(width: TdcAdaptive.space(context, 4)),
                    Text(chapter.duration, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
                    SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
                    Text('Chapitre ${index + 1} / ${course.chapters.length}',
                        style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.caption(context))),
                  ],
                ),
              ],
            ),
          ),
          // Barre de progression globale du cours
          SizedBox(width: TdcAdaptive.space(context, 200), child: LinearProgressIndicator(
            value: progress,
            minHeight: TdcAdaptive.space(context, 6),
            borderRadius: BorderRadius.circular(3),
            backgroundColor: TdcColors.surfaceAlt,
            valueColor: AlwaysStoppedAnimation<Color>(TdcColors.accent),
          )),
          SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
          // Bouton marquer terminé
          _buildCompletionButton(context, isCompleted, () => prov.toggleCompleted(course.id, chapter.id)),
        ],
      ),
    );
  }

  Widget _buildCompletionButton(BuildContext context, bool isCompleted, VoidCallback onTap) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(
        isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
        size: TdcAdaptive.icon(context, 16),
        color: isCompleted ? TdcColors.success : TdcColors.textSecondary,
      ),
      label: Text(
        isCompleted ? 'Terminé' : 'Marquer terminé',
        style: TextStyle(
          color: isCompleted ? TdcColors.success : TdcColors.textSecondary,
          fontSize: TdcText.button(context),
        ),
      ),
      style: OutlinedButton.styleFrom(
        padding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, TdcSpacing.md), 
          vertical: TdcAdaptive.padding(context, TdcSpacing.sm)),
        side: BorderSide(color: isCompleted ? TdcColors.success.withOpacity(0.5) : TdcColors.border),
        shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // Markdown
  // ─────────────────────────────────────────────────────
  Widget _buildMarkdownContent(BuildContext context, CourseChapter chapter) {
    return MarkdownBody(
      data: chapter.content,
      selectable: true,
      styleSheet: MarkdownStyleSheet(
        p: TextStyle(color: TdcColors.textPrimary, fontSize: TdcText.body(context), height: 1.7),
        h1: TextStyle(color: TdcColors.textPrimary, fontSize: TdcText.h1(context), fontWeight: FontWeight.bold, height: 2.0),
        h2: TextStyle(color: TdcColors.textPrimary, fontSize: TdcText.h2(context), fontWeight: FontWeight.bold, height: 1.8),
        h3: TextStyle(color: TdcColors.textPrimary, fontSize: TdcText.h3(context), fontWeight: FontWeight.w600, height: 1.7),
        h4: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.body(context), fontWeight: FontWeight.w600, height: 1.7),
        strong: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold),
        em: TextStyle(color: TdcColors.textSecondary, fontStyle: FontStyle.italic),
        a: TextStyle(color: TdcColors.accent, decoration: TextDecoration.underline),
        listBullet: TextStyle(color: TdcColors.accent, fontSize: TdcText.body(context)),
        blockquote: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context)),
        blockquoteDecoration: BoxDecoration(
          border: Border(left: BorderSide(color: TdcColors.accent, width: 3)),
          color: TdcColors.accentDim,
          borderRadius: BorderRadius.only(topRight: Radius.circular(8), bottomRight: Radius.circular(8)),
        ),
        blockquotePadding: EdgeInsets.fromLTRB(
          TdcAdaptive.padding(context, TdcSpacing.md), 
          TdcAdaptive.padding(context, TdcSpacing.sm), 
          TdcAdaptive.padding(context, TdcSpacing.md), 
          TdcAdaptive.padding(context, TdcSpacing.sm)),
        code: TextStyle(
          fontFamily: 'monospace',
          fontSize: TdcText.bodySmall(context),
          color: TdcColors.warning,
          backgroundColor: TdcColors.surfaceAlt,
        ),
        codeblockDecoration: BoxDecoration(
          color: Color(0xFF1A1D2E),
          borderRadius: TdcRadius.md,
          border: Border.all(color: TdcColors.border),
        ),
        codeblockPadding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.md)),
        horizontalRuleDecoration: BoxDecoration(border: Border(top: BorderSide(color: TdcColors.border))),
      ),
      imageBuilder: (uri, title, alt) {
        return Container(
          padding: EdgeInsets.all(TdcSpacing.md),
          decoration: BoxDecoration(color: TdcColors.surface, borderRadius: TdcRadius.md),
          child: Row(
            children: [
              Icon(Icons.image_not_supported, color: TdcColors.textMuted),
              SizedBox(width: TdcSpacing.sm),
              Text('Image (hors-ligne)', style: TextStyle(color: TdcColors.textMuted, fontSize: 13)),
            ],
          ),
        );
      },
      onTapLink: (text, href, title) {
        if (href == null) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🔒 Liens externes désactivés (mode hors-ligne)', style: TextStyle(color: TdcColors.textPrimary)),
            backgroundColor: TdcColors.surface,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
            duration: Duration(seconds: 2),
          ),
        );
      },
    );
  }

  // ─────────────────────────────────────────────────────
  // Code blocks standalone
  // ─────────────────────────────────────────────────────
  Widget _buildCodeBlock(BuildContext context, Map<String, dynamic> cb) {
    final code = cb['code']?.toString() ?? '';
    final lang = cb['language']?.toString() ?? 'bash';
    final label = cb['title']?.toString() ?? lang.toUpperCase();

    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, TdcSpacing.md)),
      decoration: BoxDecoration(
        color: Color(0xFF1A1D2E),
        borderRadius: TdcRadius.md,
        border: Border.all(color: TdcColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header du bloc code
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, TdcSpacing.md), 
              vertical: TdcAdaptive.padding(context, TdcSpacing.sm)),
            decoration: BoxDecoration(
              color: TdcColors.surfaceAlt,
              borderRadius: BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
              border: Border(bottom: BorderSide(color: TdcColors.border)),
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: TdcAdaptive.padding(context, 8), 
                    vertical: TdcAdaptive.padding(context, 3)),
                  decoration: BoxDecoration(
                    color: TdcColors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(lang.toUpperCase(), 
                    style: TextStyle(
                      color: TdcColors.accent, 
                      fontSize: TdcText.label(context), 
                      fontWeight: FontWeight.bold, 
                      letterSpacing: 1)),
                ),
                SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
                Text(label, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context))),
                Spacer(),
                InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: code));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Code copié !', style: TextStyle(color: TdcColors.textPrimary)),
                        backgroundColor: TdcColors.surface,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(Icons.copy, size: TdcAdaptive.icon(context, 16), color: TdcColors.textMuted),
                  ),
                ),
              ],
            ),
          ),
          // Code avec highlight
          HighlightView(
            code,
            language: lang,
            theme: atomOneDarkTheme,
            textStyle: TextStyle(fontFamily: 'monospace', fontSize: TdcText.bodySmall(context), height: 1.6),
            padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.md)),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(BuildContext context, String label) {
    return Row(
      children: [
        Container(
          width: TdcAdaptive.space(context, 3), 
          height: TdcAdaptive.space(context, 18), 
          decoration: BoxDecoration(color: TdcColors.accent, borderRadius: BorderRadius.circular(2))),
        SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
        Text(label, 
          style: TextStyle(
            color: TdcColors.textPrimary, 
            fontWeight: FontWeight.bold, 
            fontSize: TdcText.h3(context))),
      ],
    );
  }

  // ─────────────────────────────────────────────────────
  // Navigation bas de page
  // ─────────────────────────────────────────────────────
  Widget _buildNavBar(BuildContext context, Course course, CourseChapter chapter, CoursesProvider prov,
      bool hasPrev, bool hasNext, int index, bool isCompleted) {
    final isSmall = MediaQuery.of(context).size.width < TdcBreakpoints.mobile;
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? TdcAdaptive.padding(context, TdcSpacing.md) : TdcAdaptive.padding(context, TdcSpacing.xl),
        vertical: TdcAdaptive.padding(context, TdcSpacing.md),
      ),
      decoration: BoxDecoration(
        color: TdcColors.bg,
        border: Border(top: BorderSide(color: TdcColors.border)),
      ),
      child: Row(
        children: [
          if (hasPrev)
            OutlinedButton.icon(
              onPressed: () {
                final prevChapter = course.chapters[index - 1];
                prov.selectChapter(course.id, prevChapter.id);
                if (_contentScroll.hasClients) _contentScroll.jumpTo(0);
              },
              icon: Icon(Icons.arrow_back, size: TdcAdaptive.icon(context, 16)),
              label: Text(isSmall ? 'Préc.' : 'Précédent', style: TextStyle(fontSize: TdcText.button(context))),
              style: OutlinedButton.styleFrom(
                foregroundColor: TdcColors.textSecondary,
                side: BorderSide(color: TdcColors.border),
              ),
            ),
          Spacer(),
          if (!isCompleted)
            Padding(
              padding: EdgeInsets.only(right: TdcAdaptive.padding(context, TdcSpacing.md)),
              child: TextButton.icon(
                onPressed: () => prov.toggleCompleted(course.id, chapter.id),
                icon: Icon(Icons.check, size: TdcAdaptive.icon(context, 16), color: TdcColors.success),
                label: Text(isSmall ? 'OK' : 'Valider', style: TextStyle(color: TdcColors.success, fontSize: TdcText.button(context))),
              ),
            ),
          if (hasNext)
            ElevatedButton.icon(
              onPressed: () {
                if (!isCompleted) prov.toggleCompleted(course.id, chapter.id);
                final nextChapter = course.chapters[index + 1];
                prov.selectChapter(course.id, nextChapter.id);
                if (_contentScroll.hasClients) _contentScroll.jumpTo(0);
              },
              icon: Icon(Icons.arrow_forward, size: TdcAdaptive.icon(context, 16)),
              label: Text(isSmall ? 'Suiv.' : 'Suivant', style: TextStyle(fontSize: TdcText.button(context))),
            )
          else
            ElevatedButton.icon(
              onPressed: () {
                if (!isCompleted) prov.toggleCompleted(course.id, chapter.id);
                Navigator.pop(context);
              },
              icon: Icon(Icons.emoji_events, size: TdcAdaptive.icon(context, 16)),
              label: Text(isSmall ? 'Fin !' : 'Terminer le cours', style: TextStyle(fontSize: TdcText.button(context))),
              style: ElevatedButton.styleFrom(backgroundColor: TdcColors.success),
            ),
        ],
      ),
    );
  }
}
