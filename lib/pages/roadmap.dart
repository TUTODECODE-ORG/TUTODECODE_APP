import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../features/courses/providers/courses_provider.dart';
import '../features/courses/data/course_repository.dart';
import '../core/theme/app_theme.dart';
import '../core/responsive/responsive.dart';

// ─── Définition des parcours ──────────────────────────────────────────────────
class _Path {
  final String id;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<String> courseIds; // ordre recommandé
  const _Path({
    required this.id, required this.title, required this.subtitle,
    required this.icon, required this.color, required this.courseIds,
  });
}

const _kPaths = [
  _Path(
    id: 'sysadmin', title: 'Sysadmin & DevOps', subtitle: 'Du terminal au cloud',
    icon: Icons.terminal, color: Color(0xFFF59E0B),
    courseIds: ['linux-basics', 'git-github', 'docker-intro'],
  ),
  _Path(
    id: 'dev', title: 'Développeur Full-Stack', subtitle: 'Frontend, backend, bases de données',
    icon: Icons.code, color: Color(0xFF6366F1),
    courseIds: ['javascript-modern', 'python-basics', 'sql-basics'],
  ),
  _Path(
    id: 'security', title: 'Sécurité & Cybersec', subtitle: 'Protégez vos systèmes',
    icon: Icons.security, color: Color(0xFFEF4444),
    courseIds: ['linux-basics', 'sql-basics', 'security-basics'],
  ),
];

// ─── Page Roadmap ─────────────────────────────────────────────────────────────
class RoadmapPage extends StatefulWidget {
  @override State<RoadmapPage> createState() => _RoadmapPageState();
}

class _RoadmapPageState extends State<RoadmapPage> with SingleTickerProviderStateMixin {
  int _selectedPath = 0;
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: _kPaths.length, vsync: this);
    _tab.addListener(() { if (!_tab.indexIsChanging) setState(() => _selectedPath = _tab.index); });
  }

  @override
  void dispose() { _tab.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<CoursesProvider>(context);
    final path = _kPaths[_selectedPath];

    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: Column(children: [
        _buildHeader(context, prov),
        _buildTabs(context),
        Expanded(child: _buildPathContent(context, path, prov)),
      ]),
    );
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  Widget _buildHeader(BuildContext context, CoursesProvider prov) {
    final total    = prov.totalChaptersCount;
    final done     = prov.completedCount;
    final progress = total > 0 ? done / total : 0.0;
    final isMobile = TdcBreakpoints.isMobile(context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 20), 
        vertical: TdcAdaptive.padding(context, 16)),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        border: Border(bottom: BorderSide(color: TdcColors.border)),
      ),
      child: Row(children: [
        IconButton(
          icon: Icon(Icons.arrow_back_ios_new, size: TdcAdaptive.icon(context, 18)),
          color: TdcColors.textSecondary,
          onPressed: () => Navigator.pop(context),
          padding: EdgeInsets.zero, constraints: const BoxConstraints(),
        ),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        Container(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 8)),
          decoration: BoxDecoration(
            color: TdcColors.accent.withOpacity(0.1),
            borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10)),
          ),
          child: Icon(Icons.map, color: TdcColors.accent, size: TdcAdaptive.icon(context, 22)),
        ),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Roadmap', 
            style: TextStyle(
              color: TdcColors.textPrimary, 
              fontSize: TdcText.h2(context), 
              fontWeight: FontWeight.bold)),
          if (!isMobile)
            Text('Choisissez votre parcours', 
              style: TextStyle(
                color: TdcColors.textSecondary, 
                fontSize: TdcText.label(context))),
        ]),
        const Spacer(),
        if (!isMobile) _buildGlobalProgress(context, done, total, progress),
      ]),
    );
  }

  Widget _buildGlobalProgress(BuildContext context, int done, int total, double progress) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 16), 
        vertical: TdcAdaptive.padding(context, 10)),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt,
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)),
        border: Border.all(color: TdcColors.border),
      ),
      child: Row(children: [
        SizedBox(
          width: TdcAdaptive.space(context, 36), 
          height: TdcAdaptive.space(context, 36),
          child: Stack(children: [
            CircularProgressIndicator(
              value: progress,
              strokeWidth: 3,
              backgroundColor: TdcColors.border,
              valueColor: const AlwaysStoppedAnimation(TdcColors.accent),
            ),
            Center(
              child: Text('${(progress * 100).toInt()}', 
                style: TextStyle(
                  color: TdcColors.textPrimary, 
                  fontSize: TdcText.label(context), 
                  fontWeight: FontWeight.bold))),
          ]),
        ),
        SizedBox(width: TdcAdaptive.space(context, 10)),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Progression', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
          Text('$done / $total chapitres', 
            style: TextStyle(
              color: TdcColors.textPrimary, 
              fontSize: TdcText.bodySmall(context), 
              fontWeight: FontWeight.bold)),
        ]),
      ]),
    );
  }

  // ─── Tabs parcours ──────────────────────────────────────────────────────────
  Widget _buildTabs(BuildContext context) {
    return Container(
      color: TdcColors.surface,
      padding: EdgeInsets.fromLTRB(
        TdcAdaptive.padding(context, 16), 0, 
        TdcAdaptive.padding(context, 16), 
        TdcAdaptive.padding(context, 12)),
      child: TabBar(
        controller: _tab,
        isScrollable: true,
        indicatorColor: _kPaths[_selectedPath].color,
        indicatorWeight: 2,
        labelColor: TdcColors.textPrimary,
        unselectedLabelColor: TdcColors.textMuted,
        labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: TdcText.bodySmall(context)),
        tabs: _kPaths.map((p) => Tab(
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(p.icon, size: TdcAdaptive.icon(context, 16), color: p.color),
            SizedBox(width: TdcAdaptive.space(context, 7)),
            Text(p.title),
          ]),
        )).toList(),
      ),
    );
  }

  // ─── Contenu du parcours ───────────────────────────────────────────────────
  Widget _buildPathContent(BuildContext context, _Path path, CoursesProvider prov) {
    final pathCourses = <Course>[];
    for (final id in path.courseIds) {
      final found = prov.courses.where((c) => c.id == id).toList();
      if (found.isNotEmpty) pathCourses.add(found.first);
    }
    final totalChaps = pathCourses.fold(0, (s, c) => s + c.chapters.length);
    final doneChaps  = pathCourses.fold(0, (s, c) => s + prov.courseCompletedCount(c.id));

    final leftPanel = Container(
      width: TdcBreakpoints.isMobile(context) ? double.infinity : TdcAdaptive.space(context, 280),
      color: TdcColors.surface,
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 20)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 12)),
          decoration: BoxDecoration(
            color: path.color.withOpacity(0.1), 
            borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12))),
          child: Icon(path.icon, color: path.color, size: TdcAdaptive.icon(context, 28)),
        ),
        SizedBox(height: TdcAdaptive.space(context, 14)),
        Text(path.title, 
          style: TextStyle(
            color: TdcColors.textPrimary, 
            fontSize: TdcText.h3(context), 
            fontWeight: FontWeight.bold)),
        SizedBox(height: TdcAdaptive.space(context, 4)),
        Text(path.subtitle, 
          style: TextStyle(
            color: TdcColors.textSecondary, 
            fontSize: TdcText.bodySmall(context))),
        SizedBox(height: TdcAdaptive.space(context, 20)),
        _statRow(context, Icons.menu_book, '${pathCourses.length} cours', path.color),
        SizedBox(height: TdcAdaptive.space(context, 8)),
        _statRow(context, Icons.schedule, '$totalChaps chapitres', TdcColors.info),
        SizedBox(height: TdcAdaptive.space(context, 8)),
        _statRow(context, Icons.check_circle, '$doneChaps complétés', TdcColors.success),
        SizedBox(height: TdcAdaptive.space(context, 20)),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Avancement', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
            Text(
              totalChaps > 0 ? '${(doneChaps / totalChaps * 100).toInt()}%' : '0%',
              style: TextStyle(color: path.color, fontSize: TdcText.label(context), fontWeight: FontWeight.bold),
            ),
          ]),
          SizedBox(height: TdcAdaptive.space(context, 6)),
          ClipRRect(
            borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 3)),
            child: LinearProgressIndicator(
              value: totalChaps > 0 ? doneChaps / totalChaps : 0.0,
              minHeight: 6,
              backgroundColor: TdcColors.surfaceAlt,
              valueColor: AlwaysStoppedAnimation(path.color),
            ),
          ),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 20)),
        Container(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 12)),
          decoration: BoxDecoration(
            color: TdcColors.surfaceAlt,
            borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10)),
            border: Border.all(color: TdcColors.border),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(Icons.timer_outlined, size: TdcAdaptive.icon(context, 14), color: TdcColors.warning),
              SizedBox(width: TdcAdaptive.space(context, 6)),
              Text('Durée estimée', 
                style: TextStyle(
                  color: TdcColors.warning, 
                  fontSize: TdcText.label(context), 
                  fontWeight: FontWeight.bold)),
            ]),
            SizedBox(height: TdcAdaptive.space(context, 6)),
            Text(
              pathCourses.fold('0h', (acc, c) => c.duration),
              style: TextStyle(
                color: TdcColors.textPrimary, 
                fontSize: TdcText.h1(context), 
                fontWeight: FontWeight.bold),
            ),
            Text('${pathCourses.map((c) => c.duration).join(' + ')}', 
              style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
          ]),
        ),
      ]),
    );

    final timeline = pathCourses.isEmpty
        ? _buildEmpty()
        : ListView.builder(
            padding: EdgeInsets.all(TdcAdaptive.padding(context, 24)),
            shrinkWrap: TdcBreakpoints.isMobile(context),
            physics: TdcBreakpoints.isMobile(context) ? const NeverScrollableScrollPhysics() : null,
            itemCount: pathCourses.length,
            itemBuilder: (_, i) => _buildCourseNode(context, pathCourses[i], i, pathCourses.length, prov, path.color),
          );

    if (TdcBreakpoints.isMobile(context)) {
      return SingleChildScrollView(
        child: Column(children: [
          leftPanel,
          timeline,
        ]),
      );
    }

    return Row(children: [
      leftPanel,
      Expanded(child: timeline),
    ]);
  }

  Widget _statRow(BuildContext context, IconData icon, String text, Color color) {
    return Row(children: [
      Icon(icon, size: TdcAdaptive.icon(context, 15), color: color),
      SizedBox(width: TdcAdaptive.space(context, 8)),
      Text(text, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context))),
    ]);
  }

  // ─── Nœud de cours dans la timeline ───────────────────────────────────────
  Widget _buildCourseNode(BuildContext context, Course course, int index, int total, CoursesProvider prov, Color pathColor) {
    final done     = prov.courseCompletedCount(course.id);
    final chCount  = course.chapters.length;
    final progress = chCount > 0 ? done / chCount : 0.0;
    final isLast   = index == total - 1;
    final isUnlocked = index == 0 || prov.courseCompletedCount(_kPaths[_selectedPath].courseIds[index - 1]) > 0;

    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Timeline visuelle
        SizedBox(width: TdcAdaptive.space(context, 50), child: Column(children: [
          Container(
            width: TdcAdaptive.space(context, 40), 
            height: TdcAdaptive.space(context, 40),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: progress == 1.0 ? TdcColors.success.withOpacity(0.15) : (isUnlocked ? pathColor.withOpacity(0.1) : TdcColors.surfaceAlt),
              border: Border.all(
                color: progress == 1.0 ? TdcColors.success : (isUnlocked ? pathColor : TdcColors.border),
                width: 2,
              ),
            ),
            child: Center(
              child: progress == 1.0
                  ? Icon(Icons.check, color: TdcColors.success, size: TdcAdaptive.icon(context, 20))
                  : Text('${index + 1}', 
                      style: TextStyle(
                        color: isUnlocked ? pathColor : TdcColors.textMuted, 
                        fontWeight: FontWeight.bold, 
                        fontSize: TdcText.body(context))),
            ),
          ),
          if (!isLast) Expanded(child: Container(width: 2, color: TdcColors.border)),
        ])),
        SizedBox(width: TdcAdaptive.space(context, 16)),
        // Carte du cours
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 20)),
            child: _buildCourseCard(context, course, done, chCount, progress, isUnlocked, prov),
          ),
        ),
      ]),
    );
  }

  Widget _buildCourseCard(BuildContext context, Course course, int done, int total, double progress, bool unlocked, CoursesProvider prov) {
    final levelColor = _levelColor(course.level);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: unlocked ? () => _openCourse(context, course, prov) : null,
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 14)),
        child: Container(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 18)),
          decoration: BoxDecoration(
            color: TdcColors.surface,
            borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 14)),
            border: Border.all(color: progress == 1.0 ? TdcColors.success.withOpacity(0.3) : TdcColors.border),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(course.title, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: TdcText.body(context)))),
              SizedBox(width: TdcAdaptive.space(context, 10)),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 8), 
                  vertical: TdcAdaptive.padding(context, 3)),
                decoration: BoxDecoration(color: levelColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                child: Text(_levelLabel(course.level), style: TextStyle(color: levelColor, fontSize: TdcText.label(context), fontWeight: FontWeight.bold)),
              ),
              if (!unlocked) ...[
                SizedBox(width: TdcAdaptive.space(context, 8)),
                Icon(Icons.lock, size: TdcAdaptive.icon(context, 14), color: TdcColors.textMuted),
              ],
            ]),
            SizedBox(height: TdcAdaptive.space(context, 6)),
            Text(course.description, 
              style: TextStyle(
                color: TdcColors.textSecondary, 
                fontSize: TdcText.bodySmall(context), 
                height: 1.4), 
              maxLines: 2, overflow: TextOverflow.ellipsis),
            SizedBox(height: TdcAdaptive.space(context, 12)),
            Row(children: [
              Icon(Icons.schedule, size: TdcAdaptive.icon(context, 13), color: TdcColors.textMuted),
              SizedBox(width: TdcAdaptive.space(context, 4)),
              Text(course.duration, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
              SizedBox(width: TdcAdaptive.space(context, 12)),
              Icon(Icons.menu_book, size: TdcAdaptive.icon(context, 13), color: TdcColors.textMuted),
              SizedBox(width: TdcAdaptive.space(context, 4)),
              Text('$total chapitres', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
              const Spacer(),
              Text('$done/$total', 
                style: TextStyle(
                  color: TdcColors.success, 
                  fontSize: TdcText.label(context), 
                  fontWeight: FontWeight.bold)),
            ]),
            SizedBox(height: TdcAdaptive.space(context, 8)),
            ClipRRect(
              borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 3)),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 4,
                backgroundColor: TdcColors.surfaceAlt,
                valueColor: AlwaysStoppedAnimation(progress == 1.0 ? TdcColors.success : TdcColors.accent),
              ),
            ),
            // Chapitres
            if (course.chapters.isNotEmpty) ...[
              SizedBox(height: TdcAdaptive.space(context, 12)),
              Wrap(
                spacing: TdcAdaptive.space(context, 6), 
                runSpacing: TdcAdaptive.space(context, 6),
                children: course.chapters.take(4).map((ch) {
                  final isDone = prov.completed.contains('${course.id}:${ch.id}');
                  return GestureDetector(
                    onTap: unlocked ? () {
                      prov.selectChapter(course.id, ch.id);
                      Navigator.pushNamed(context, '/chapter');
                    } : null,
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: TdcAdaptive.padding(context, 10), 
                        vertical: TdcAdaptive.padding(context, 5)),
                      decoration: BoxDecoration(
                        color: isDone ? TdcColors.success.withOpacity(0.1) : TdcColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isDone ? TdcColors.success.withOpacity(0.3) : TdcColors.border),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(isDone ? Icons.check_circle : Icons.play_circle_outline, 
                          size: TdcAdaptive.icon(context, 12), 
                          color: isDone ? TdcColors.success : TdcColors.textMuted),
                        SizedBox(width: TdcAdaptive.space(context, 5)),
                        Text(ch.title, 
                          style: TextStyle(
                            color: isDone ? TdcColors.success : TdcColors.textSecondary, 
                            fontSize: TdcText.label(context)), 
                          overflow: TextOverflow.ellipsis),
                      ]),
                    ),
                  );
                }).toList()..addAll(
                  course.chapters.length > 4 ? [
                    GestureDetector(
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: TdcAdaptive.padding(context, 10), 
                          vertical: TdcAdaptive.padding(context, 5)),
                        decoration: BoxDecoration(
                          color: TdcColors.surfaceAlt, 
                          borderRadius: BorderRadius.circular(6), 
                          border: Border.all(color: TdcColors.border)),
                        child: Text('+${course.chapters.length - 4} autres', 
                          style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
                      ),
                    ),
                  ] : [],
                ),
              ),
            ],
            if (unlocked && done < total) ...[
              SizedBox(height: TdcAdaptive.space(context, 12)),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _openCourse(context, course, prov),
                  icon: Icon(Icons.play_arrow, size: TdcAdaptive.icon(context, 16)),
                  label: Text(done == 0 ? 'Commencer' : 'Continuer', 
                    style: TextStyle(fontSize: TdcText.button(context))),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, 10))),
                ),
              ),
            ],
          ]),
        ),
      ),
    );
  }

  void _openCourse(BuildContext context, Course course, CoursesProvider prov) {
    if (course.chapters.isEmpty) return;
    // Trouver le premier chapitre non-complété
    final nextChap = course.chapters.firstWhere(
      (ch) => !prov.completed.contains('${course.id}:${ch.id}'),
      orElse: () => course.chapters.first,
    );
    prov.selectChapter(course.id, nextChap.id);
    Navigator.pushNamed(context, '/chapter');
  }

  Widget _buildEmpty() => const Center(child: Text('Aucun cours disponible pour ce parcours.', style: TextStyle(color: TdcColors.textMuted)));

  Color _levelColor(String l) {
    switch (l.toLowerCase()) {
      case 'beginner': return TdcColors.levelBeginner;
      case 'intermediate': return TdcColors.levelIntermediate;
      case 'advanced': return TdcColors.levelAdvanced;
      default: return TdcColors.textMuted;
    }
  }
  String _levelLabel(String l) {
    switch (l.toLowerCase()) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Inter.';
      case 'advanced': return 'Avancé';
      default: return l;
    }
  }
}
