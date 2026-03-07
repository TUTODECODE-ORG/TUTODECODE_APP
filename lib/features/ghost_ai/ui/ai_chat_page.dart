import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../service/ollama_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/premium_ui.dart';
import '../../../core/responsive/responsive.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glass_kit/glass_kit.dart';

// ─── Prompt système ──────────────────────────────────────────────────────────
const _kSystem = '''Tu es Ghost, assistant technique de TutoDeCode. Regles strictes :
- Reponds en francais, TOUJOURS court et direct (3-5 lignes max pour une question simple)
- PAS d\'introduction, PAS de recapitulatif, PAS de "Bien sur !"
- Va droit au but : reponds uniquement a ce qui est demande
- Code uniquement si la question porte sur du code, sinon texte simple
- Si la reponse necessite un exemple, 1 seul exemple concis suffit
- Jamais de listes a puces si une phrase suffit''';

// ─── Page principale ─────────────────────────────────────────────────────────
class AIChatPage extends StatefulWidget {
  const AIChatPage({super.key});
  @override State<AIChatPage> createState() => _AIChatPageState();
}

class _AIChatPageState extends State<AIChatPage> with TickerProviderStateMixin {
  final _inputCtrl    = TextEditingController();
  final _scrollCtrl   = ScrollController();
  final _inputFocus   = FocusNode();
  final List<_Msg>    _msgs    = [];

  OllamaStatus? _status;
  String?       _model;
  bool          _checking = true;
  bool          _streaming = false;
  StreamSubscription? _sub;

  late final AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
    _init();
  }

  @override
  void dispose() {
    _sub?.cancel();
    _pulseCtrl.dispose();
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    _inputFocus.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    final s = await OllamaService.checkStatus();
    if (!mounted) return;
    setState(() {
      _status   = s;
      _checking = false;
      if (s.running && s.models.isNotEmpty) _model = s.models.first;
    });
  }

  void _scrollBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _inputCtrl.text.trim();
    if (text.isEmpty || _streaming || _model == null) return;

    _inputCtrl.clear();
    _inputFocus.requestFocus();

    setState(() {
      _msgs.add(_Msg(role: 'user', text: text));
      // Message IA vide — sera rempli au fil du stream
      _msgs.add(_Msg(role: 'assistant', text: ''));
      _streaming = true;
    });
    _scrollBottom();

    // Construire l'historique sans le dernier message vide
    final history = _msgs
        .where((m) => m.role != 'error' && m.text.isNotEmpty)
        .map((m) => {'role': m.role, 'content': m.text})
        .toList(growable: false);

    try {
      _sub = OllamaService.stream(_model!, history, system: _kSystem).listen(
        (chunk) {
          if (!mounted) return;
          setState(() {
            final last = _msgs.last;
            if (chunk.isThinking) {
              // Stocker le thinking séparément
              _msgs[_msgs.length - 1] = last.withThinking(last.thinking + chunk.text);
            } else {
              _msgs[_msgs.length - 1] = last.withText(last.text + chunk.text);
            }
          });
          _scrollBottom();
        },
        onDone: () {
          if (!mounted) return;
          // Si la réponse est vide mais thinking non-vide → extraire la réponse du thinking
          final last = _msgs.isNotEmpty ? _msgs.last : null;
          if (last != null && last.role == 'assistant' && last.text.isEmpty && last.thinking.isNotEmpty) {
            // Fallback : utiliser le thinking comme réponse
            setState(() {
              _msgs[_msgs.length - 1] = _Msg(
                role: 'assistant',
                text: last.thinking,
                thinking: '',
              );
            });
          }
          setState(() => _streaming = false);
        },
        onError: (e) {
          if (!mounted) return;
          setState(() {
            _msgs[_msgs.length - 1] = _Msg(
              role: 'error',
              text: '**Erreur de connexion Ollama**\n\n```\n${e.toString()}\n```\n\nSolutions :\n- Lancez Ollama : `ollama serve`\n- Vérifiez le modèle : `ollama list`',
            );
            _streaming = false;
          });
        },
        cancelOnError: true,
      );
    } catch (e) {
      setState(() {
        _msgs[_msgs.length - 1] = _Msg(role: 'error', text: '**Erreur :** ${e.toString()}');
        _streaming = false;
      });
    }
  }

  void _stop() {
    _sub?.cancel();
    setState(() => _streaming = false);
  }

  void _clear() => setState(() => _msgs.clear());

  @override
  Widget build(BuildContext context) {
    // Récupérer le contexte optionnel passé en argument
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final courseContent = args?['content'] as String?;
    final courseTitle   = args?['title'] as String?;

    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: TdcPremium.animatedBackground(
        child: Column(children: [
          _buildHeader(context, title: courseTitle),
          if (_checking) LinearProgressIndicator(color: TdcColors.accent, backgroundColor: TdcColors.surfaceAlt, minHeight: 1),
          if (courseTitle != null) _buildContextBadge(context, courseTitle),
          Expanded(child: _msgs.isEmpty ? _buildEmpty(context) : _buildMessages(context)),
          if (_streaming) _buildStreamingBar(context),
          _buildInput(context, contextData: courseContent),
        ]),
      ),
    );
  }

  Widget _buildContextBadge(BuildContext context, String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: TdcColors.accent.withOpacity(0.1),
      child: Row(children: [
        Icon(Icons.auto_stories, size: 14, color: TdcColors.accent),
        const SizedBox(width: 8),
        Text('FOCUS SUR : ', style: TextStyle(color: TdcColors.accent, fontSize: 10, fontWeight: FontWeight.bold)),
        Expanded(child: Text(title, style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 10, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
      ]),
    );
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  Widget _buildHeader(BuildContext context) {
    final running = _status?.running ?? false;
    return Container(
      padding: EdgeInsets.fromLTRB(
        TdcAdaptive.padding(context, 16), 
        TdcAdaptive.padding(context, 20), 
        TdcAdaptive.padding(context, 16), 
        TdcAdaptive.padding(context, 16)),
      decoration: BoxDecoration(
        color: TdcColors.surface.withOpacity(0.5),
        border: Border(bottom: BorderSide(color: TdcColors.border.withOpacity(0.3))),
      ),
      child: Row(children: [
        // Back
        _iconBtn(context, Icons.arrow_back_ios_new, () => Navigator.pop(context), size: TdcAdaptive.icon(context, 18)),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        // Avatar IA
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [TdcColors.accent, TdcColors.info],
              begin: Alignment.topLeft, end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: TdcColors.accent.withOpacity(0.3), blurRadius: 10)],
          ),
          child: Icon(Icons.auto_awesome, color: Colors.white, size: 18),
        ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 3.seconds),
        SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('GHOST AI', 
            style: TextStyle(
              color: Colors.white, 
              fontWeight: FontWeight.black, 
              letterSpacing: 1,
              fontSize: 14)),
          Row(children: [
            Container(
              width: 6, 
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: running ? TdcColors.success : TdcColors.danger,
                boxShadow: [BoxShadow(
                  color: (running ? TdcColors.success : TdcColors.danger).withOpacity(0.5),
                  blurRadius: 4,
                )],
              ),
            ),
            SizedBox(width: 6),
            Text(
              running ? 'PROCESSUS ACTIF' : 'MOTEUR DÉCONNECTÉ',
              style: TextStyle(
                color: running ? TdcColors.success : TdcColors.danger,
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ]),
        ]),
        const Spacer(),
        // Sélecteur de modèle
        if (running && (_status?.models.isNotEmpty ?? false))
          _buildModelPicker(context),
        SizedBox(width: 8),
        if (_msgs.isNotEmpty) _iconBtn(context, Icons.delete_sweep_outlined, _clear, tooltip: 'Effacer'),
      ]),
    );
  }

  Widget _buildModelPicker(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 12), 
        vertical: TdcAdaptive.padding(context, 6)),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E30),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: TdcColors.border.withOpacity(0.5)),
      ),
      child: DropdownButton<String>(
        value: _model,
        items: _status!.models.map((m) => DropdownMenuItem(
          value: m,
          child: Text(m.split(':').first, style: TextStyle(color: Colors.white, fontSize: TdcText.bodySmall(context))),
        )).toList(),
        onChanged: (v) => setState(() => _model = v),
        dropdownColor: const Color(0xFF1E1E30),
        underline: const SizedBox(),
        isDense: true,
        icon: Icon(Icons.keyboard_arrow_down, color: Colors.white54, size: TdcAdaptive.icon(context, 18)),
      ),
    );
  }

  Widget _iconBtn(BuildContext context, IconData icon, VoidCallback onTap, {String? tooltip, double? size}) {
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 8)),
          child: Icon(icon, color: Colors.white54, size: size ?? TdcAdaptive.icon(context, 20)),
        ),
      ),
    );
  }

  // ─── État vide ─────────────────────────────────────────────────────────────
  Widget _buildEmpty(BuildContext context) {
    final suggestions = [
      ['🐧', 'Explique les permissions Linux (chmod)'],
      ['🐳', 'Différence entre Docker image et conteneur ?'],
      ['🔐', 'Comment fonctionne JWT step by step ?'],
      ['🗄️', 'Montre-moi un SQL JOIN avec exemple concret'],
      ['🐍', 'C\'est quoi une list comprehension Python ?'],
      ['⚡', 'async/await JavaScript en 5 lignes'],
    ];

    return Center(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(TdcAdaptive.padding(context, 32)),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          // Logo animé
          AnimatedBuilder(
            animation: _pulseCtrl,
            builder: (_, __) => Container(
              width: TdcAdaptive.space(context, 80), 
              height: TdcAdaptive.space(context, 80),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF6C3DE8), Color(0xFF3D1CB3)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                boxShadow: [BoxShadow(
                  color: const Color(0xFF6C3DE8).withOpacity(0.2 + _pulseCtrl.value * 0.3),
                  blurRadius: 20 + _pulseCtrl.value * 15,
                  spreadRadius: 2,
                )],
              ),
              child: Icon(Icons.auto_awesome, color: Colors.white, size: TdcAdaptive.icon(context, 36)),
            ),
          ),
          SizedBox(height: TdcAdaptive.space(context, 24)),
          Text(
            'Ghost AI',
            style: TextStyle(
              color: Colors.white, 
              fontSize: TdcText.h1(context), 
              fontWeight: FontWeight.bold, 
              letterSpacing: -0.5),
          ),
          SizedBox(height: TdcAdaptive.space(context, 8)),
          Text(
            _status?.running == true
                ? 'Modèle : ${_model ?? "aucun"}'
                : 'Lancez Ollama pour commencer',
            style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: TdcText.body(context)),
          ),
          SizedBox(height: TdcAdaptive.space(context, 40)),
          if (_status?.running == true) ...[
            Wrap(
              spacing: TdcAdaptive.space(context, 12), 
              runSpacing: TdcAdaptive.space(context, 12),
              alignment: WrapAlignment.center,
              children: suggestions.map((s) => _buildSuggestion(context, s[0], s[1])).toList(),
            ),
          ] else
            OutlinedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/ai-config'),
              icon: const Icon(Icons.settings),
              label: Text('Configurer Ollama', style: TextStyle(fontSize: TdcText.button(context))),
              style: OutlinedButton.styleFrom(
                foregroundColor: TdcColors.accent,
                side: BorderSide(color: TdcColors.accent.withOpacity(0.5)),
                padding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 24), 
                  vertical: TdcAdaptive.padding(context, 12)),
              ),
            ),
        ]),
      ),
    );
  }

  Widget _buildSuggestion(BuildContext context, String emoji, String text) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          _inputCtrl.text = text;
          _send();
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: TdcAdaptive.space(context, 260),
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 16), 
            vertical: TdcAdaptive.padding(context, 12)),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A28),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Row(children: [
            Text(emoji, style: TextStyle(fontSize: TdcText.h3(context))),
            SizedBox(width: TdcAdaptive.space(context, 12)),
            Expanded(
              child: Text(text, 
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7), 
                  fontSize: TdcText.bodySmall(context))),
            ),
            Icon(Icons.arrow_forward_ios, size: TdcAdaptive.icon(context, 12), color: Colors.white.withOpacity(0.2)),
          ]),
        ),
      ),
    );
  }

  // ─── Liste des messages ────────────────────────────────────────────────────
  Widget _buildMessages(BuildContext context) {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 24), 
        vertical: TdcAdaptive.padding(context, 20)),
      itemCount: _msgs.length,
      itemBuilder: (_, i) => _buildMessage(context, _msgs[i]),
    );
  }

  Widget _buildMessage(BuildContext context, _Msg msg) {
    final isUser  = msg.role == 'user';
    final isError = msg.role == 'error';

    if (isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * (TdcBreakpoints.isTablet(context) ? 0.5 : 0.75)),
          margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 20)),
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 18), 
            vertical: TdcAdaptive.padding(context, 12)),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF6C3DE8), Color(0xFF4A23C8)],
              begin: Alignment.topLeft, end: Alignment.bottomRight,
            ),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(18), topRight: Radius.circular(18),
              bottomLeft: Radius.circular(18), bottomRight: Radius.circular(4),
            ),
            boxShadow: [BoxShadow(color: const Color(0xFF6C3DE8).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
          ),
          child: Text(msg.text, 
            style: TextStyle(
              color: Colors.white, 
              fontSize: TdcText.body(context), 
              height: 1.5)),
        ),
      );
    }

    // Message IA ou erreur
    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 24)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          Container(
            width: TdcAdaptive.icon(context, 32), 
            height: TdcAdaptive.icon(context, 32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isError
                    ? [const Color(0xFFEF4444), const Color(0xFFB91C1C)]
                    : [const Color(0xFF6C3DE8), const Color(0xFF3D1CB3)],
                begin: Alignment.topLeft, end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(isError ? Icons.error_outline : Icons.auto_awesome, color: Colors.white, size: TdcAdaptive.icon(context, 16)),
          ),
          SizedBox(width: TdcAdaptive.space(context, 12)),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                isError ? 'Erreur' : 'Ghost AI',
                style: TextStyle(
                  color: isError ? const Color(0xFFEF4444) : TdcColors.accent,
                  fontSize: TdcText.caption(context), 
                  fontWeight: FontWeight.bold, 
                  letterSpacing: 0.5,
                ),
              ),
              SizedBox(height: TdcAdaptive.space(context, 6)),

              // Bloc de réflexion (thinking) — collapsible
              if (msg.thinking.isNotEmpty) _buildThinkingBlock(context, msg.thinking),

              // Contenu principal
              _buildAIContent(context, msg.text, isError: isError),

              // Actions
              if (!isError && msg.text.isNotEmpty)
                Padding(
                  padding: EdgeInsets.only(top: TdcAdaptive.space(context, 8)),
                  child: Row(children: [
                    _copyBtn(context, msg.text),
                    SizedBox(width: TdcAdaptive.space(context, 8)),
                  ]),
                ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildThinkingBlock(BuildContext context, String thinking) {
    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 10)),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A28),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF6C3DE8).withOpacity(0.2)),
      ),
      child: ExpansionTile(
        tilePadding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, 14), 
          vertical: TdcAdaptive.padding(context, 2)),
        childrenPadding: EdgeInsets.fromLTRB(
          TdcAdaptive.padding(context, 14), 
          0, 
          TdcAdaptive.padding(context, 14), 
          TdcAdaptive.padding(context, 12)),
        leading: Icon(Icons.psychology, color: const Color(0xFF8B5CF6), size: TdcAdaptive.icon(context, 18)),
        title: Text('🧠 Réflexion interne', 
          style: TextStyle(
            color: const Color(0xFF8B5CF6), 
            fontSize: TdcText.caption(context), 
            fontWeight: FontWeight.bold)),
        iconColor: const Color(0xFF8B5CF6),
        collapsedIconColor: const Color(0xFF8B5CF6),
        children: [
          Text(
            thinking,
            style: TextStyle(
              color: Colors.white.withOpacity(0.45), 
              fontSize: TdcText.bodySmall(context), 
              height: 1.6, 
              fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }

  Widget _buildAIContent(BuildContext context, String text, {bool isError = false}) {
    if (text.isEmpty) {
      // Message vide en cours de streaming — curseur clignotant
      return AnimatedBuilder(
        animation: _pulseCtrl,
        builder: (_, __) => Container(
          width: TdcAdaptive.space(context, 10), 
          height: TdcAdaptive.space(context, 18),
          decoration: BoxDecoration(
            color: TdcColors.accent.withOpacity(0.3 + _pulseCtrl.value * 0.6),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      );
    }

    // Rendu simple avec coloration des blocs de code
    return _SimpleMarkdown(text: text, isError: isError);
  }

  Widget _copyBtn(BuildContext context, String text) {
    return InkWell(
      onTap: () {
        Clipboard.setData(ClipboardData(text: text));
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Copié !', style: TextStyle(color: Colors.white, fontSize: TdcText.bodySmall(context))),
          backgroundColor: const Color(0xFF1E1E30),
          duration: const Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ));
      },
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, 10), 
          vertical: TdcAdaptive.padding(context, 5)),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E30),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.copy, size: TdcAdaptive.icon(context, 12), color: Colors.white38),
          SizedBox(width: TdcAdaptive.space(context, 5)),
          Text('Copier', 
            style: TextStyle(
              color: Colors.white38, 
              fontSize: TdcText.label(context))),
        ]),
      ),
    );
  }

  // ─── Barre de streaming ─────────────────────────────────────────────────────
  Widget _buildStreamingBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, 24), 
        vertical: TdcAdaptive.padding(context, 10)),
      color: const Color(0xFF0D0D14),
      child: Row(children: [
        AnimatedBuilder(
          animation: _pulseCtrl,
          builder: (_, __) => Row(children: List.generate(3, (i) {
            final delay = i * 0.3;
            final val = (((_pulseCtrl.value + delay) % 1.0));
            return Container(
              margin: EdgeInsets.only(right: TdcAdaptive.space(context, 4)),
              width: TdcAdaptive.space(context, 6), 
              height: TdcAdaptive.space(context, 6),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: TdcColors.accent.withOpacity(0.3 + val * 0.7),
              ),
            );
          })),
        ),
        SizedBox(width: TdcAdaptive.space(context, 10)),
        Text('Ghost AI génère…', 
          style: TextStyle(
            color: Colors.white.withOpacity(0.4), 
            fontSize: TdcText.caption(context))),
        const Spacer(),
        InkWell(
          onTap: _stop,
          borderRadius: BorderRadius.circular(6),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, 12), 
              vertical: TdcAdaptive.padding(context, 5)),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E30),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.stop_circle_outlined, size: TdcAdaptive.icon(context, 14), color: Colors.white38),
              SizedBox(width: TdcAdaptive.space(context, 5)),
              Text('Arrêter', 
                style: TextStyle(
                  color: Colors.white38, 
                  fontSize: TdcText.caption(context))),
            ]),
          ),
        ),
      ]),
    );
  }

  // ─── Zone de saisie ────────────────────────────────────────────────────────
  Widget _buildInput(BuildContext context) {
    final canSend = (_status?.running == true) && (_model != null) && !_streaming;
    return Container(
      padding: EdgeInsets.fromLTRB(
        TdcAdaptive.padding(context, 16), 
        TdcAdaptive.padding(context, 10), 
        TdcAdaptive.padding(context, 16), 
        TdcAdaptive.padding(context, 16)),
      decoration: BoxDecoration(
        color: const Color(0xFF13131F),
        border: Border(top: BorderSide(color: TdcColors.border.withOpacity(0.3))),
      ),
      child: Row(children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A28),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: canSend ? TdcColors.accent.withOpacity(0.2) : Colors.white.withOpacity(0.06)),
            ),
            child: TextField(
              controller: _inputCtrl,
              focusNode: _inputFocus,
              enabled: canSend,
              maxLines: null,
              onSubmitted: (_) => _send(),
              style: TextStyle(color: Colors.white, fontSize: TdcText.body(context)),
              textInputAction: TextInputAction.send,
              decoration: InputDecoration(
                hintText: canSend ? 'Posez votre question…' : 'Configurez Ollama pour commencer',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: TdcText.body(context)),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 18), 
                  vertical: TdcAdaptive.padding(context, 14)),
              ),
            ),
          ),
        ),
        SizedBox(width: TdcAdaptive.space(context, 10)),
        InkWell(
          onTap: canSend ? _send : null,
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: TdcAdaptive.space(context, 46), 
            height: TdcAdaptive.space(context, 46),
            decoration: BoxDecoration(
              gradient: canSend
                  ? const LinearGradient(colors: [Color(0xFF6C3DE8), Color(0xFF3D1CB3)], begin: Alignment.topLeft, end: Alignment.bottomRight)
                  : null,
              color: canSend ? null : const Color(0xFF1A1A28),
              borderRadius: BorderRadius.circular(12),
              boxShadow: canSend ? [BoxShadow(color: const Color(0xFF6C3DE8).withOpacity(0.4), blurRadius: 10)] : null,
            ),
            child: Icon(Icons.send_rounded, color: canSend ? Colors.white : Colors.white24, size: TdcAdaptive.icon(context, 20)),
          ),
        ),
      ]),
    );
  }
}

// ─── Rendu Markdown simplifié ─────────────────────────────────────────────────
class _SimpleMarkdown extends StatelessWidget {
  final String text;
  final bool isError;
  const _SimpleMarkdown({required this.text, this.isError = false});

  @override
  Widget build(BuildContext context) {
    final segments = _parse(text);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: segments.map((s) => _buildSegment(context, s)).toList(),
    );
  }

  List<_Segment> _parse(String text) {
    final segs = <_Segment>[];
    final re = RegExp(r'```(\w*)\n?([\s\S]*?)```', multiLine: true);
    var last = 0;
    for (final m in re.allMatches(text)) {
      if (m.start > last) segs.add(_Segment(text.substring(last, m.start), false, null));
      segs.add(_Segment(m.group(2) ?? '', true, m.group(1)));
      last = m.end;
    }
    if (last < text.length) segs.add(_Segment(text.substring(last), false, null));
    return segs;
  }

  Widget _buildSegment(BuildContext context, _Segment s) {
    if (s.isCode) {
      return _CodeBlock(code: s.text.trim(), lang: s.lang ?? '');
    }
    return Padding(
      padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 4)),
      child: _buildInlineText(context, s.text),
    );
  }

  Widget _buildInlineText(BuildContext context, String text) {
    // Rendu simple : gras, italique, titres, listes
    final lines = text.split('\n');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) {
        if (line.startsWith('### ')) {
          return Padding(
            padding: EdgeInsets.only(
              top: TdcAdaptive.space(context, 12), 
              bottom: TdcAdaptive.space(context, 4)),
            child: Text(line.substring(4), 
              style: TextStyle(
                color: Colors.white, 
                fontSize: TdcText.h3(context), 
                fontWeight: FontWeight.bold)));
        }
        if (line.startsWith('## ')) {
          return Padding(
            padding: EdgeInsets.only(
              top: TdcAdaptive.space(context, 14), 
              bottom: TdcAdaptive.space(context, 6)),
            child: Text(line.substring(3), 
              style: TextStyle(
                color: Colors.white, 
                fontSize: TdcText.h2(context), 
                fontWeight: FontWeight.bold)));
        }
        if (line.startsWith('# ')) {
          return Padding(
            padding: EdgeInsets.only(
              top: TdcAdaptive.space(context, 16), 
              bottom: TdcAdaptive.space(context, 8)),
            child: Text(line.substring(2), 
              style: TextStyle(
                color: Colors.white, 
                fontSize: TdcText.h1(context), 
                fontWeight: FontWeight.bold)));
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return Padding(
            padding: EdgeInsets.only(
              left: TdcAdaptive.padding(context, 8), 
              top: TdcAdaptive.padding(context, 2)),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Padding(
                padding: EdgeInsets.only(top: TdcAdaptive.padding(context, 6)), 
                child: Icon(Icons.circle, size: TdcAdaptive.space(context, 5), color: const Color(0xFF8B5CF6))),
              SizedBox(width: TdcAdaptive.space(context, 8)),
              Expanded(child: _richText(context, line.substring(2))),
            ]),
          );
        }
        if (line.trim().isEmpty) return SizedBox(height: TdcAdaptive.space(context, 6));
        return Padding(
          padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 2)), 
          child: _richText(context, line));
      }).toList(),
    );
  }

  Widget _richText(BuildContext context, String text) {
    // Gras : **text**
    final spans = <TextSpan>[];
    final re = RegExp(r'\*\*(.+?)\*\*|`(.+?)`');
    var last = 0;
    for (final m in re.allMatches(text)) {
      if (m.start > last) spans.add(TextSpan(text: text.substring(last, m.start)));
      if (m.group(1) != null) {
        spans.add(TextSpan(text: m.group(1), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)));
      } else {
        spans.add(TextSpan(
          text: m.group(2),
          style: TextStyle(
            fontFamily: 'monospace', color: const Color(0xFFF59E0B),
            backgroundColor: const Color(0xFF1E1E30), fontSize: TdcText.bodySmall(context),
          ),
        ));
      }
      last = m.end;
    }
    if (last < text.length) spans.add(TextSpan(text: text.substring(last)));
    return RichText(
      text: TextSpan(
        style: TextStyle(
          color: isError ? const Color(0xFFEF4444) : Colors.white.withOpacity(0.85), 
          fontSize: TdcText.body(context), 
          height: 1.6),
        children: spans,
      ),
    );
  }
}

class _Segment {
  final String text;
  final bool isCode;
  final String? lang;
  _Segment(this.text, this.isCode, this.lang);
}

// ─── Bloc de code avec copie ──────────────────────────────────────────────────
class _CodeBlock extends StatefulWidget {
  final String code;
  final String lang;
  const _CodeBlock({required this.code, required this.lang});
  @override State<_CodeBlock> createState() => _CodeBlockState();
}
class _CodeBlockState extends State<_CodeBlock> {
  bool _copied = false;

  Future<void> _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.code));
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: TdcAdaptive.space(context, 10)),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D14),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(children: [
        // En-tête
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 14), 
            vertical: TdcAdaptive.padding(context, 8)),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A28),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.06))),
          ),
          child: Row(children: [
            if (widget.lang.isNotEmpty) ...[
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 8), 
                  vertical: TdcAdaptive.padding(context, 2)),
                decoration: BoxDecoration(
                  color: const Color(0xFF6C3DE8).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(widget.lang, 
                  style: TextStyle(
                    color: const Color(0xFF8B5CF6), 
                    fontSize: TdcText.label(context), 
                    fontWeight: FontWeight.bold)),
              ),
            ] else
              Icon(Icons.code, color: Colors.white24, size: TdcAdaptive.icon(context, 14)),
            const Spacer(),
            InkWell(
              onTap: _copy,
              borderRadius: BorderRadius.circular(6),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: _copied
                    ? Row(key: const ValueKey('ok'), mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.check, size: TdcAdaptive.icon(context, 13), color: const Color(0xFF10B981)),
                        SizedBox(width: TdcAdaptive.space(context, 4)),
                        Text('Copié !', style: TextStyle(color: const Color(0xFF10B981), fontSize: TdcText.label(context))),
                      ])
                    : Row(key: const ValueKey('copy'), mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.copy, size: TdcAdaptive.icon(context, 13), color: Colors.white.withOpacity(0.3)),
                        SizedBox(width: TdcAdaptive.space(context, 4)),
                        Text('Copier', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: TdcText.label(context))),
                      ]),
              ),
            ),
          ]),
        ),
        // Code
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
          child: SelectableText(
            widget.code,
            style: TextStyle(
              fontFamily: 'Courier New',
              fontSize: TdcText.bodySmall(context), 
              color: const Color(0xFFE2E8F0),
              height: 1.6, 
              letterSpacing: 0.3,
            ),
          ),
        ),
      ]),
    );
  }
}

// ─── Modèle de message ─────────────────────────────────────────────────────────
class _Msg {
  final String role;
  final String text;
  final String thinking;
  const _Msg({required this.role, required this.text, this.thinking = ''});
  _Msg withText(String t) => _Msg(role: role, text: t, thinking: thinking);
  _Msg withThinking(String t) => _Msg(role: role, text: text, thinking: t);
}
