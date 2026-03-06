// ============================================================
// app_shell.dart — Coquille responsive commune à toutes les pages
// ── Desktop : sidebar fixe à gauche + contenu
// ── Tablet  : sidebar escamotable (drawer) + contenu plein
// ── Mobile  : drawer + BottomNavigationBar
// ============================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../core/responsive/responsive.dart';
import '../features/courses/providers/courses_provider.dart';
import '../features/ghost_ai/service/ollama_service.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  final String activeRoute;
  final String title;
  final List<Widget>? actions;

  const AppShell({
    super.key,
    required this.child,
    required this.activeRoute,
    this.title = 'TutoDeCode',
    this.actions,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
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

  // ── Items de navigation ───────────────────────────────────
  List<_NavItem> get _navItems => [
    _NavItem(Icons.home_filled,  'Accueil',     '/'),
    _NavItem(Icons.smart_toy,    'Chat IA',      '/ai'),
    _NavItem(Icons.settings,     'Config IA',    '/ai-config', trailing: _aiDot()),
    _NavItem(Icons.map,          'Roadmap',      '/roadmap'),
    _NavItem(Icons.science,      'Laboratoire',  '/lab'),
    _NavItem(Icons.analytics,    'Diagnostic',   '/dashboard'),
  ];

  // ── Petites icônes de statut IA ───────────────────────────
  Widget _aiDot() {
    if (_aiStatus == null) {
      return SizedBox(
        width: 8, height: 8,
        child: CircularProgressIndicator(strokeWidth: 1.5, color: TdcColors.textMuted),
      );
    }
    return Container(
      width: 8, height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _aiStatus!.running ? TdcColors.success : TdcColors.danger,
        boxShadow: [BoxShadow(
          color: (_aiStatus!.running ? TdcColors.success : TdcColors.danger).withOpacity(0.5),
          blurRadius: 4,
        )],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (ctx, type) {
        if (type.isDesktop) return _buildDesktop(ctx);
        if (type.isTablet) return _buildTablet(ctx);
        return _buildMobile(ctx);
      },
    );
  }

  // ════════════════════════════════════════════════════════
  // DESKTOP : sidebar fixe (240px) + contenu
  // ════════════════════════════════════════════════════════
  Widget _buildDesktop(BuildContext context) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: SafeArea(
        child: Row(
          children: [
            _buildSidebar(context, width: 240),
            Expanded(child: widget.child),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════
  // TABLET : drawer + contenu plein écran
  // ════════════════════════════════════════════════════════
  Widget _buildTablet(BuildContext context) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      drawer: Drawer(
        backgroundColor: TdcColors.surface,
        width: 260,
        child: SafeArea(child: _buildSidebar(context, width: 260, insideDrawer: true)),
      ),
      appBar: _buildAppBar(context),
      body: widget.child,
    );
  }

  // ════════════════════════════════════════════════════════
  // MOBILE : drawer + BottomNavigationBar (5 premiers items)
  // ════════════════════════════════════════════════════════
  Widget _buildMobile(BuildContext context) {
    // Index actif pour la BottomNavigationBar (4 items principaux)
    final mobileItems = _navItems.take(4).toList();
    final activeIndex = mobileItems.indexWhere((i) => i.route == widget.activeRoute);

    return Scaffold(
      backgroundColor: TdcColors.bg,
      drawer: Drawer(
        backgroundColor: TdcColors.surface,
        child: SafeArea(child: _buildSidebar(context, width: double.infinity, insideDrawer: true)),
      ),
      appBar: _buildAppBar(context),
      body: widget.child,
      bottomNavigationBar: _buildBottomNav(context, mobileItems, activeIndex),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => Navigator.pushNamed(context, '/ai'),
        backgroundColor: Color(0xFF2D2060),
        child: Icon(Icons.smart_toy, color: TdcColors.warning, size: 20),
      ),
    );
  }

  // ── AppBar partagée mobile/tablet ─────────────────────────
  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: TdcColors.surface,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(children: [
        Icon(Icons.code, color: TdcColors.accent, size: 20),
        SizedBox(width: 8),
        Text(widget.title,
            style: TextStyle(
              color: TdcColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            )),
      ]),
      actions: [
        if (widget.actions != null) ...widget.actions!,
        // Bouton IA rapide
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/ai-config'),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(children: [
              Icon(Icons.memory, size: 16, color: _aiStatus?.running == true ? TdcColors.success : TdcColors.textMuted),
              SizedBox(width: 4),
              _aiDot(),
            ]),
          ),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: Size.fromHeight(1),
        child: Divider(height: 1, color: TdcColors.border),
      ),
    );
  }

  // ── BottomNavigationBar ───────────────────────────────────
  Widget _buildBottomNav(BuildContext context, List<_NavItem> items, int activeIndex) {
    return Container(
      decoration: BoxDecoration(
        color: TdcColors.surface,
        border: Border(top: BorderSide(color: TdcColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: items.asMap().entries.map((e) {
            final item = e.value;
            final isActive = item.route == widget.activeRoute;
            return Expanded(
              child: InkWell(
                onTap: () {
                  if (!isActive) Navigator.pushNamed(context, item.route);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(item.icon,
                          size: 22,
                          color: isActive ? TdcColors.accent : TdcColors.textMuted),
                      SizedBox(height: 4),
                      Text(item.label,
                          style: TextStyle(
                            fontSize: 10,
                            color: isActive ? TdcColors.accent : TdcColors.textMuted,
                            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                          )),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Sidebar (réutilisée desktop + drawer) ─────────────────
  Widget _buildSidebar(BuildContext context, {required double width, bool insideDrawer = false}) {
    return Consumer<CoursesProvider>(
      builder: (context, prov, _) {
        return Container(
          width: width,
          height: double.infinity,
          decoration: BoxDecoration(
            color: TdcColors.surface,
            border: insideDrawer ? null : Border(right: BorderSide(color: TdcColors.border)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Logo ──
              Padding(
                padding: EdgeInsets.fromLTRB(TdcSpacing.md, TdcSpacing.lg, TdcSpacing.md, TdcSpacing.md),
                child: Row(children: [
                  Image.asset('assets/logo.png', width: 32, height: 32),
                  SizedBox(width: TdcSpacing.sm),
                  Text('TutoDeCode',
                      style: TextStyle(
                        color: TdcColors.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      )),
                ]),
              ),

              // ── Progression globale ──
              Padding(
                padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Progression',
                            style: TextStyle(color: TdcColors.textMuted, fontSize: 11)),
                        Text('${(prov.overallProgress * 100).toInt()}%',
                            style: TextStyle(color: TdcColors.accent, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
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
                        style: TextStyle(color: TdcColors.textMuted, fontSize: 10)),
                  ],
                ),
              ),

              SizedBox(height: TdcSpacing.lg),
              Divider(color: TdcColors.border, height: 1),
              SizedBox(height: TdcSpacing.sm),

              // ── Navigation ──
              ..._navItems.map((item) => _buildNavItem(context, item, insideDrawer)),

              // Spacer remplacé par Expanded + vide
              Expanded(child: SizedBox()),
              Divider(color: TdcColors.border, height: 1),

              // ── Statut IA bas ──
              Padding(
                padding: EdgeInsets.all(TdcSpacing.md),
                child: InkWell(
                  onTap: () {
                    if (insideDrawer) Navigator.pop(context);
                    Navigator.pushNamed(context, '/ai-config');
                  },
                  borderRadius: TdcRadius.md,
                  child: Container(
                    padding: EdgeInsets.all(TdcSpacing.sm + 2),
                    decoration: BoxDecoration(
                      color: TdcColors.surfaceAlt,
                      borderRadius: TdcRadius.md,
                      border: Border.all(color: TdcColors.border),
                    ),
                    child: Row(children: [
                      Icon(Icons.memory, size: 16,
                          color: _aiStatus?.running == true ? TdcColors.success : TdcColors.textMuted),
                      SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _aiStatus == null
                                  ? 'Vérification…'
                                  : (_aiStatus!.running ? 'Ollama actif' : 'Ollama hors-ligne'),
                              style: TextStyle(color: TdcColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              _aiStatus?.running == true
                                  ? '${_aiStatus!.models.length} modèle(s)'
                                  : 'Cliquer pour configurer',
                              style: TextStyle(color: TdcColors.textMuted, fontSize: 10),
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
      },
    );

  }

  Widget _buildNavItem(BuildContext context, _NavItem item, bool insideDrawer) {
    final isActive = item.route == widget.activeRoute;
    return InkWell(
      onTap: () {
        if (insideDrawer) Navigator.pop(context);
        if (!isActive) Navigator.pushNamed(context, item.route);
      },
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: TdcSpacing.sm, vertical: 2),
        padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md, vertical: TdcSpacing.sm + 2),
        decoration: BoxDecoration(
          color: isActive ? TdcColors.accent : Colors.transparent,
          borderRadius: TdcRadius.sm,
        ),
        child: Row(children: [
          Icon(item.icon, size: 18,
              color: isActive ? Colors.white : TdcColors.textSecondary),
          SizedBox(width: TdcSpacing.sm),
          Expanded(
            child: Text(item.label,
                style: TextStyle(
                  color: isActive ? Colors.white : TdcColors.textSecondary,
                  fontSize: 14,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                )),
          ),
          if (item.trailing != null) item.trailing!,
        ]),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String route;
  final Widget? trailing;
  const _NavItem(this.icon, this.label, this.route, {this.trailing});
}
