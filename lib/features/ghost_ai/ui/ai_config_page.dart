import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../service/ollama_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/responsive/responsive.dart';

class AIConfigPage extends StatefulWidget {
  const AIConfigPage({super.key});
  @override
  State<AIConfigPage> createState() => _AIConfigPageState();
}

class _AIConfigPageState extends State<AIConfigPage> {
  OllamaStatus? _status;
  bool _checking = false;
  String? _pullingModel;

  @override
  void initState() {
    super.initState();
    _checkOllama();
  }

  Future<void> _checkOllama() async {
    setState(() => _checking = true);
    final status = await OllamaService.checkStatus();
    setState(() {
      _status = status;
      _checking = false;
    });
  }

  void _copyCommand(String cmd) {
    Clipboard.setData(ClipboardData(text: cmd));
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Commande copiée !', style: TextStyle(color: TdcColors.textPrimary)),
      backgroundColor: TdcColors.surface,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: TdcRadius.md),
      duration: Duration(seconds: 1),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      appBar: AppBar(
        title: Text('Configuration IA Locale'),
        backgroundColor: TdcColors.bg,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: TdcColors.textSecondary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: _checking
                ? SizedBox(
                    width: TdcAdaptive.space(context, 18), 
                    height: TdcAdaptive.space(context, 18), 
                    child: CircularProgressIndicator(strokeWidth: 2, color: TdcColors.accent))
                : Icon(Icons.refresh, color: TdcColors.textSecondary, size: TdcAdaptive.icon(context, 20)),
            tooltip: 'Vérifier à nouveau',
            onPressed: _checking ? null : _checkOllama,
          ),
          SizedBox(width: TdcAdaptive.space(context, 8)),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.xl)),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: TdcAdaptive.space(context, 760)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Statut Ollama
                _buildStatusCard(context),
                SizedBox(height: TdcAdaptive.space(context, TdcSpacing.lg)),

                // ── Si Ollama est lancé : modèles installés
                if (_status?.running == true) ...[
                  _buildInstalledModels(context),
                  SizedBox(height: TdcAdaptive.space(context, TdcSpacing.lg)),
                ],

                // ── Modèles recommandés
                _buildRecommendedModels(context),
                SizedBox(height: TdcAdaptive.space(context, TdcSpacing.lg)),

                // ── Guide d'installation si absent
                if (_status?.running == false) ...[
                  _buildInstallGuide(context),
                  SizedBox(height: TdcAdaptive.space(context, TdcSpacing.lg)),
                ],

                // ── Commandes utiles
                _buildUsefulCommands(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Carte statut ───────────────────────────────────────────
  Widget _buildStatusCard(BuildContext context) {
    final isRunning = _status?.running ?? false;
    final color = _checking
        ? TdcColors.warning
        : (isRunning ? TdcColors.success : TdcColors.danger);
    final icon = _checking
        ? Icons.hourglass_top
        : (isRunning ? Icons.check_circle : Icons.cancel);
    final statusText = _checking
        ? 'Vérification en cours…'
        : (isRunning
            ? 'Ollama est en ligne  ${_status?.version != null ? "— v${_status!.version}" : ""}'
            : (_status?.error ?? 'Ollama n\'est pas détecté'));
    final subText = _checking
        ? 'Ping sur localhost:11434…'
        : (isRunning
            ? '${_status!.models.length} modèle(s) installé(s) · Port 11434'
            : 'Installez ou démarrez Ollama pour activer l\'IA locale');

    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.lg)),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: TdcRadius.lg,
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(TdcAdaptive.padding(context, 14)),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: TdcAdaptive.icon(context, 28)),
          ),
          SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(statusText, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: TdcText.bodyLarge(context))),
                SizedBox(height: TdcAdaptive.space(context, 4)),
                Text(subText, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context))),
              ],
            ),
          ),
          if (!_checking)
            OutlinedButton.icon(
              onPressed: _checkOllama,
              icon: Icon(Icons.refresh, size: TdcAdaptive.icon(context, 15)),
              label: Text('Rafraîchir', style: TextStyle(fontSize: TdcText.button(context))),
              style: OutlinedButton.styleFrom(
                foregroundColor: TdcColors.textSecondary,
                side: BorderSide(color: TdcColors.border),
                padding: EdgeInsets.symmetric(
                  horizontal: TdcAdaptive.padding(context, 14), 
                  vertical: TdcAdaptive.padding(context, 10)),
              ),
            ),
        ],
      ),
    );
  }

  // ── Modèles installés ──────────────────────────────────────
  Widget _buildInstalledModels(BuildContext context) {
    final models = _status?.models ?? [];
    return _buildSection(
      context: context,
      icon: Icons.inventory_2,
      title: 'Modèles installés',
      child: models.isEmpty
          ? _buildEmptyState('Aucun modèle installé.\nUtilisez `ollama pull <modèle>` pour en ajouter un.')
          : Column(
              children: models.map((m) => _buildModelRow(
                context: context,
                name: m,
                isInstalled: true,
                onAction: null,
              )).toList(),
            ),
    );
  }

  // ── Modèles recommandés ────────────────────────────────────
  Widget _buildRecommendedModels(BuildContext context) {
    return _buildSection(
      context: context,
      icon: Icons.auto_awesome,
      title: 'Modèles recommandés pour TutoDeCode',
      child: Column(
        children: kRecommendedModels.map((m) {
          final isInstalled = _status?.models.any((installed) =>
                  installed.startsWith(m['id']!)) ??
              false;
          final isPulling = _pullingModel == m['id'];
          return _buildRecommendedCard(context, m, isInstalled, isPulling);
        }).toList(),
      ),
    );
  }

  Widget _buildRecommendedCard(BuildContext context, Map<String, String> model, bool isInstalled, bool isPulling) {
    final pullCmd = 'ollama pull ${model['id']}';
    final isMobile = TdcBreakpoints.isMobile(context);
    
    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, TdcSpacing.sm)),
      padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.md)),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt,
        borderRadius: TdcRadius.md,
        border: Border.all(
          color: isInstalled ? TdcColors.success.withOpacity(0.3) : TdcColors.border,
        ),
      ),
      child: isMobile 
      ? Column(
          children: [
            Row(
              children: [
                _buildModelAvatar(context, isInstalled),
                SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
                Expanded(child: _buildModelInfo(context, model, isInstalled)),
              ],
            ),
            SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
            _buildModelAction(context, isInstalled, pullCmd),
          ],
        )
      : Row(
        children: [
          _buildModelAvatar(context, isInstalled),
          SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
          Expanded(child: _buildModelInfo(context, model, isInstalled)),
          SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
          _buildModelAction(context, isInstalled, pullCmd),
        ],
      ),
    );
  }

  Widget _buildModelAvatar(BuildContext context, bool isInstalled) {
    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 10)),
      decoration: BoxDecoration(
        color: isInstalled
            ? TdcColors.success.withOpacity(0.1)
            : TdcColors.accentDim,
        borderRadius: TdcRadius.sm,
      ),
      child: Icon(
        isInstalled ? Icons.check_circle : Icons.memory,
        color: isInstalled ? TdcColors.success : TdcColors.accent,
        size: TdcAdaptive.icon(context, 22),
      ),
    );
  }

  Widget _buildModelInfo(BuildContext context, Map<String, String> model, bool isInstalled) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: TdcAdaptive.space(context, 8),
          children: [
            Text(model['label']!, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: TdcText.body(context))),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(color: TdcColors.surface, borderRadius: BorderRadius.circular(4)),
              child: Text(model['size']!, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context), fontWeight: FontWeight.bold)),
            ),
            if (isInstalled)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(color: TdcColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Text('installé', style: TextStyle(color: TdcColors.success, fontSize: TdcText.label(context), fontWeight: FontWeight.bold)),
              ),
          ],
        ),
        SizedBox(height: TdcAdaptive.space(context, 4)),
        Text(model['desc']!, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context))),
      ],
    );
  }

  Widget _buildModelAction(BuildContext context, bool isInstalled, String pullCmd) {
    if (!isInstalled) {
      return InkWell(
        onTap: () => _copyCommand(pullCmd),
        borderRadius: TdcRadius.sm,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 10), 
            vertical: TdcAdaptive.padding(context, 7)),
          decoration: BoxDecoration(
            color: TdcColors.surface,
            borderRadius: TdcRadius.sm,
            border: Border.all(color: TdcColors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.terminal, size: TdcAdaptive.icon(context, 14), color: TdcColors.accent),
              SizedBox(width: TdcAdaptive.space(context, 6)),
              Text(pullCmd, style: TextStyle(fontFamily: 'monospace', fontSize: TdcText.label(context), color: TdcColors.accent)),
              SizedBox(width: TdcAdaptive.space(context, 8)),
              Icon(Icons.copy, size: TdcAdaptive.icon(context, 13), color: TdcColors.textMuted),
            ],
          ),
        ),
      );
    } else {
      return ElevatedButton.icon(
        onPressed: () => Navigator.pushNamed(context, '/ai'),
        icon: Icon(Icons.chat, size: TdcAdaptive.icon(context, 15)),
        label: Text('Utiliser', style: TextStyle(fontSize: TdcText.button(context))),
        style: ElevatedButton.styleFrom(
          backgroundColor: TdcColors.accent,
          padding: EdgeInsets.symmetric(
            horizontal: TdcAdaptive.padding(context, 14), 
            vertical: TdcAdaptive.padding(context, 10)),
        ),
      );
    }
  }

  Widget _buildModelRow({required BuildContext context, required String name, required bool isInstalled, VoidCallback? onAction}) {
    return Container(
      margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 8)),
      padding: EdgeInsets.symmetric(
        horizontal: TdcAdaptive.padding(context, TdcSpacing.md), 
        vertical: TdcAdaptive.padding(context, TdcSpacing.sm + 2)),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt,
        borderRadius: TdcRadius.sm,
        border: Border.all(color: TdcColors.success.withOpacity(0.2)),
      ),
      child: Row(children: [
        Icon(Icons.circle, size: TdcAdaptive.icon(context, 8), color: TdcColors.success),
        SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
        Text(name, 
          style: TextStyle(
            color: TdcColors.textPrimary, 
            fontFamily: 'monospace', 
            fontSize: TdcText.body(context))),
        const Spacer(),
        Icon(Icons.check, size: TdcAdaptive.icon(context, 16), color: TdcColors.success),
      ]),
    );
  }

  // ── Guide installation ─────────────────────────────────────
  Widget _buildInstallGuide(BuildContext context) {
    return _buildSection(
      context: context,
      icon: Icons.download,
      title: 'Installer Ollama',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Ollama est un outil local open-source qui permet d\'exécuter des LLMs (Mistral, Llama, etc.) directement sur votre machine, sans cloud.',
            style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.body(context), height: 1.6),
          ),
          SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),

          // Windows
          _buildInstallStep(context, '1', 'Télécharger Ollama pour Windows',
              'Rendez-vous sur ollama.com/download et téléchargez le setup Windows.',
              trailing: OutlinedButton.icon(
                onPressed: () {
                  _copyCommand('https://ollama.com/download');
                },
                icon: Icon(Icons.open_in_new, size: TdcAdaptive.icon(context, 14)),
                label: Text('ollama.com/download', style: TextStyle(fontSize: TdcText.button(context))),
                style: OutlinedButton.styleFrom(
                  foregroundColor: TdcColors.accent,
                  side: BorderSide(color: TdcColors.accent.withOpacity(0.4)),
                  padding: EdgeInsets.symmetric(
                    horizontal: TdcAdaptive.padding(context, 12), 
                    vertical: TdcAdaptive.padding(context, 8)),
                ),
              )),

          _buildInstallStep(context, '2', 'Démarrer Ollama',
              'Après l\'installation, Ollama démarre automatiquement en tâche de fond (icône dans la barre système).'),

          _buildInstallStep(context, '3', 'Télécharger un modèle',
              'Ouvrez un terminal et tapez la commande ci-dessous :',
              command: 'ollama pull mistral'),

          _buildInstallStep(context, '4', 'Vérifier',
              'Rafraîchissez cette page. Le statut doit passer au vert.',
              isLast: true),
        ],
      ),
    );
  }

  Widget _buildInstallStep(BuildContext context, String num, String title, String desc, {String? command, Widget? trailing, bool isLast = false}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(children: [
            Container(
              width: TdcAdaptive.space(context, 28), 
              height: TdcAdaptive.space(context, 28),
              decoration: BoxDecoration(color: TdcColors.accentDim, shape: BoxShape.circle, border: Border.all(color: TdcColors.accent.withOpacity(0.3))),
              child: Center(child: Text(num, style: TextStyle(color: TdcColors.accent, fontSize: TdcText.bodySmall(context), fontWeight: FontWeight.bold))),
            ),
            if (!isLast) Expanded(child: Container(width: 1, color: TdcColors.border, margin: EdgeInsets.symmetric(vertical: TdcAdaptive.space(context, 4)))),
          ]),
          SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, TdcSpacing.md)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.w600, fontSize: TdcText.body(context))),
                  SizedBox(height: TdcAdaptive.space(context, 4)),
                  Text(desc, style: TextStyle(color: TdcColors.textSecondary, fontSize: TdcText.bodySmall(context), height: 1.5)),
                  if (command != null) ...[
                    SizedBox(height: TdcAdaptive.space(context, TdcSpacing.sm)),
                    InkWell(
                      onTap: () => _copyCommand(command),
                      borderRadius: TdcRadius.sm,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: TdcAdaptive.padding(context, 12), 
                          vertical: TdcAdaptive.padding(context, 8)),
                        decoration: BoxDecoration(color: const Color(0xFF1A1D2E), borderRadius: TdcRadius.sm, border: Border.all(color: TdcColors.border)),
                        child: Row(children: [
                          Text('\$ $command', style: TextStyle(fontFamily: 'monospace', color: TdcColors.success, fontSize: TdcText.bodySmall(context))),
                          const Spacer(),
                          Icon(Icons.copy, size: TdcAdaptive.icon(context, 14), color: TdcColors.textMuted),
                        ]),
                      ),
                    ),
                  ],
                  if (trailing != null) ...[SizedBox(height: TdcAdaptive.space(context, TdcSpacing.sm)), trailing],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Commandes utiles ───────────────────────────────────────
  Widget _buildUsefulCommands(BuildContext context) {
    final commands = [
      {'cmd': 'ollama list', 'desc': 'Lister les modèles installés'},
      {'cmd': 'ollama run mistral', 'desc': 'Lancer Mistral en mode interactif'},
      {'cmd': 'ollama ps', 'desc': 'Voir les modèles en cours d\'exécution'},
      {'cmd': 'ollama rm mistral', 'desc': 'Supprimer un modèle'},
    ];

    return _buildSection(
      context: context,
      icon: Icons.terminal,
      title: 'Commandes rapides',
      child: Column(
        children: commands.map((c) {
          return InkWell(
            onTap: () => _copyCommand(c['cmd']!),
            borderRadius: TdcRadius.sm,
            child: Container(
              margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 8)),
              padding: EdgeInsets.symmetric(
                horizontal: TdcAdaptive.padding(context, TdcSpacing.md), 
                vertical: TdcAdaptive.padding(context, TdcSpacing.sm + 2)),
              decoration: BoxDecoration(color: TdcColors.surfaceAlt, borderRadius: TdcRadius.sm, border: Border.all(color: TdcColors.border)),
              child: Row(children: [
                Text('\$ ', style: TextStyle(color: TdcColors.textMuted, fontFamily: 'monospace', fontSize: TdcText.bodySmall(context))),
                Text(c['cmd']!, style: TextStyle(color: TdcColors.accent, fontFamily: 'monospace', fontSize: TdcText.bodySmall(context))),
                SizedBox(width: TdcAdaptive.space(context, TdcSpacing.md)),
                Expanded(child: Text(c['desc']!, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context)))),
                Icon(Icons.copy, size: TdcAdaptive.icon(context, 14), color: TdcColors.textMuted),
              ]),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────
  Widget _buildSection({required BuildContext context, required IconData icon, required String title, required Widget child}) {
    return Container(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, TdcSpacing.lg)),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: TdcRadius.lg,
        border: Border.all(color: TdcColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(icon, size: TdcAdaptive.icon(context, 18), color: TdcColors.accent),
            SizedBox(width: TdcAdaptive.space(context, TdcSpacing.sm)),
            Text(title, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: TdcText.bodyLarge(context))),
          ]),
          SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
          Divider(color: TdcColors.border, height: 1),
          SizedBox(height: TdcAdaptive.space(context, TdcSpacing.md)),
          child,
        ],
      ),
    );
  }

  Widget _buildEmptyState(String text) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: TdcAdaptive.padding(context, TdcSpacing.md)),
      child: Text(text, style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.bodySmall(context), height: 1.6)),
    );
  }
}
