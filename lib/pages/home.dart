import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../features/courses/providers/courses_provider.dart';
import '../features/courses/data/course_repository.dart';
import '../core/theme/app_theme.dart';
import '../services/ollama_service.dart';

class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  OllamaStatus? _aiStatus;

  @override
  void initState() {
    super.initState();
    _checkAI();
  }

  Future<void> _checkAI() async {
    final s = await OllamaService.checkStatus();
    if (mounted) setState(() => _aiStatus = s);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: SafeArea(
        child: Consumer<CoursesProvider>(builder: (context, prov, _) {
          if (!prov.loaded) {
            return Center(child: CircularProgressIndicator(color: TdcColors.accent));
          }
          final courses = prov.courses;
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSidebar(context, prov),
              Expanded(
                child: Column(
                  children: [
                    _buildTopBar(context),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.all(TdcSpacing.xl),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildMainHeader(context),
                                  SizedBox(height: TdcSpacing.xxl),
                                  _buildSectionHeader(context, prov),
                                  SizedBox(height: TdcSpacing.lg),
                                  GridView.builder(
                                    shrinkWrap: true,
                                    physics: NeverScrollableScrollPhysics(),
                                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3,
                                      childAspectRatio: 1.25,
                                      crossAxisSpacing: 16,
                                      mainAxisSpacing: 16,
                                    ),
                                    itemCount: courses.length,
                                    itemBuilder: (context, i) =>
                                        _buildCourseCard(context, courses[i], i, prov),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(width: TdcSpacing.xl),
                            _buildRightPanel(context, prov),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/ai'),
        backgroundColor: Color(0xFF2D2060),
        icon: Icon(Icons.smart_toy, color: TdcColors.warning),
        label: Text('Agent IA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  // ── Top bar ───────────────────────────────────────────────
  Widget _buildTopBar(BuildContext context) {
    return Container(
      height: 52,
      padding: EdgeInsets.symmetric(horizontal: TdcSpacing.lg),
      decoration: BoxDecoration(
        color: TdcColors.bg,
        border: Border(bottom: BorderSide(color: TdcColors.border)),
      ),
      child: Row(
        children: [
          Icon(Icons.menu_book, color: TdcColors.accent, size: 16),
          SizedBox(width: TdcSpacing.sm),
          Text('Choisissez un module pour commencer',
              style: TextStyle(color: TdcColors.textSecondary, fontSize: 13)),
        ],
      ),
    );
  }

  // ── Main header ───────────────────────────────────────────
  Widget _buildMainHeader(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: TdcColors.surface,
            borderRadius: TdcRadius.md,
            border: Border.all(color: TdcColors.border),
          ),
          child: Text('TDC',
              style: TextStyle(
                  color: TdcColors.warning,
                  fontWeight: FontWeight.bold,
                  fontSize: 22)),
        ),
        SizedBox(width: TdcSpacing.md),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TutoDeCode',
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5)),
            Text('Plateforme d\'apprentissage informatique — 100% local',
                style: TextStyle(color: TdcColors.textSecondary, fontSize: 13)),
          ],
        ),
        Spacer(),
        // Bouton Configurer IA — avec badge de statut
        InkWell(
          onTap: () => Navigator.pushNamed(context, '/ai-config'),
          borderRadius: TdcRadius.md,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md, vertical: 10),
            decoration: BoxDecoration(
              color: TdcColors.surface,
              borderRadius: TdcRadius.md,
              border: Border.all(color: TdcColors.border),
            ),
            child: Row(children: [
              Icon(Icons.settings, size: 16, color: TdcColors.textSecondary),
              SizedBox(width: 8),
              Text('Configurer IA',
                  style: TextStyle(
                      color: TdcColors.textSecondary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14)),
              SizedBox(width: 10),
              _buildAIStatusDot(),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildAIStatusDot() {
    final status = _aiStatus;
    if (status == null) {
      return SizedBox(
          width: 8,
          height: 8,
          child: CircularProgressIndicator(strokeWidth: 1.5, color: TdcColors.textMuted));
    }
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: status.running ? TdcColors.success : TdcColors.danger,
        boxShadow: [
          BoxShadow(
              color: (status.running ? TdcColors.success : TdcColors.danger)
                  .withOpacity(0.5),
              blurRadius: 4)
        ],
      ),
    );
  }

  // ── Section header ────────────────────────────────────────
  Widget _buildSectionHeader(BuildContext context, CoursesProvider prov) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(children: [
          Icon(Icons.menu_book, color: TdcColors.textPrimary, size: 20),
          SizedBox(width: TdcSpacing.sm),
          Text('Parcours informatiques',
              style: TextStyle(
                  color: TdcColors.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
        ]),
        Row(children: [
          SizedBox(
            width: 140,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: prov.totalChaptersCount > 0
                    ? prov.completedCount / prov.totalChaptersCount
                    : 0.0,
                minHeight: 5,
                backgroundColor: TdcColors.surfaceAlt,
                valueColor: AlwaysStoppedAnimation(TdcColors.accent),
              ),
            ),
          ),
          SizedBox(width: TdcSpacing.sm),
          Text('${prov.completedCount}/${prov.totalChaptersCount}',
              style: TextStyle(color: TdcColors.textSecondary, fontSize: 12)),
        ]),
      ],
    );
  }

  // ── Course card ───────────────────────────────────────────
  Widget _buildCourseCard(
      BuildContext context, Course course, int index, CoursesProvider prov) {
    final color = _levelColor(course.level);
    final done = prov.courseCompletedCount(course.id);
    final total = course.chapters.length;
    final progress = total > 0 ? done / total : 0.0;

    return InkWell(
      onTap: () => _openCourseSheet(context, course, prov),
      borderRadius: TdcRadius.lg,
      child: Container(
        padding: EdgeInsets.all(TdcSpacing.md),
        decoration: BoxDecoration(
          color: TdcColors.surface,
          borderRadius: TdcRadius.lg,
          border: Border.all(color: TdcColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Index badge
            Container(
              padding:
                  EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: TdcColors.accentDim,
                  borderRadius: BorderRadius.circular(6)),
              child: Text('${index + 1}',
                  style: TextStyle(
                      color: TdcColors.accent,
                      fontWeight: FontWeight.bold,
                      fontSize: 13)),
            ),
            Spacer(),
            // Titre
            Text(course.title,
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
            SizedBox(height: 6),
            Text(
                '${course.category.toUpperCase()} · $total chapitres',
                style: TextStyle(
                    color: TdcColors.textMuted,
                    fontSize: 11,
                    letterSpacing: 0.4)),
            // Barre de progression par cours
            if (done > 0) ...[
              SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(2),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 3,
                  backgroundColor: TdcColors.surfaceAlt,
                  valueColor: AlwaysStoppedAnimation(TdcColors.success),
                ),
              ),
            ],
            SizedBox(height: TdcSpacing.md),
            Row(children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6)),
                child: Text(_levelLabel(course.level),
                    style: TextStyle(
                        color: color,
                        fontSize: 11,
                        fontWeight: FontWeight.w600)),
              ),
              SizedBox(width: TdcSpacing.sm),
              Text(course.duration,
                  style:
                      TextStyle(color: TdcColors.textMuted, fontSize: 11)),
              Spacer(),
              Icon(Icons.chevron_right,
                  color: TdcColors.textMuted, size: 18),
            ]),
          ],
        ),
      ),
    );
  }

  void _openCourseSheet(
      BuildContext context, Course course, CoursesProvider prov) {
    showModalBottomSheet(
      context: context,
      backgroundColor: TdcColors.surface,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      isScrollControlled: true,
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (_, ctrl) => ListView(
          controller: ctrl,
          padding: EdgeInsets.all(TdcSpacing.lg),
          children: [
            Center(
              child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                      color: TdcColors.border,
                      borderRadius: BorderRadius.circular(2))),
            ),
            SizedBox(height: TdcSpacing.md),
            Text(course.title,
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontSize: 22,
                    fontWeight: FontWeight.bold)),
            SizedBox(height: 6),
            Text(course.description,
                style: TextStyle(
                    color: TdcColors.textSecondary,
                    fontSize: 13,
                    height: 1.5)),
            SizedBox(height: TdcSpacing.lg),
            Divider(color: TdcColors.border),
            SizedBox(height: TdcSpacing.sm),
            ...course.chapters.asMap().entries.map((e) {
              final ch = e.value;
              final isDone =
                  prov.completed.contains('${course.id}:${ch.id}');
              return ListTile(
                contentPadding: EdgeInsets.symmetric(vertical: 2),
                leading: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isDone
                        ? TdcColors.success.withOpacity(0.15)
                        : TdcColors.surfaceAlt,
                    border: Border.all(
                        color: isDone
                            ? TdcColors.success
                            : TdcColors.border),
                  ),
                  child: Center(
                    child: isDone
                        ? Icon(Icons.check,
                            size: 15, color: TdcColors.success)
                        : Text('${e.key + 1}',
                            style: TextStyle(
                                color: TdcColors.textMuted,
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                  ),
                ),
                title: Text(ch.title,
                    style: TextStyle(
                        color: TdcColors.textPrimary, fontSize: 14)),
                subtitle: Text(ch.duration,
                    style: TextStyle(
                        color: TdcColors.textMuted, fontSize: 12)),
                trailing:
                    Icon(Icons.play_arrow, color: TdcColors.accent, size: 20),
                onTap: () {
                  prov.selectChapter(course.id, ch.id);
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/chapter');
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  // ── Sidebar ───────────────────────────────────────────────
  Widget _buildSidebar(BuildContext context, CoursesProvider prov) {
    return Container(
      width: 240,
      decoration: BoxDecoration(
        color: TdcColors.surface,
        border: Border(right: BorderSide(color: TdcColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Logo
          Padding(
            padding: EdgeInsets.fromLTRB(
                TdcSpacing.md, TdcSpacing.lg, TdcSpacing.md, TdcSpacing.md),
            child: Row(children: [
              Text('TDC',
                  style: TextStyle(
                      color: TdcColors.warning,
                      fontWeight: FontWeight.bold,
                      fontSize: 18)),
              SizedBox(width: TdcSpacing.sm),
              Text('TutoDeCode',
                  style: TextStyle(
                      color: TdcColors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 15)),
            ]),
          ),

          // Progression globale
          Padding(
            padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Progression',
                          style: TextStyle(
                              color: TdcColors.textMuted, fontSize: 11)),
                      Text(
                          '${(prov.overallProgress * 100).toInt()}%',
                          style: TextStyle(
                              color: TdcColors.accent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold)),
                    ]),
                SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: prov.overallProgress,
                    minHeight: 4,
                    backgroundColor: TdcColors.surfaceAlt,
                    valueColor: AlwaysStoppedAnimation(TdcColors.accent),
                  ),
                ),
                SizedBox(height: 4),
                Text('${prov.completedCount} sur ${prov.totalChaptersCount} chapitres',
                    style: TextStyle(
                        color: TdcColors.textMuted, fontSize: 10)),
              ],
            ),
          ),

          SizedBox(height: TdcSpacing.lg),
          Divider(color: TdcColors.border, height: 1),
          SizedBox(height: TdcSpacing.sm),

          // Navigation
          _sidebarItem(context, Icons.home_filled, 'Accueil', '/', isActive: true),
          _sidebarItem(context, Icons.smart_toy, 'Chat IA', '/ai'),
          _sidebarItem(context, Icons.settings, 'Config IA', '/ai-config',
              trailing: _buildAIStatusDot()),
          _sidebarItem(context, Icons.map, 'Roadmap', '/roadmap'),
          _sidebarItem(context, Icons.science, 'Laboratoire', '/lab'),

          Spacer(),
          Divider(color: TdcColors.border, height: 1),

          // Statut IA bas
          Padding(
            padding: EdgeInsets.all(TdcSpacing.md),
            child: InkWell(
              onTap: () => Navigator.pushNamed(context, '/ai-config'),
              borderRadius: TdcRadius.md,
              child: Container(
                padding: EdgeInsets.all(TdcSpacing.sm + 2),
                decoration: BoxDecoration(
                  color: TdcColors.surfaceAlt,
                  borderRadius: TdcRadius.md,
                  border: Border.all(color: TdcColors.border),
                ),
                child: Row(children: [
                  Icon(Icons.memory,
                      size: 16,
                      color: _aiStatus?.running == true
                          ? TdcColors.success
                          : TdcColors.textMuted),
                  SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _aiStatus == null
                              ? 'Vérification IA…'
                              : (_aiStatus!.running
                                  ? 'Ollama actif'
                                  : 'Ollama hors-ligne'),
                          style: TextStyle(
                              color: TdcColors.textPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.w600),
                        ),
                        Text(
                          _aiStatus?.running == true
                              ? '${_aiStatus!.models.length} modèle(s)'
                              : 'Cliquer pour configurer',
                          style: TextStyle(
                              color: TdcColors.textMuted, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ]),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sidebarItem(BuildContext context, IconData icon, String label,
      String route,
      {bool isActive = false, Widget? trailing}) {
    return InkWell(
      onTap: () {
        if (!isActive) Navigator.pushNamed(context, route);
      },
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: TdcSpacing.sm, vertical: 2),
        padding: EdgeInsets.symmetric(
            horizontal: TdcSpacing.md, vertical: TdcSpacing.sm + 2),
        decoration: BoxDecoration(
          color: isActive ? TdcColors.accent : Colors.transparent,
          borderRadius: TdcRadius.sm,
        ),
        child: Row(children: [
          Icon(icon,
              size: 18,
              color: isActive ? Colors.white : TdcColors.textSecondary),
          SizedBox(width: TdcSpacing.sm),
          Expanded(
            child: Text(label,
                style: TextStyle(
                    color: isActive
                        ? Colors.white
                        : TdcColors.textSecondary,
                    fontSize: 14,
                    fontWeight: isActive
                        ? FontWeight.bold
                        : FontWeight.normal)),
          ),
          if (trailing != null) trailing,
        ]),
      ),
    );
  }

  // ── Right panel ───────────────────────────────────────────
  Widget _buildRightPanel(BuildContext context, CoursesProvider prov) {
    return SizedBox(
      width: 300,
      child: Column(
        children: [
          // Statut IA
          _buildAIPanel(context),
          SizedBox(height: TdcSpacing.md),

          // Outils
          _buildToolsPanel(context),
          SizedBox(height: TdcSpacing.md),

          // Progression
          _buildProgressPanel(prov),
        ],
      ),
    );
  }

  Widget _buildAIPanel(BuildContext context) {
    final running = _aiStatus?.running ?? false;
    final models = _aiStatus?.models ?? [];

    return Container(
      padding: EdgeInsets.all(TdcSpacing.md),
      decoration: BoxDecoration(
          color: TdcColors.surface,
          borderRadius: TdcRadius.lg,
          border: Border.all(
              color: running
                  ? TdcColors.success.withOpacity(0.3)
                  : TdcColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.smart_toy,
                size: 16,
                color: running ? TdcColors.success : TdcColors.textMuted),
            SizedBox(width: 8),
            Text('Ollama IA locale',
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14)),
            Spacer(),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                  color: running
                      ? TdcColors.success.withOpacity(0.1)
                      : TdcColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4)),
              child: Text(
                  running ? 'En ligne' : 'Hors-ligne',
                  style: TextStyle(
                      color: running ? TdcColors.success : TdcColors.danger,
                      fontSize: 10,
                      fontWeight: FontWeight.bold)),
            ),
          ]),
          if (running && models.isNotEmpty) ...[
            SizedBox(height: TdcSpacing.sm),
            ...models.take(3).map((m) => Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Row(children: [
                    Icon(Icons.circle, size: 6, color: TdcColors.success),
                    SizedBox(width: 6),
                    Text(m.split(':').first,
                        style: TextStyle(
                            color: TdcColors.textSecondary,
                            fontSize: 12,
                            fontFamily: 'monospace')),
                  ]),
                )),
            SizedBox(height: TdcSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/ai'),
                icon: Icon(Icons.chat, size: 14),
                label: Text('Ouvrir le Chat', style: TextStyle(fontSize: 13)),
                style: ElevatedButton.styleFrom(
                    backgroundColor: TdcColors.accent,
                    padding: EdgeInsets.symmetric(vertical: 10)),
              ),
            ),
          ],
          if (!running) ...[
            SizedBox(height: TdcSpacing.sm),
            Text('Installez Ollama pour activer l\'assistant IA.',
                style: TextStyle(color: TdcColors.textSecondary, fontSize: 12, height: 1.4)),
            SizedBox(height: TdcSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/ai-config'),
                icon: Icon(Icons.settings, size: 14),
                label: Text('Configurer', style: TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                    foregroundColor: TdcColors.textSecondary,
                    side: BorderSide(color: TdcColors.border),
                    padding: EdgeInsets.symmetric(vertical: 10)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildToolsPanel(BuildContext context) {
    final tools = [
      _ToolItem(Icons.code, 'Éditeur Code', 'Syntax highlight & édition',
          Color(0xFF3B82F6), () => Navigator.pushNamed(context, '/lab')),
      _ToolItem(Icons.map, 'Roadmap', 'Parcours & objectifs',
          Color(0xFF10B981), () => Navigator.pushNamed(context, '/roadmap')),
      _ToolItem(Icons.chat, 'Chat IA', 'Posez vos questions',
          Color(0xFF8B5CF6), () => Navigator.pushNamed(context, '/ai')),
      _ToolItem(Icons.settings, 'Config IA', 'Gérer Ollama',
          Color(0xFFF59E0B), () => Navigator.pushNamed(context, '/ai-config')),
    ];

    return Container(
      padding: EdgeInsets.all(TdcSpacing.md),
      decoration: BoxDecoration(
          color: TdcColors.surface,
          borderRadius: TdcRadius.lg,
          border: Border.all(color: TdcColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(Icons.build, size: 15, color: TdcColors.accent),
            SizedBox(width: 7),
            Text('Outils',
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14)),
          ]),
          SizedBox(height: TdcSpacing.md),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisSpacing: TdcSpacing.sm,
            mainAxisSpacing: TdcSpacing.sm,
            childAspectRatio: 2.2,
            children: tools.map(_buildToolButton).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildToolButton(_ToolItem tool) {
    return InkWell(
      onTap: tool.onTap,
      borderRadius: TdcRadius.sm,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: tool.color.withOpacity(0.08),
          borderRadius: TdcRadius.sm,
          border: Border.all(color: tool.color.withOpacity(0.2)),
        ),
        child: Row(children: [
          Icon(tool.icon, color: tool.color, size: 16),
          SizedBox(width: 7),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(tool.label,
                    style: TextStyle(
                        color: TdcColors.textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600)),
                Text(tool.sub,
                    style: TextStyle(
                        color: TdcColors.textMuted, fontSize: 10),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildProgressPanel(CoursesProvider prov) {
    return Container(
      padding: EdgeInsets.all(TdcSpacing.md),
      decoration: BoxDecoration(
          color: TdcColors.surface,
          borderRadius: TdcRadius.lg,
          border: Border.all(color: TdcColors.border)),
      child: Column(
        children: [
          Row(children: [
            Icon(Icons.bar_chart, size: 15, color: TdcColors.accent),
            SizedBox(width: 7),
            Text('Ma progression',
                style: TextStyle(
                    color: TdcColors.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14)),
          ]),
          SizedBox(height: TdcSpacing.md),
          Text(
            '${(prov.overallProgress * 100).toInt()}%',
            style: TextStyle(
                color: TdcColors.textPrimary,
                fontSize: 48,
                fontWeight: FontWeight.bold),
          ),
          Text('${prov.completedCount} sur ${prov.totalChaptersCount} chapitres',
              style: TextStyle(color: TdcColors.textSecondary, fontSize: 12)),
          SizedBox(height: TdcSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: prov.overallProgress,
              minHeight: 8,
              backgroundColor: TdcColors.surfaceAlt,
              valueColor: AlwaysStoppedAnimation(TdcColors.accent),
            ),
          ),
          SizedBox(height: TdcSpacing.sm),
          Text(
            prov.completedCount == 0
                ? 'Commencez votre premier cours !'
                : 'Continuez votre apprentissage',
            style: TextStyle(color: TdcColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    );
  }

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
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return l;
    }
  }
}

class _ToolItem {
  final IconData icon;
  final String label;
  final String sub;
  final Color color;
  final VoidCallback onTap;
  const _ToolItem(this.icon, this.label, this.sub, this.color, this.onTap);
}
