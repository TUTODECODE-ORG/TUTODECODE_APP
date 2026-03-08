import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/ollama_service.dart';
import '../core/theme/app_theme.dart';

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
                ? SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: TdcColors.accent))
                : Icon(Icons.refresh, color: TdcColors.textSecondary),
            tooltip: 'Vérifier à nouveau',
            onPressed: _checking ? null : _checkOllama,
          ),
          SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(TdcSpacing.xl),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 760),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Statut Ollama
                _buildStatusCard(),
                SizedBox(height: TdcSpacing.lg),

                // ── Si Ollama est lancé : modèles installés
                if (_status?.running == true) ...[
                  _buildInstalledModels(),
                  SizedBox(height: TdcSpacing.lg),
                ],

                // ── Modèles recommandés
                _buildRecommendedModels(),
                SizedBox(height: TdcSpacing.lg),

                // ── Guide d'installation si absent
                if (_status?.running == false) ...[
                  _buildInstallGuide(),
                  SizedBox(height: TdcSpacing.lg),
                ],

                // ── Commandes utiles
                _buildUsefulCommands(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Carte statut ───────────────────────────────────────────
  Widget _buildStatusCard() {
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
      padding: EdgeInsets.all(TdcSpacing.lg),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: TdcRadius.lg,
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          SizedBox(width: TdcSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(statusText, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
                SizedBox(height: 4),
                Text(subText, style: TextStyle(color: TdcColors.textSecondary, fontSize: 13)),
              ],
            ),
          ),
          if (!_checking)
            OutlinedButton.icon(
              onPressed: _checkOllama,
              icon: Icon(Icons.refresh, size: 15),
              label: Text('Rafraîchir'),
              style: OutlinedButton.styleFrom(
                foregroundColor: TdcColors.textSecondary,
                side: BorderSide(color: TdcColors.border),
                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
            ),
        ],
      ),
    );
  }

  // ── Modèles installés ──────────────────────────────────────
  Widget _buildInstalledModels() {
    final models = _status?.models ?? [];
    return _buildSection(
      icon: Icons.inventory_2,
      title: 'Modèles installés',
      child: models.isEmpty
          ? _buildEmptyState('Aucun modèle installé.\nUtilisez `ollama pull <modèle>` pour en ajouter un.')
          : Column(
              children: models.map((m) => _buildModelRow(
                name: m,
                isInstalled: true,
                onAction: null,
              )).toList(),
            ),
    );
  }

  // ── Modèles recommandés ────────────────────────────────────
  Widget _buildRecommendedModels() {
    return _buildSection(
      icon: Icons.auto_awesome,
      title: 'Modèles recommandés pour TutoDeCode',
      child: Column(
        children: kRecommendedModels.map((m) {
          final isInstalled = _status?.models.any((installed) =>
                  installed.startsWith(m['id']!)) ??
              false;
          final isPulling = _pullingModel == m['id'];
          return _buildRecommendedCard(m, isInstalled, isPulling);
        }).toList(),
      ),
    );
  }

  Widget _buildRecommendedCard(Map<String, String> model, bool isInstalled, bool isPulling) {
    final pullCmd = 'ollama pull ${model['id']}';
    return Container(
      margin: EdgeInsets.only(bottom: TdcSpacing.sm),
      padding: EdgeInsets.all(TdcSpacing.md),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt,
        borderRadius: TdcRadius.md,
        border: Border.all(
          color: isInstalled ? TdcColors.success.withOpacity(0.3) : TdcColors.border,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isInstalled
                  ? TdcColors.success.withOpacity(0.1)
                  : TdcColors.accentDim,
              borderRadius: TdcRadius.sm,
            ),
            child: Icon(
              isInstalled ? Icons.check_circle : Icons.memory,
              color: isInstalled ? TdcColors.success : TdcColors.accent,
              size: 22,
            ),
          ),
          SizedBox(width: TdcSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Text(model['label']!, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                  SizedBox(width: 8),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(color: TdcColors.surface, borderRadius: BorderRadius.circular(4)),
                    child: Text(model['size']!, style: TextStyle(color: TdcColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                  if (isInstalled) ...[
                    SizedBox(width: 8),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(color: TdcColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                      child: Text('installé', style: TextStyle(color: TdcColors.success, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ]),
                SizedBox(height: 4),
                Text(model['desc']!, style: TextStyle(color: TdcColors.textSecondary, fontSize: 13)),
              ],
            ),
          ),
          SizedBox(width: TdcSpacing.md),
          // Commande pull avec bouton copier
          if (!isInstalled)
            Row(children: [
              InkWell(
                onTap: () => _copyCommand(pullCmd),
                borderRadius: TdcRadius.sm,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: TdcColors.surface,
                    borderRadius: TdcRadius.sm,
                    border: Border.all(color: TdcColors.border),
                  ),
                  child: Row(children: [
                    Icon(Icons.terminal, size: 14, color: TdcColors.accent),
                    SizedBox(width: 6),
                    Text(pullCmd, style: TextStyle(fontFamily: 'monospace', fontSize: 12, color: TdcColors.accent)),
                    SizedBox(width: 8),
                    Icon(Icons.copy, size: 13, color: TdcColors.textMuted),
                  ]),
                ),
              ),
            ])
          else
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/ai'),
              icon: Icon(Icons.chat, size: 15),
              label: Text('Utiliser'),
              style: ElevatedButton.styleFrom(
                backgroundColor: TdcColors.accent,
                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildModelRow({required String name, required bool isInstalled, VoidCallback? onAction}) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md, vertical: TdcSpacing.sm + 2),
      decoration: BoxDecoration(
        color: TdcColors.surfaceAlt,
        borderRadius: TdcRadius.sm,
        border: Border.all(color: TdcColors.success.withOpacity(0.2)),
      ),
      child: Row(children: [
        Icon(Icons.circle, size: 8, color: TdcColors.success),
        SizedBox(width: TdcSpacing.sm),
        Text(name, style: TextStyle(color: TdcColors.textPrimary, fontFamily: 'monospace', fontSize: 14)),
        Spacer(),
        Icon(Icons.check, size: 16, color: TdcColors.success),
      ]),
    );
  }

  // ── Guide installation ─────────────────────────────────────
  Widget _buildInstallGuide() {
    return _buildSection(
      icon: Icons.download,
      title: 'Installer Ollama',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Ollama est un outil local open-source qui permet d\'exécuter des LLMs (Mistral, Llama, etc.) directement sur votre machine, sans cloud.',
            style: TextStyle(color: TdcColors.textSecondary, fontSize: 14, height: 1.6),
          ),
          SizedBox(height: TdcSpacing.md),

          // Windows
          _buildInstallStep('1', 'Télécharger Ollama pour Windows',
              'Rendez-vous sur ollama.com/download et téléchargez le setup Windows.',
              trailing: OutlinedButton.icon(
                onPressed: () {
                  // Ouvre le lien dans le navigateur système (Windows)
                  // Pour Flutter Desktop, on peut utiliser url_launcher.
                  // Pour l'instant on copie l'URL.
                  _copyCommand('https://ollama.com/download');
                },
                icon: Icon(Icons.open_in_new, size: 14),
                label: Text('ollama.com/download'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: TdcColors.accent,
                  side: BorderSide(color: TdcColors.accent.withOpacity(0.4)),
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              )),

          _buildInstallStep('2', 'Démarrer Ollama',
              'Après l\'installation, Ollama démarre automatiquement en tâche de fond (icône dans la barre système).'),

          _buildInstallStep('3', 'Télécharger un modèle',
              'Ouvrez un terminal et tapez la commande ci-dessous :',
              command: 'ollama pull mistral'),

          _buildInstallStep('4', 'Vérifier',
              'Rafraîchissez cette page. Le statut doit passer au vert.',
              isLast: true),
        ],
      ),
    );
  }

  Widget _buildInstallStep(String num, String title, String desc, {String? command, Widget? trailing, bool isLast = false}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(children: [
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(color: TdcColors.accentDim, shape: BoxShape.circle, border: Border.all(color: TdcColors.accent.withOpacity(0.3))),
              child: Center(child: Text(num, style: TextStyle(color: TdcColors.accent, fontSize: 13, fontWeight: FontWeight.bold))),
            ),
            if (!isLast) Expanded(child: Container(width: 1, color: TdcColors.border, margin: EdgeInsets.symmetric(vertical: 4))),
          ]),
          SizedBox(width: TdcSpacing.md),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: TdcSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                  SizedBox(height: 4),
                  Text(desc, style: TextStyle(color: TdcColors.textSecondary, fontSize: 13, height: 1.5)),
                  if (command != null) ...[
                    SizedBox(height: TdcSpacing.sm),
                    InkWell(
                      onTap: () => _copyCommand(command),
                      borderRadius: TdcRadius.sm,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(color: Color(0xFF1A1D2E), borderRadius: TdcRadius.sm, border: Border.all(color: TdcColors.border)),
                        child: Row(children: [
                          Text('\$ $command', style: TextStyle(fontFamily: 'monospace', color: TdcColors.success, fontSize: 13)),
                          Spacer(),
                          Icon(Icons.copy, size: 14, color: TdcColors.textMuted),
                        ]),
                      ),
                    ),
                  ],
                  if (trailing != null) ...[SizedBox(height: TdcSpacing.sm), trailing],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Commandes utiles ───────────────────────────────────────
  Widget _buildUsefulCommands() {
    final commands = [
      {'cmd': 'ollama list', 'desc': 'Lister les modèles installés'},
      {'cmd': 'ollama run mistral', 'desc': 'Lancer Mistral en mode interactif'},
      {'cmd': 'ollama ps', 'desc': 'Voir les modèles en cours d\'exécution'},
      {'cmd': 'ollama rm mistral', 'desc': 'Supprimer un modèle'},
    ];

    return _buildSection(
      icon: Icons.terminal,
      title: 'Commandes rapides',
      child: Column(
        children: commands.map((c) {
          return InkWell(
            onTap: () => _copyCommand(c['cmd']!),
            borderRadius: TdcRadius.sm,
            child: Container(
              margin: EdgeInsets.only(bottom: 8),
              padding: EdgeInsets.symmetric(horizontal: TdcSpacing.md, vertical: TdcSpacing.sm + 2),
              decoration: BoxDecoration(color: TdcColors.surfaceAlt, borderRadius: TdcRadius.sm, border: Border.all(color: TdcColors.border)),
              child: Row(children: [
                Text('\$ ', style: TextStyle(color: TdcColors.textMuted, fontFamily: 'monospace', fontSize: 13)),
                Text(c['cmd']!, style: TextStyle(color: TdcColors.accent, fontFamily: 'monospace', fontSize: 13)),
                SizedBox(width: TdcSpacing.md),
                Expanded(child: Text(c['desc']!, style: TextStyle(color: TdcColors.textMuted, fontSize: 12))),
                Icon(Icons.copy, size: 14, color: TdcColors.textMuted),
              ]),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────
  Widget _buildSection({required IconData icon, required String title, required Widget child}) {
    return Container(
      padding: EdgeInsets.all(TdcSpacing.lg),
      decoration: BoxDecoration(
        color: TdcColors.surface,
        borderRadius: TdcRadius.lg,
        border: Border.all(color: TdcColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(icon, size: 18, color: TdcColors.accent),
            SizedBox(width: TdcSpacing.sm),
            Text(title, style: TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
          ]),
          SizedBox(height: TdcSpacing.md),
          Divider(color: TdcColors.border, height: 1),
          SizedBox(height: TdcSpacing.md),
          child,
        ],
      ),
    );
  }

  Widget _buildEmptyState(String text) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: TdcSpacing.md),
      child: Text(text, style: TextStyle(color: TdcColors.textMuted, fontSize: 13, height: 1.6)),
    );
  }
}
