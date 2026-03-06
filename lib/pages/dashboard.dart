import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../features/ghost_ai/service/ollama_service.dart';
import '../features/courses/providers/courses_provider.dart';
import '../core/theme/app_theme.dart';
import '../core/responsive/responsive.dart';

// ─── Résultat d'un test ────────────────────────────────────────────────────────
enum _Status { idle, running, ok, warn, error }

class _Check {
  final String label;
  final String description;
  _Status status;
  String result;
  _Check({required this.label, required this.description, this.status = _Status.idle, this.result = ''});
}

// ─── Page Diagnostic ──────────────────────────────────────────────────────────
class DashboardPage extends StatefulWidget {
  @override State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _prov = Provider.of<CoursesProvider>(context, listen: false);
      _runAll();
    });
  }

  @override
  void dispose() { _tabCtrl.dispose(); super.dispose(); }

  final _checks = <_Check>[
    _Check(label: 'Système d\'exploitation', description: 'Nom et version de l\'OS'),
    _Check(label: 'Variable PATH', description: 'Outils accessibles en ligne de commande'),
    _Check(label: 'Mémoire RAM', description: 'Disponibilité pour les modèles IA'),
    _Check(label: 'Serveur Ollama', description: 'localhost:11434 — moteur IA local'),
    _Check(label: 'Modèles IA installés', description: 'Modèles disponibles pour Ghost AI'),
    _Check(label: 'Connexion réseau', description: 'Réseau local disponible'),
    _Check(label: 'Connexion Internet', description: 'Accès externe (GitHub, Docker Hub…)'),
  ];

  OllamaStatus? _ollamaStatus;
  bool _running = false;
  int  _score   = 0;
  DateTime? _lastRun;
  CoursesProvider? _prov;

  Future<void> _runAll() async {
    setState(() { _running = true; for (final c in _checks) { c.status = _Status.idle; c.result = ''; } });

    await _runCheck(0, _checkOS);
    await _runCheck(1, _checkPath);
    await _runCheck(2, _checkMemory);
    await _runCheck(3, _checkOllama);
    await _runCheck(4, _checkModels);
    await _runCheck(5, _checkNetwork);
    await _runCheck(6, _checkInternet);

    // Score
    final ok   = _checks.where((c) => c.status == _Status.ok).length;
    final warn = _checks.where((c) => c.status == _Status.warn).length;

    setState(() {
      _score   = ((ok * 100 + warn * 50) / (_checks.length * 100) * 100).round();
      _running = false;
      _lastRun = DateTime.now();
    });
  }

  Future<void> _runCheck(int i, Future<void> Function(_Check) fn) async {
    setState(() => _checks[i].status = _Status.running);
    try { await fn(_checks[i]); }
    catch (e) { _checks[i].status = _Status.error; _checks[i].result = e.toString(); }
    setState(() {});
  }

  // ─── Tests individuels ──────────────────────────────────────────────────────
  Future<void> _checkOS(_Check c) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final os = Platform.operatingSystem;
    final ver = Platform.operatingSystemVersion;
    c.status = _Status.ok;
    c.result = '${os[0].toUpperCase()}${os.substring(1)} — $ver';
  }

  Future<void> _checkPath(_Check c) async {
    await Future.delayed(const Duration(milliseconds: 100));
    final path = Platform.environment['PATH'] ?? '';
    if (path.isEmpty) { c.status = _Status.warn; c.result = 'Variable PATH vide'; return; }
    final count = path.split(Platform.isWindows ? ';' : ':').length;
    c.status = _Status.ok;
    c.result = '$count entrées dans PATH';
  }

  Future<void> _checkMemory(_Check c) async {
    await Future.delayed(const Duration(milliseconds: 150));
    // Pas d'accès direct à la RAM en Flutter desktop sans plugin
    // On donne une indication basée sur la plateforme
    c.status = _Status.warn;
    c.result = 'Recommandé : 8 GB+ pour Mistral/Qwen3, 4 GB pour Phi-3';
  }

  Future<void> _checkOllama(_Check c) async {
    final s = await OllamaService.checkStatus();
    _ollamaStatus = s;
    if (s.running) {
      c.status = _Status.ok;
      c.result = 'Ollama ${s.version ?? ''} actif sur localhost:11434';
    } else {
      c.status = _Status.error;
      c.result = s.error ?? 'Ollama non détecté';
    }
  }

  Future<void> _checkModels(_Check c) async {
    final s = _ollamaStatus;
    if (s == null || !s.running) {
      c.status = _Status.error; c.result = 'Ollama requis pour lister les modèles'; return;
    }
    if (s.models.isEmpty) {
      c.status = _Status.warn;
      c.result = 'Aucun modèle installé — ollama pull phi3';
    } else {
      c.status = _Status.ok;
      c.result = s.models.join(', ');
    }
  }

  Future<void> _checkNetwork(_Check c) async {
    try {
      final result = await InternetAddress.lookup('localhost').timeout(const Duration(seconds: 3));
      c.status = result.isNotEmpty ? _Status.ok : _Status.warn;
      c.result = result.isNotEmpty ? 'Réseau local OK' : 'Aucune interface réseau trouvée';
    } catch (_) {
      c.status = _Status.warn; c.result = 'Impossible de vérifier le réseau local';
    }
  }

  Future<void> _checkInternet(_Check c) async {
    try {
      final result = await InternetAddress.lookup('github.com').timeout(const Duration(seconds: 4));
      c.status = result.isNotEmpty ? _Status.ok : _Status.warn;
      c.result = result.isNotEmpty ? 'Internet accessible (github.com résolu)' : 'DNS non résolu';
    } on SocketException {
      c.status = _Status.warn; c.result = 'Pas d\'accès Internet (mode hors-ligne ?)';
    } on TimeoutException {
      c.status = _Status.warn; c.result = 'Délai dépassé — connexion lente ou bloquée';
    } catch (e) {
      c.status = _Status.warn; c.result = e.toString();
    }
  }

  // ─── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final prov = Provider.of<CoursesProvider>(context);

    final isMobile = TdcBreakpoints.isMobile(context);
    final sidePanel = Container(
      width: isMobile ? double.infinity : TdcAdaptive.space(context, 280),
      color: TdcColors.surface,
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 20)),
      child: Column(children: [
        _buildScoreCard(context),
        SizedBox(height: TdcAdaptive.space(context, 20)),
        _buildCourseStats(context, prov),
        SizedBox(height: TdcAdaptive.space(context, 20)),
        _buildOllamaCard(context),
        if (!isMobile) const Spacer(),
        if (!isMobile) _buildActions(context),
      ]),
    );

    final contentPanel = Column(children: [
      Container(
        color: TdcColors.surface,
        child: TabBar(
          controller: _tabCtrl,
          labelColor: TdcColors.accent,
          unselectedLabelColor: TdcColors.textMuted,
          indicatorColor: TdcColors.accent,
          tabs: [
            Tab(icon: Icon(Icons.checklist, size: TdcAdaptive.icon(context, 18)), text: 'Tests système'),
            Tab(icon: Icon(Icons.terminal, size: TdcAdaptive.icon(context, 18)), text: 'Commandes utiles'),
          ],
        ),
      ),
      Expanded(
        child: TabBarView(
          controller: _tabCtrl,
          children: [
            // TAB 1 : tests
            ListView(
              padding: EdgeInsets.all(TdcAdaptive.padding(context, 24)),
              shrinkWrap: isMobile,
              physics: isMobile ? const NeverScrollableScrollPhysics() : null,
              children: [
                _sectionTitle(context, 'Environnement système', Icons.computer),
                ..._checks.take(3).map((c) => _buildCheckTile(context, c)),
                SizedBox(height: TdcAdaptive.space(context, 16)),
                _sectionTitle(context, 'IA locale (Ollama)', Icons.smart_toy),
                ..._checks.skip(3).take(2).map((c) => _buildCheckTile(context, c)),
                SizedBox(height: TdcAdaptive.space(context, 16)),
                _sectionTitle(context, 'Connectivité réseau', Icons.wifi),
                ..._checks.skip(5).map((c) => _buildCheckTile(context, c)),
                SizedBox(height: TdcAdaptive.space(context, 20)),
                if (!_running && _lastRun != null) _buildTips(context),
              ],
            ),
            // TAB 2 : commandes
            _buildCommandsRef(context),
          ],
        ),
      ),
    ]);

    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: Column(children: [
        _buildHeader(context),
        Expanded(
          child: isMobile 
            ? SingleChildScrollView(child: Column(children: [sidePanel, SizedBox(height: TdcAdaptive.space(context, 500), child: contentPanel)]))
            : Row(children: [sidePanel, Expanded(child: contentPanel)]),
        ),
      ]),
    );
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 20), 
        vertical: TdcAdaptive.padding(context, 16)),
      decoration: BoxDecoration(color: TdcColors.surface, border: Border(bottom: BorderSide(color: TdcColors.border))),
      child: Row(children: [
        IconButton(
          icon: Icon(Icons.arrow_back_ios_new, size: TdcAdaptive.icon(context, 18)), color: TdcColors.textSecondary,
          onPressed: () => Navigator.pop(context), padding: EdgeInsets.zero, constraints: const BoxConstraints(),
        ),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        Container(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 8)),
          decoration: BoxDecoration(color: TdcColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10))),
          child: Icon(Icons.health_and_safety, color: TdcColors.success, size: TdcAdaptive.icon(context, 22)),
        ),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Diagnostic Système', 
            style: TextStyle(
              color: TdcColors.textPrimary, 
              fontSize: TdcText.h2(context), 
              fontWeight: FontWeight.bold)),
          Text(
            _lastRun != null ? 'Dernier test : ${_fmtTime(_lastRun!)}' : 'Analyse de votre environnement TutoDeCode',
            style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.label(context)),
          ),
        ]),
        const Spacer(),
        if (_running)
          Padding(
            padding: EdgeInsets.symmetric(horizontal: TdcAdaptive.padding(context, 12)), 
            child: SizedBox(
              width: TdcAdaptive.space(context, 20), 
              height: TdcAdaptive.space(context, 20), 
              child: const CircularProgressIndicator(strokeWidth: 2, color: TdcColors.accent)))
        else
          ElevatedButton.icon(
            onPressed: _runAll,
            icon: Icon(Icons.refresh, size: TdcAdaptive.icon(context, 16)),
            label: Text('Relancer', style: TextStyle(fontSize: TdcText.button(context))),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: TdcAdaptive.padding(context, 16), 
                vertical: TdcAdaptive.padding(context, 10))),
          ),
      ]),
    );
  }

  // ─── Score ─────────────────────────────────────────────────────────────────
  Widget _buildScoreCard(BuildContext context) {
    Color scoreColor;
    String scoreLabel;
    if (_score >= 85) { scoreColor = TdcColors.success; scoreLabel = 'Excellent'; }
    else if (_score >= 60) { scoreColor = TdcColors.warning; scoreLabel = 'Correct'; }
    else { scoreColor = TdcColors.danger; scoreLabel = 'À améliorer'; }

    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 18)),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [scoreColor.withOpacity(0.08), TdcColors.surfaceAlt], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 14)),
        border: Border.all(color: scoreColor.withOpacity(0.2)),
      ),
      child: Column(children: [
        Stack(alignment: Alignment.center, children: [
          SizedBox(
            width: TdcAdaptive.space(context, 90), 
            height: TdcAdaptive.space(context, 90),
            child: CircularProgressIndicator(
              value: _running ? null : _score / 100,
              strokeWidth: 6,
              backgroundColor: TdcColors.border,
              valueColor: AlwaysStoppedAnimation(scoreColor),
            ),
          ),
          Text(_running ? '…' : '$_score', 
            style: TextStyle(
              color: scoreColor, 
              fontSize: TdcText.scale(context, 28), 
              fontWeight: FontWeight.bold)),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 12)),
        Text(_running ? 'Analyse…' : scoreLabel, 
          style: TextStyle(
            color: scoreColor, 
            fontWeight: FontWeight.bold, 
            fontSize: TdcText.body(context))),
        SizedBox(height: TdcAdaptive.space(context, 4)),
        Text('Score de santé', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
        SizedBox(height: TdcAdaptive.space(context, 12)),
        // Légende rapide
        Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
          _legendDot(context, TdcColors.success, '${_checks.where((c) => c.status == _Status.ok).length} OK'),
          _legendDot(context, TdcColors.warning, '${_checks.where((c) => c.status == _Status.warn).length} Avert.'),
          _legendDot(context, TdcColors.danger,  '${_checks.where((c) => c.status == _Status.error).length} Fail'),
        ]),
      ]),
    );
  }

  Widget _legendDot(BuildContext context, Color c, String label) => Row(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 8, height: 8, decoration: BoxDecoration(color: c, shape: BoxShape.circle)),
    SizedBox(width: TdcAdaptive.space(context, 5)),
    Text(label, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.label(context))),
  ]);

  // ─── Stats cours ───────────────────────────────────────────────────────────
  Widget _buildCourseStats(BuildContext context, CoursesProvider prov) {
    final total  = prov.totalChaptersCount;
    final done   = prov.completedCount;
    final prog   = total > 0 ? done / total : 0.0;

    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt, 
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)), 
        border: Border.all(color: TdcColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(Icons.school, size: TdcAdaptive.icon(context, 14), color: TdcColors.accent),
          SizedBox(width: TdcAdaptive.space(context, 7)),
          Text('Progression cours', 
            style: TextStyle(
              color: TdcColors.textSecondary, 
              fontSize: TdcText.label(context), 
              fontWeight: FontWeight.bold)),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 12)),
        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
          _miniStat(context, '${prov.courses.length}', 'Cours', TdcColors.accent),
          _miniStat(context, '$total', 'Chapitres', TdcColors.info),
          _miniStat(context, '$done', 'Complétés', TdcColors.success),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 10)),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(value: prog, minHeight: 5, backgroundColor: TdcColors.border, valueColor: const AlwaysStoppedAnimation(TdcColors.accent)),
        ),
        SizedBox(height: TdcAdaptive.space(context, 5)),
        Text('${(prog * 100).toInt()}% de progression globale', style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
      ]),
    );
  }

  Widget _miniStat(BuildContext context, String val, String label, Color c) => Column(children: [
    Text(val, style: TextStyle(color: c, fontSize: TdcText.h1(context), fontWeight: FontWeight.bold)),
    Text(label, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
  ]);

  // ─── Card Ollama ───────────────────────────────────────────────────────────
  Widget _buildOllamaCard(BuildContext context) {
    final s = _ollamaStatus;
    final running = s?.running ?? false;

    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
      decoration: BoxDecoration(
        color: running ? TdcColors.success.withOpacity(0.05) : TdcColors.danger.withOpacity(0.05),
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)),
        border: Border.all(color: running ? TdcColors.success.withOpacity(0.2) : TdcColors.danger.withOpacity(0.2)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: TdcAdaptive.space(context, 10), 
            height: TdcAdaptive.space(context, 10),
            decoration: BoxDecoration(
              shape: BoxShape.circle, color: running ? TdcColors.success : TdcColors.danger,
              boxShadow: [BoxShadow(color: (running ? TdcColors.success : TdcColors.danger).withOpacity(0.5), blurRadius: 6)],
            ),
          ),
          SizedBox(width: TdcAdaptive.space(context, 8)),
          Text('Ghost AI (Ollama)', 
            style: TextStyle(
              color: running ? TdcColors.success : TdcColors.danger, 
              fontWeight: FontWeight.bold, 
              fontSize: TdcText.label(context))),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 8)),
        if (s != null) ...[
          Text(running ? 'v${s.version ?? '?'} — ${s.models.length} modèle(s)' : (s.error ?? 'Hors-ligne'),
            style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.label(context))),
          if (running && s.models.isNotEmpty) ...[
            SizedBox(height: TdcAdaptive.space(context, 8)),
            ...s.models.map((m) => Padding(
              padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 4)),
              child: Row(children: [
                Icon(Icons.memory, size: TdcAdaptive.icon(context, 12), color: TdcColors.textMuted),
                SizedBox(width: TdcAdaptive.space(context, 6)),
                Text(m, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.label(context))),
              ]),
            )),
          ],
          if (!running) ...[
            SizedBox(height: TdcAdaptive.space(context, 10)),
            Container(
              padding: EdgeInsets.all(TdcAdaptive.padding(context, 8)),
              decoration: BoxDecoration(color: TdcColors.surfaceAlt, borderRadius: BorderRadius.circular(8)),
              child: Text('→ ollama serve', 
                style: TextStyle(
                  color: TdcColors.warning, 
                  fontSize: TdcText.label(context), 
                  fontFamily: 'Courier New')),
            ),
          ],
        ],
      ]),
    );
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
  Widget _buildActions(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      OutlinedButton.icon(
        onPressed: () => Navigator.pushNamed(context, '/ai-config'),
        icon: Icon(Icons.settings, size: TdcAdaptive.icon(context, 15)),
        label: Text('Config Ollama', style: TextStyle(fontSize: TdcText.button(context))),
        style: OutlinedButton.styleFrom(
          foregroundColor: TdcColors.accent, 
          side: BorderSide(color: TdcColors.accent.withOpacity(0.4)), 
          padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, 10))),
      ),
      SizedBox(height: TdcAdaptive.space(context, 8)),
      OutlinedButton.icon(
        onPressed: () => Navigator.pushNamed(context, '/ai-chat'),
        icon: Icon(Icons.chat, size: TdcAdaptive.icon(context, 15)),
        label: Text('Ouvrir Ghost AI', style: TextStyle(fontSize: TdcText.button(context))),
        style: OutlinedButton.styleFrom(
          foregroundColor: TdcColors.success, 
          side: BorderSide(color: TdcColors.success.withOpacity(0.4)), 
          padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, 10))),
      ),
    ]);
  }

  // ─── Tile de vérification ───────────────────────────────────────────────────
  Widget _buildCheckTile(BuildContext context, _Check check) {
    final color  = _statusColor(check.status);
    final icon   = _statusIcon(check.status);

    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 10)),
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)),
        border: Border.all(color: check.status == _Status.ok ? TdcColors.border : color.withOpacity(0.25)),
      ),
      child: Row(children: [
        Container(
          width: TdcAdaptive.space(context, 36), 
          height: TdcAdaptive.space(context, 36),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: check.status == _Status.running
              ? Padding(padding: EdgeInsets.all(TdcAdaptive.padding(context, 8)), child: CircularProgressIndicator(strokeWidth: 2, color: color))
              : Icon(icon, color: color, size: TdcAdaptive.icon(context, 20)),
        ),
        SizedBox(width: TdcAdaptive.space(context, 14)),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(check.label, 
            style: TextStyle(
              color: TdcColors.textPrimary, 
              fontWeight: FontWeight.w600, 
              fontSize: TdcText.bodySmall(context))),
          SizedBox(height: TdcAdaptive.space(context, 2)),
          Text(check.result.isNotEmpty ? check.result : check.description,
            style: TextStyle(
              color: check.result.isNotEmpty ? color.withOpacity(0.9) : TdcColors.textMuted, 
              fontSize: TdcText.label(context), 
              height: 1.4)),
        ])),
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 8), 
            vertical: TdcAdaptive.padding(context, 3)),
          decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(5)),
          child: Text(_statusLabel(check.status), 
            style: TextStyle(
              color: color, 
              fontSize: TdcText.label(context), 
              fontWeight: FontWeight.bold)),
        ),
      ]),
    );
  }

  // ─── Conseils ──────────────────────────────────────────────────────────────
  Widget _buildTips(BuildContext context) {
    final hasOllamaError = _checks[3].status != _Status.ok;
    final hasNoModels    = _checks[4].status != _Status.ok;
    final tips = <Map<String, dynamic>>[];

    if (hasOllamaError) tips.add({'icon': Icons.warning_amber, 'color': TdcColors.danger, 'title': 'Ollama non démarré', 'cmd': 'ollama serve'});
    if (hasNoModels)    tips.add({'icon': Icons.download, 'color': TdcColors.warning, 'title': 'Installer un modèle rapide', 'cmd': 'ollama pull phi3'});
    if (!hasOllamaError && !hasNoModels) tips.add({'icon': Icons.check_circle, 'color': TdcColors.success, 'title': 'Tout est opérationnel !', 'cmd': ''});

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _sectionTitle(context, 'Recommandations', Icons.lightbulb_outline),
      SizedBox(height: TdcAdaptive.space(context, 8)),
      ...tips.map((t) => Container(
        margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 10)),
        padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
        decoration: BoxDecoration(
          color: (t['color'] as Color).withOpacity(0.05),
          borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)),
          border: Border.all(color: (t['color'] as Color).withOpacity(0.2)),
        ),
        child: Row(children: [
          Icon(t['icon'] as IconData, color: t['color'] as Color, size: TdcAdaptive.icon(context, 20)),
          SizedBox(width: TdcAdaptive.space(context, 12)),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t['title'] as String, 
              style: TextStyle(
                color: t['color'] as Color, 
                fontWeight: FontWeight.bold, 
                fontSize: TdcText.bodySmall(context))),
            if ((t['cmd'] as String).isNotEmpty) ...[
              SizedBox(height: TdcAdaptive.space(context, 4)),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 8), 
                  vertical: TdcAdaptive.padding(context, 4)),
                decoration: BoxDecoration(color: TdcColors.surfaceAlt, borderRadius: BorderRadius.circular(5)),
                child: Text(t['cmd'] as String, 
                  style: TextStyle(
                    color: TdcColors.warning, 
                    fontFamily: 'Courier New', 
                    fontSize: TdcText.label(context))),
              ),
            ],
          ])),
        ]),
      )),
    ]);
  }

  Widget _sectionTitle(BuildContext context, String title, IconData icon) => Padding(
    padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 10)),
    child: Row(children: [
      Icon(icon, size: TdcAdaptive.icon(context, 16), color: TdcColors.accent),
      SizedBox(width: TdcAdaptive.space(context, 8)),
      Text(title, 
        style: TextStyle(
          color: TdcColors.textPrimary, 
          fontWeight: FontWeight.bold, 
          fontSize: TdcText.bodySmall(context))),
    ]),
  );

  // ─── Helpers ───────────────────────────────────────────────────────────────
  Color _statusColor(_Status s) {
    switch (s) {
      case _Status.ok:      return TdcColors.success;
      case _Status.warn:    return TdcColors.warning;
      case _Status.error:   return TdcColors.danger;
      case _Status.running: return TdcColors.accent;
      default:              return TdcColors.textMuted;
    }
  }
  IconData _statusIcon(_Status s) {
    switch (s) {
      case _Status.ok:    return Icons.check_circle;
      case _Status.warn:  return Icons.warning_amber;
      case _Status.error: return Icons.cancel;
      default:            return Icons.circle_outlined;
    }
  }
  String _statusLabel(_Status s) {
    switch (s) {
      case _Status.ok:      return 'OK';
      case _Status.warn:    return 'AVERT.';
      case _Status.error:   return 'ERREUR';
      case _Status.running: return '...';
      default:              return 'IDLE';
    }
  }
  String _fmtTime(DateTime dt) => '${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}:${dt.second.toString().padLeft(2,'0')}';

  // ─── Referentiel de commandes ───────────────────────────────────────────────
  static const _kCmds = [
    _CmdCat(icon: Icons.computer, color: Color(0xFF6366F1), label: 'Systeme', cmds: [
      _Cmd('Infos OS (Linux)', 'uname -a',              'linux', 'Version noyau, architecture, hostname'),
      _Cmd('Infos OS details',  'cat /etc/os-release',  'linux', 'Distribution, version, ID'),
      _Cmd('Infos OS (Win)',    'winver',                'win',   'Ouvre la fenetre de version Windows'),
      _Cmd('Infos systeme Win', 'systeminfo',            'win',   'CPU, RAM, OS, reseau -- tout en un'),
      _Cmd('Uptime (Linux)',    'uptime -p',             'linux', 'Depuis combien de temps le serveur tourne'),
      _Cmd('Uptime (Win)',      'net statistics workstation', 'win', 'Date de demarrage du systeme'),
      _Cmd('Architecture CPU',  'uname -m',              'linux', 'x86_64, arm64, etc.'),
      _Cmd('Infos CPU',         'lscpu',                 'linux', 'Nombre de coeurs, modele, frequence'),
      _Cmd('Infos CPU (Win)',   'Get-WmiObject Win32_Processor | Select Name,NumberOfCores', 'win', 'Modele et coeurs'),
    ]),
    _CmdCat(icon: Icons.memory, color: Color(0xFF10B981), label: 'Memoire & Disque', cmds: [
      _Cmd('RAM libre (Linux)', 'free -h',              'linux', 'RAM totale, utilisee, libre (lisible)'),
      _Cmd('RAM (Win PS)',      'Get-WmiObject Win32_ComputerSystem | Select TotalPhysicalMemory', 'win', 'RAM totale en bytes'),
      _Cmd('Disque (Linux)',    'df -h',                'linux', 'Espace disque par partition'),
      _Cmd('Disque detail',     'lsblk',                'linux', 'Arborescence des disques et partitions'),
      _Cmd('Disque (Win)',      'Get-PSDrive -PSProvider FileSystem', 'win', 'Espace libre/utilise par lecteur'),
      _Cmd('Dossier + volumineux', 'du -sh /* 2>/dev/null | sort -rh | head -10', 'linux', 'Top 10 dossiers les plus lourds'),
      _Cmd('Fichiers > 100MB', 'find / -size +100M -type f 2>/dev/null', 'linux', 'Fichiers volumineux a nettoyer'),
    ]),
    _CmdCat(icon: Icons.settings, color: Color(0xFFF59E0B), label: 'Processus & Performance', cmds: [
      _Cmd('Top processus',     'top',                  'linux', 'Monitoring temps reel CPU/RAM'),
      _Cmd('Top interactif',    'htop',                 'linux', 'Version amelioree de top (a installer)'),
      _Cmd('Top Win PowerShell','Get-Process | Sort CPU -Descending | Select -First 15', 'win', 'Top 15 processus par CPU'),
      _Cmd('Tous les processus','ps aux',               'linux', 'Liste avec PID, CPU%, MEM%, commande'),
      _Cmd('Rechercher process', 'ps aux | grep nginx', 'linux', 'Filtrer par nom de processus'),
      _Cmd('PID dun processus', 'pgrep -l nginx',       'linux', 'Trouver le PID par nom'),
      _Cmd('Tuer un processus', 'kill -9 <PID>',        'both',  'Forcer l\'arret (-9 = SIGKILL)'),
      _Cmd('Services actifs',   'systemctl list-units --state=running', 'linux', 'Services systemd en cours'),
      _Cmd('Services (Win)',    'Get-Service | Where Status -EQ Running', 'win', 'Services Windows actifs'),
    ]),
    _CmdCat(icon: Icons.wifi, color: Color(0xFF3B82F6), label: 'Reseau', cmds: [
      _Cmd('Interfaces reseau', 'ip addr show',         'linux', 'IPs de toutes les interfaces'),
      _Cmd('Interfaces (ifconfig)', 'ifconfig -a',      'linux', 'Alternative a ip addr'),
      _Cmd('Interfaces (Win)',  'ipconfig /all',         'win',   'IPs, passerelle, DNS, MAC'),
      _Cmd('DNS actuel',        'cat /etc/resolv.conf', 'linux', 'Serveurs DNS configures'),
      _Cmd('DNS (Win)',         'Get-DnsClientServerAddress', 'win', 'Serveurs DNS par interface'),
      _Cmd('Ports ouverts',     'ss -tlnp',             'linux', 'TCP + PID qui ecoute (remplace netstat)'),
      _Cmd('Ports ouverts (Win)','netstat -ano',         'win',   'Ports + PID associes'),
      _Cmd('Ping de base',      'ping -c 4 google.com', 'linux', '4 paquets vers Google'),
      _Cmd('Traceroute (Linux)','traceroute google.com', 'linux', 'Chemin des paquets vers la cible'),
      _Cmd('Traceroute (Win)',  'tracert google.com',    'win',   'Equivalent Windows'),
      _Cmd('Test DNS',          'nslookup github.com',  'both',  'Resoudre un nom de domaine'),
      _Cmd('Test DNS avance',   'dig github.com A',     'linux', 'Requete DNS detaillee'),
      _Cmd('Firewall (Linux)',  'ufw status verbose',   'linux', 'Etat du pare-feu UFW'),
      _Cmd('Firewall (Win)',    'Get-NetFirewallRule | Where Enabled -EQ True | Select DisplayName', 'win', 'Regles actives'),
    ]),
    _CmdCat(icon: Icons.security, color: Color(0xFFEF4444), label: 'Securite', cmds: [
      _Cmd('Connexions actives', 'ss -tnp',             'linux', 'Connexions TCP etablies + PID'),
      _Cmd('Historique connexions', 'last',             'linux', 'Historique des connexions SSH/login'),
      _Cmd('Echecs auth',       'journalctl -u ssh --since today | grep Failed', 'linux', 'Tentatives de connexion ratees'),
      _Cmd('Permissions fichier', 'ls -la /etc/ssh/',  'linux', 'Verifier les droits sur les cles SSH'),
      _Cmd('Fichiers SUID',     'find / -perm -4000 2>/dev/null', 'linux', 'Fichiers avec privilege eleve'),
      _Cmd('Scanner ports local', 'nmap -sV localhost', 'both', 'Ports ouverts sur la machine locale'),
      _Cmd('Audit npm',         'npm audit',            'both',  'Vulnerabilites dans les dependances Node'),
      _Cmd('Audit pip',         'pip install safety && safety check', 'linux', 'Securite des packages Python'),
      _Cmd('Logs echecs Win',   'Get-EventLog -LogName Security -InstanceId 4625 -Newest 20', 'win', 'Echecs de connexion Windows'),
    ]),
    _CmdCat(icon: Icons.storage, color: Color(0xFF8B5CF6), label: 'Docker & Conteneurs', cmds: [
      _Cmd('Version Docker',    'docker --version',               'both', 'Version installee de Docker'),
      _Cmd('Info Docker',       'docker info',                    'both', 'Ressources, drivers, configuration'),
      _Cmd('Conteneurs actifs', 'docker ps',                      'both', 'Conteneurs en cours d\'execution'),
      _Cmd('Tous conteneurs',   'docker ps -a',                   'both', 'Y compris les arretes'),
      _Cmd('Images locales',    'docker images',                  'both', 'Images telechargees'),
      _Cmd('Logs conteneur',    'docker logs -f <nom>',           'both', 'Logs en temps reel'),
      _Cmd('Stats ressources',  'docker stats',                   'both', 'CPU, RAM, reseau en temps reel'),
      _Cmd('Inspecter conteneur','docker inspect <nom>',          'both', 'Configuration complete en JSON'),
      _Cmd('Shell conteneur',   'docker exec -it <nom> sh',       'both', 'Terminal interactif dans le conteneur'),
      _Cmd('Nettoyer tout',     'docker system prune -af',        'both', 'Supprimer conteneurs/images inutilises'),
    ]),
    _CmdCat(icon: Icons.smart_toy, color: Color(0xFF6C3DE8), label: 'Ollama & IA locale', cmds: [
      _Cmd('Demarrer Ollama',   'ollama serve',                   'both', 'Lancer le serveur Ollama'),
      _Cmd('Lister modeles',    'ollama list',                    'both', 'Modeles installes localement'),
      _Cmd('Modeles actifs',    'ollama ps',                      'both', 'Modeles charges en memoire'),
      _Cmd('Telecharger modele','ollama pull phi3',               'both', 'phi3 = rapide (2.3GB), llama3.2 = bon'),
      _Cmd('Tester un modele',  'ollama run phi3 "Dis bonjour"',  'both', 'Test rapide depuis le terminal'),
      _Cmd('Supprimer modele',  'ollama rm phi3',                 'both', 'Liberer de l\'espace'),
      _Cmd('API Ollama',        'curl http://localhost:11434/api/tags', 'linux', 'Lister les modeles via API REST'),
      _Cmd('Version Ollama',    'ollama --version',               'both', 'Version installee'),
      _Cmd('Logs Ollama',       'journalctl -u ollama -f',        'linux', 'Logs du service Ollama'),
    ]),
    _CmdCat(icon: Icons.build, color: Color(0xFF06B6D4), label: 'Logs & Diagnostic', cmds: [
      _Cmd('Logs systeme',      'journalctl -xef',                'linux', 'Logs systemd en temps reel'),
      _Cmd('Logs kernel',       'dmesg | tail -50',               'linux', 'Messages du noyau (USB, drivers...)'),
      _Cmd('Logs nginx',        'tail -f /var/log/nginx/error.log','linux', 'Erreurs nginx en direct'),
      _Cmd('Logs SSH',          'journalctl -u ssh -n 100',       'linux', 'Derniers 100 evenements SSH'),
      _Cmd('Chercher dans logs','grep -r "ERROR" /var/log/',      'linux', 'Chercher ERROR dans tous les logs'),
      _Cmd('Logs Win EventViewer', 'eventvwr.msc',                'win',   'Ouvre l\'observateur d\'evenements'),
      _Cmd('Logs Win PS',       'Get-EventLog -LogName Application -Newest 50', 'win', '50 derniers evenements app'),
      _Cmd('Erreurs systeme Win','Get-WinEvent -LogName System -MaxEvents 20 | Where LevelDisplayName -EQ Error', 'win', 'Erreurs systeme recentes'),
    ]),
  ];

  Widget _buildCommandsRef(BuildContext context) {
    return ListView.builder(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 20)),
      itemCount: _kCmds.length,
      itemBuilder: (context, i) => _buildCmdCat(context, _kCmds[i]),
    );
  }

  Widget _buildCmdCat(BuildContext context, _CmdCat cat) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: EdgeInsets.only(
          bottom: TdcAdaptive.space(context, 12), 
          top: TdcAdaptive.space(context, 8)),
        child: Row(children: [
          Container(
            padding: EdgeInsets.all(TdcAdaptive.padding(context, 6)),
            decoration: BoxDecoration(color: cat.color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(cat.icon, color: cat.color, size: TdcAdaptive.icon(context, 16)),
          ),
          SizedBox(width: TdcAdaptive.space(context, 10)),
          Text(cat.label, 
            style: TextStyle(
              color: cat.color, 
              fontWeight: FontWeight.bold, 
              fontSize: TdcText.bodySmall(context))),
          SizedBox(width: TdcAdaptive.space(context, 8)),
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, 7), 
              vertical: TdcAdaptive.padding(context, 2)),
            decoration: BoxDecoration(color: cat.color.withOpacity(0.08), borderRadius: BorderRadius.circular(4)),
            child: Text('${cat.cmds.length}', 
              style: TextStyle(color: cat.color, fontSize: TdcText.label(context), fontWeight: FontWeight.bold)),
          ),
        ]),
      ),
      ...cat.cmds.map((cmd) => _buildCmdTile(context, cmd, cat.color)),
      SizedBox(height: TdcAdaptive.space(context, 8)),
    ]);
  }

  Widget _buildCmdTile(BuildContext context, _Cmd cmd, Color catColor) {
    Color platformColor;
    String platformLabel;
    switch (cmd.platform) {
      case 'linux': platformColor = const Color(0xFF10B981); platformLabel = 'Linux'; break;
      case 'win':   platformColor = const Color(0xFF3B82F6); platformLabel = 'Windows'; break;
      default:      platformColor = const Color(0xFF8B5CF6); platformLabel = 'Les deux';
    }

    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 8)),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10)),
        border: Border.all(color: TdcColors.border),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            import_c_o_p_y(cmd.command, context);
          },
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, 14), 
              vertical: TdcAdaptive.padding(context, 10)),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Text(cmd.label, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.label(context))),
                  SizedBox(width: TdcAdaptive.space(context, 8)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(color: platformColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                    child: Text(platformLabel, 
                      style: TextStyle(
                        color: platformColor, 
                        fontSize: TdcText.scale(context, 9), 
                        fontWeight: FontWeight.bold)),
                  ),
                ]),
                SizedBox(height: TdcAdaptive.space(context, 4)),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: TdcAdaptive.padding(context, 10), 
                    vertical: TdcAdaptive.padding(context, 5)),
                  decoration: BoxDecoration(color: const Color(0xFF0D0D14), borderRadius: BorderRadius.circular(6)),
                  child: Text(cmd.command, 
                    style: TextStyle(
                      fontFamily: 'Courier New', 
                      fontSize: TdcText.bodySmall(context), 
                      color: const Color(0xFFA5F3FC))),
                ),
                SizedBox(height: TdcAdaptive.space(context, 4)),
                Text(cmd.description, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
              ])),
              SizedBox(width: TdcAdaptive.space(context, 12)),
              _CopyButton(text: cmd.command),
            ]),
          ),
        ),
      ),
    );
  }

  void import_c_o_p_y(String text, BuildContext ctx) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
      content: const Text('Commande copiee!'),
      backgroundColor: TdcColors.surface,
      duration: const Duration(seconds: 1),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ));
  }
  void import_flutter_c_o_p_y(String text, BuildContext ctx) {}
}

// Helper pour copier avec feedback
class _CopyButton extends StatefulWidget {
  final String text;
  const _CopyButton({required this.text});
  @override State<_CopyButton> createState() => _CopyButtonState();
}
class _CopyButtonState extends State<_CopyButton> {
  bool _copied = false;
  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.text));
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _copy,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, 10), 
          vertical: TdcAdaptive.padding(context, 6)),
        decoration: BoxDecoration(
          color: _copied ? TdcColors.success.withOpacity(0.1) : TdcColors.surfaceAlt,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: _copied ? TdcColors.success.withOpacity(0.3) : TdcColors.border),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(_copied ? Icons.check : Icons.copy, size: TdcAdaptive.icon(context, 13), color: _copied ? TdcColors.success : TdcColors.textMuted),
          SizedBox(width: TdcAdaptive.space(context, 4)),
          Text(_copied ? 'Copié!' : 'Copier', 
            style: TextStyle(
              color: _copied ? TdcColors.success : TdcColors.textMuted, 
              fontSize: TdcText.label(context))),
        ]),
      ),
    );
  }
}

// ─── Data classes ─────────────────────────────────────────────────────────────
class _CmdCat {
  final IconData icon;
  final Color color;
  final String label;
  final List<_Cmd> cmds;
  const _CmdCat({required this.icon, required this.color, required this.label, required this.cmds});
}

class _Cmd {
  final String label;
  final String command;
  final String platform; // 'linux', 'win', 'both'
  final String description;
  const _Cmd(this.label, this.command, this.platform, this.description);
}

