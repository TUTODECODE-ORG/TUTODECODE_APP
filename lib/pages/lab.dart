import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_theme.dart';
import '../core/responsive/responsive.dart';

// ─── Entrée principale ────────────────────────────────────────────────────────
class LabPage extends StatefulWidget {
  @override State<LabPage> createState() => _LabPageState();
}

class _LabPageState extends State<LabPage> {
  int _selected = 0;

  static const _labs = [
    _LabMeta('Ping ICMP',         Icons.radar,             Color(0xFF10B981)),
    _LabMeta('Resolution DNS',    Icons.dns,               Color(0xFF6366F1)),
    _LabMeta('TCP Handshake',     Icons.handshake,         Color(0xFF3B82F6)),
    _LabMeta('Requete HTTP',      Icons.http,              Color(0xFFF59E0B)),
    _LabMeta('Couches Docker',    Icons.layers,            Color(0xFF8B5CF6)),
    _LabMeta('Permissions Unix',  Icons.lock,              Color(0xFFEF4444)),
  ];

  @override
  Widget build(BuildContext context) {
    final isMobile = TdcBreakpoints.isMobile(context);
    return Scaffold(
      backgroundColor: TdcColors.bg,
      body: Column(children: [
        _buildHeader(context),
        if (isMobile) _buildMobileTabs(context),
        Expanded(
          child: isMobile
              ? _buildContent()
              : Row(children: [
                  _buildSidebar(context),
                  Expanded(child: _buildContent()),
                ]),
        ),
      ]),
    );
  }

  Widget _buildHeader(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(
      horizontal: TdcAdaptive.padding(context, 20), 
      vertical: TdcAdaptive.padding(context, 14)),
    decoration: BoxDecoration(color: TdcColors.surface, border: Border(bottom: BorderSide(color: TdcColors.border))),
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
        decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10))),
        child: Icon(Icons.science, color: const Color(0xFF10B981), size: TdcAdaptive.icon(context, 22)),
      ),
      SizedBox(width: TdcAdaptive.space(context, 12)),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Laboratoire Interactif', 
          style: TextStyle(
            color: TdcColors.textPrimary, 
            fontSize: TdcText.h2(context), 
            fontWeight: FontWeight.bold)),
        Text('Simulations visuelles des protocoles réseaux et systèmes', 
          style: TextStyle(
            color: TdcColors.textSecondary, 
            fontSize: TdcText.label(context)), 
          maxLines: 1, overflow: TextOverflow.ellipsis),
      ])),
    ]),
  );

  Widget _buildMobileTabs(BuildContext context) {
    return Container(
      height: TdcAdaptive.space(context, 50),
      color: TdcColors.surface,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: TdcAdaptive.padding(context, 12)),
        itemCount: _labs.length,
        itemBuilder: (context, i) {
          final lab = _labs[i];
          final sel = _selected == i;
          return GestureDetector(
            onTap: () => setState(() => _selected = i),
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: TdcAdaptive.space(context, 4), vertical: TdcAdaptive.space(context, 8)),
              padding: EdgeInsets.symmetric(horizontal: TdcAdaptive.padding(context, 12)),
              decoration: BoxDecoration(
                color: sel ? lab.color.withOpacity(0.12) : Colors.transparent,
                borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 20)),
                border: Border.all(color: sel ? lab.color.withOpacity(0.3) : TdcColors.border.withOpacity(0.5)),
              ),
              child: Center(
                child: Row(children: [
                  Icon(lab.icon, size: TdcAdaptive.icon(context, 14), color: sel ? lab.color : TdcColors.textMuted),
                  SizedBox(width: TdcAdaptive.space(context, 6)),
                  Text(lab.title, style: TextStyle(color: sel ? lab.color : TdcColors.textSecondary, fontSize: TdcText.label(context), fontWeight: sel ? FontWeight.bold : FontWeight.normal)),
                ]),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSidebar(BuildContext context) => Container(
    width: TdcAdaptive.space(context, 220),
    color: TdcColors.surface,
    padding: EdgeInsets.all(TdcAdaptive.padding(context, 12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: EdgeInsets.only(
          left: TdcAdaptive.padding(context, 8), 
          bottom: TdcAdaptive.padding(context, 10), 
          top: TdcAdaptive.padding(context, 4)),
        child: Text('SIMULATIONS', 
          style: TextStyle(
            color: TdcColors.textMuted, 
            fontSize: TdcText.label(context), 
            fontWeight: FontWeight.bold, 
            letterSpacing: 1.2)),
      ),
      ...List.generate(_labs.length, (i) => _buildSidebarItem(context, i)),
    ]),
  );

  Widget _buildSidebarItem(BuildContext context, int i) {
    final lab = _labs[i];
    final sel = _selected == i;
    return GestureDetector(
      onTap: () => setState(() => _selected = i),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: EdgeInsets.only(bottom: TdcAdaptive.space(context, 4)),
        padding: EdgeInsets.symmetric(
          horizontal: TdcAdaptive.padding(context, 12), 
          vertical: TdcAdaptive.padding(context, 10)),
        decoration: BoxDecoration(
          color: sel ? lab.color.withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 10)),
          border: Border.all(color: sel ? lab.color.withOpacity(0.3) : Colors.transparent),
        ),
        child: Row(children: [
          Icon(lab.icon, color: sel ? lab.color : TdcColors.textMuted, size: TdcAdaptive.icon(context, 18)),
          SizedBox(width: TdcAdaptive.space(context, 10)),
          Expanded(
            child: Text(lab.title, 
              style: TextStyle(
                color: sel ? lab.color : TdcColors.textSecondary, 
                fontSize: TdcText.bodySmall(context), 
                fontWeight: sel ? FontWeight.bold : FontWeight.normal))),
        ]),
      ),
    );
  }

  Widget _buildContent() {
    switch (_selected) {
      case 0: return PingSimulator();
      case 1: return DnsSimulator();
      case 2: return TcpSimulator();
      case 3: return HttpSimulator();
      case 4: return DockerLayersSimulator();
      case 5: return UnixPermissionsSimulator();
      default: return PingSimulator();
    }
  }
}

class _LabMeta {
  final String title; final IconData icon; final Color color;
  const _LabMeta(this.title, this.icon, this.color);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PING SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════
class PingSimulator extends StatefulWidget {
  @override State<PingSimulator> createState() => _PingSimulatorState();
}

class _PingSimulatorState extends State<PingSimulator> with TickerProviderStateMixin {
  final _controller = TextEditingController(text: '8.8.8.8');
  final _logs = <_PingLog>[];
  Timer? _timer;
  bool _running = false;
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600))..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.6, end: 1.0).animate(_pulseCtrl);
  }

  @override
  void dispose() { _timer?.cancel(); _pulseCtrl.dispose(); super.dispose(); }

  void _start() {
    if (_running) { _timer?.cancel(); setState(() => _running = false); return; }
    setState(() { _running = true; _logs.clear(); });
    final host = _controller.text.trim().isEmpty ? '8.8.8.8' : _controller.text.trim();
    int seq = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      final rng = Random();
      final ok = rng.nextDouble() > 0.08;
      final ms = ok ? (8 + rng.nextInt(40)) : 0;
      setState(() => _logs.add(_PingLog(seq: ++seq, host: host, ms: ms, ok: ok)));
      if (_logs.length >= 8) { _timer?.cancel(); setState(() => _running = false); }
    });
  }

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFF10B981),
    title: 'Simulateur Ping ICMP',
    description: 'Le ping envoie des paquets ICMP Echo Request vers une cible et mesure le temps de reponse (RTT).',
    theory: const [
      _TheoryRow('ICMP', 'Internet Control Message Protocol — protocole de diagnostic reseau'),
      _TheoryRow('Echo Request', 'Paquet envoye par votre machine (type 8)'),
      _TheoryRow('Echo Reply', 'Reponse de la cible (type 0)'),
      _TheoryRow('TTL', 'Time To Live — nombre de sauts maximum avant abandon'),
      _TheoryRow('RTT', 'Round Trip Time — aller-retour en millisecondes'),
    ],
    child: Column(children: [
      // Input
      Row(children: [
        Expanded(child: TextField(
          controller: _controller,
          style: TextStyle(color: TdcColors.textPrimary, fontFamily: 'Courier New', fontSize: TdcText.bodySmall(context)),
          decoration: InputDecoration(
            labelText: 'Cible (IP ou domaine)', 
            prefixIcon: Icon(Icons.radar, size: TdcAdaptive.icon(context, 18))),
        )),
        SizedBox(width: TdcAdaptive.space(context, 12)),
        ElevatedButton.icon(
          onPressed: _start,
          icon: Icon(_running ? Icons.stop : Icons.play_arrow, size: TdcAdaptive.icon(context, 18)),
          label: Text(_running ? 'Stopper' : 'Lancer', style: TextStyle(fontSize: TdcText.button(context))),
          style: ElevatedButton.styleFrom(
            backgroundColor: _running ? TdcColors.danger : const Color(0xFF10B981), 
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, 20), 
              vertical: TdcAdaptive.padding(context, 14))),
        ),
      ]),
      SizedBox(height: TdcAdaptive.space(context, 20)),
      // Visualisation paquets
      if (_logs.isNotEmpty) ...[
        Container(
          height: TdcAdaptive.space(context, 80),
          decoration: BoxDecoration(color: const Color(0xFF0D0D14), borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)), border: Border.all(color: TdcColors.border)),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: _logs.take(8).map((log) {
            return Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: TdcAdaptive.space(context, 12), 
                height: TdcAdaptive.space(context, 12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: log.ok ? const Color(0xFF10B981) : TdcColors.danger,
                  boxShadow: [BoxShadow(color: (log.ok ? const Color(0xFF10B981) : TdcColors.danger).withOpacity(0.5), blurRadius: 8)],
                ),
              ),
              SizedBox(height: TdcAdaptive.space(context, 6)),
              Text(log.ok ? '${log.ms}ms' : 'Lost', 
                style: TextStyle(
                  color: log.ok ? const Color(0xFF10B981) : TdcColors.danger, 
                  fontSize: TdcText.scale(context, 9), 
                  fontFamily: 'Courier New')),
            ]);
          }).toList()),
        ),
        SizedBox(height: TdcAdaptive.space(context, 12)),
      ],
      // Terminal output
      Expanded(child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF050508), 
          borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)), 
          border: Border.all(color: TdcColors.border)),
        padding: EdgeInsets.all(TdcAdaptive.padding(context, 16)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              width: TdcAdaptive.space(context, 10), 
              height: TdcAdaptive.space(context, 10), 
              decoration: BoxDecoration(shape: BoxShape.circle, color: TdcColors.danger)),
            SizedBox(width: TdcAdaptive.space(context, 6)),
            Container(
              width: TdcAdaptive.space(context, 10), 
              height: TdcAdaptive.space(context, 10), 
              decoration: BoxDecoration(shape: BoxShape.circle, color: TdcColors.warning)),
            SizedBox(width: TdcAdaptive.space(context, 6)),
            Container(
              width: TdcAdaptive.space(context, 10), 
              height: TdcAdaptive.space(context, 10), 
              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF10B981))),
            SizedBox(width: TdcAdaptive.space(context, 12)),
            Text('bash — ping ${_controller.text}', 
              style: TextStyle(color: TdcColors.textMuted, fontSize: TdcText.label(context))),
          ]),
          Divider(height: TdcAdaptive.space(context, 16)),
          if (_logs.isEmpty)
            Text(_running ? 'Envoi des paquets ICMP...' : 'Appuyez sur Lancer pour simuler un ping', 
              style: TextStyle(
                color: TdcColors.textMuted, 
                fontFamily: 'Courier New', 
                fontSize: TdcText.bodySmall(context)))
          else
            ..._logs.map((log) => Padding(
              padding: EdgeInsets.only(bottom: TdcAdaptive.space(context, 3)),
              child: Text(
                log.ok
                    ? '64 bytes from ${log.host}: icmp_seq=${log.seq} ttl=118 time=${log.ms}.${Random().nextInt(9)} ms'
                    : 'Request timeout for icmp_seq ${log.seq}',
                style: TextStyle(
                  color: log.ok ? const Color(0xFF10B981) : TdcColors.danger, 
                  fontFamily: 'Courier New', 
                  fontSize: TdcText.label(context), 
                  height: 1.6),
              ),
            )),
          if (!_running && _logs.isNotEmpty) ...[
            const Divider(height: 16),
            Builder(builder: (_) {
              final ok = _logs.where((l) => l.ok).length;
              final avg = _logs.where((l) => l.ok).isEmpty ? 0 : _logs.where((l) => l.ok).map((l) => l.ms).reduce((a,b) => a+b) ~/ ok;
              return Text('--- ${_logs.first.host} ping statistics ---\n${_logs.length} packets transmitted, $ok received, ${((_logs.length - ok)/_logs.length*100).toInt()}% packet loss\nrtt min/avg/max = ${_logs.where((l)=>l.ok).isEmpty?0:_logs.where((l)=>l.ok).map((l)=>l.ms).reduce(min)}/${avg}/${_logs.where((l)=>l.ok).isEmpty?0:_logs.where((l)=>l.ok).map((l)=>l.ms).reduce(max)} ms',
                style: const TextStyle(color: TdcColors.textSecondary, fontFamily: 'Courier New', fontSize: 12, height: 1.6));
            }),
          ],
        ]),
      )),
    ]),
  );
}

class _PingLog { final int seq; final String host; final int ms; final bool ok; _PingLog({required this.seq, required this.host, required this.ms, required this.ok}); }

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DNS SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════
class DnsSimulator extends StatefulWidget {
  @override State<DnsSimulator> createState() => _DnsSimulatorState();
}

class _DnsSimulatorState extends State<DnsSimulator> {
  final _ctrl = TextEditingController(text: 'github.com');
  final _steps = <_DnsStep>[];
  bool _running = false;

  static final _db = <String, String>{
    'github.com': '140.82.121.4', 'google.com': '142.250.74.14',
    'youtube.com': '142.250.185.46', 'facebook.com': '157.240.241.35',
    'cloudflare.com': '104.16.132.229', 'netflix.com': '54.74.20.246',
  };

  Future<void> _resolve() async {
    final host = _ctrl.text.trim();
    setState(() { _steps.clear(); _running = true; });

    Future<void> add(String src, String dst, String msg, Color c, bool ok) async {
      await Future.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;
      setState(() => _steps.add(_DnsStep(src: src, dst: dst, msg: msg, color: c, ok: ok)));
    }

    await add('Votre PC', 'Cache local', 'Verification du cache /etc/hosts et DNS cache...', TdcColors.textSecondary, false);
    await add('Votre PC', 'Resolveur DNS\n(8.8.8.8)', 'Query: $host A?', const Color(0xFF6366F1), false);
    await add('Resolveur DNS', 'Serveur Racine\n(a.root-servers.net)', 'Qui gere .com ?', const Color(0xFF3B82F6), false);
    await add('Serveur Racine', 'Resolveur DNS', 'Deleguer vers TLD: a.gtld-servers.net', const Color(0xFF3B82F6), true);
    await add('Resolveur DNS', 'Serveur TLD .com\n(gtld-servers.net)', 'Qui gere $host ?', const Color(0xFFF59E0B), false);
    await add('Serveur TLD', 'Resolveur DNS', 'Deleguer vers ns1.${host.split('.').last == 'com' ? host : 'github.com'}', const Color(0xFFF59E0B), true);
    final ip = _db[host] ?? '${Random().nextInt(200)}.${Random().nextInt(255)}.${Random().nextInt(255)}.${Random().nextInt(255)}';
    await add('Serveur Autoritaire', 'Resolveur DNS', '$host A ${ip}', const Color(0xFF10B981), true);
    await add('Resolveur DNS', 'Votre PC', '$host → $ip (TTL: 3600s)', const Color(0xFF10B981), true);

    if (mounted) setState(() => _running = false);
  }

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFF6366F1),
    title: 'Resolution DNS',
    description: 'Le DNS traduit un nom de domaine (github.com) en adresse IP (140.82.121.4) via une chaine de serveurs hierarchiques.',
    theory: const [
      _TheoryRow('Resolveur', 'Votre serveur DNS local (8.8.8.8, 1.1.1.1)'),
      _TheoryRow('Racine', '13 serveurs racine mondiaux (a. a m.root-servers.net)'),
      _TheoryRow('TLD', 'Top Level Domain : .com, .fr, .net, .org'),
      _TheoryRow('Autoritaire', 'Serveur officiel du domaine — a la reponse finale'),
      _TheoryRow('TTL', 'Duree de vie du cache (ex: 3600s = 1h)'),
    ],
    child: Column(children: [
      Row(children: [
        Expanded(child: TextField(
          controller: _ctrl,
          style: const TextStyle(color: TdcColors.textPrimary, fontFamily: 'Courier New'),
          decoration: const InputDecoration(labelText: 'Nom de domaine a resoudre', prefixIcon: Icon(Icons.dns)),
        )),
        const SizedBox(width: 12),
        ElevatedButton.icon(
          onPressed: _running ? null : _resolve,
          icon: _running ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.play_arrow, size: 18),
          label: Text(_running ? 'Resolution...' : 'Resoudre'),
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
        ),
      ]),
      const SizedBox(height: 16),
      Expanded(child: _steps.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.dns, size: 48, color: const Color(0xFF6366F1).withOpacity(0.3)),
            const SizedBox(height: 12),
            const Text('Entrez un domaine et appuyez sur Resoudre', style: TextStyle(color: TdcColors.textMuted)),
          ]))
        : ListView.builder(
            itemCount: _steps.length,
            itemBuilder: (_, i) {
              final s = _steps[i];
              return TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: 1),
                duration: const Duration(milliseconds: 400),
                builder: (_, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset((1-v)*20, 0), child: child)),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: s.color.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: s.color.withOpacity(0.2)),
                  ),
                  child: Row(children: [
                    Container(
                      width: 28, height: 28,
                      decoration: BoxDecoration(shape: BoxShape.circle, color: s.color.withOpacity(0.15)),
                      child: Center(child: Text('${i+1}', style: TextStyle(color: s.color, fontWeight: FontWeight.bold, fontSize: 12))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        _Chip(s.src.replaceAll('\n', ' '), s.color),
                        Icon(s.ok ? Icons.arrow_back : Icons.arrow_forward, size: 14, color: s.color),
                        _Chip(s.dst.replaceAll('\n', ' '), s.color),
                      ]),
                      const SizedBox(height: 4),
                      Text(s.msg, style: TextStyle(color: s.ok ? s.color : TdcColors.textSecondary, fontFamily: 'Courier New', fontSize: 12)),
                    ])),
                    Icon(s.ok ? Icons.check_circle : Icons.send, color: s.ok ? TdcColors.success : s.color, size: 16),
                  ]),
                ),
              );
            },
          )),
    ]),
  );
}

class _DnsStep { final String src, dst, msg; final Color color; final bool ok; _DnsStep({required this.src, required this.dst, required this.msg, required this.color, required this.ok}); }

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TCP HANDSHAKE
// ═══════════════════════════════════════════════════════════════════════════════
class TcpSimulator extends StatefulWidget {
  @override State<TcpSimulator> createState() => _TcpSimulatorState();
}

class _TcpSimulatorState extends State<TcpSimulator> {
  int _step = -1;
  bool _running = false;

  static const _steps = [
    _TcpStep('Client', 'Serveur', 'SYN', 'Seq=0', 'Connexion initiee. Client envoie SYN (synchronize) + numero de sequence aleatoire.', Color(0xFF3B82F6)),
    _TcpStep('Serveur', 'Client', 'SYN-ACK', 'Seq=0, Ack=1', 'Serveur repond SYN-ACK : accepte la connexion + envoie son propre Seq.', Color(0xFF6366F1)),
    _TcpStep('Client', 'Serveur', 'ACK', 'Ack=1', 'Client confirme. Connexion etablie ! Echange de donnees possible.', Color(0xFF10B981)),
    _TcpStep('Client', 'Serveur', 'DATA', 'GET / HTTP/1.1', 'Transfert de donnees (requete HTTP, SSH, etc.)', Color(0xFFF59E0B)),
    _TcpStep('Client', 'Serveur', 'FIN', 'Fin transfert', 'Client demande la fermeture de la connexion.', Color(0xFFEF4444)),
    _TcpStep('Serveur', 'Client', 'FIN-ACK', 'Fermeture OK', 'Serveur confirme. Connexion terminee proprement.', Color(0xFFEF4444)),
  ];

  Future<void> _animate() async {
    setState(() { _step = -1; _running = true; });
    for (int i = 0; i < _steps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 900));
      if (!mounted) return;
      setState(() => _step = i);
    }
    if (mounted) setState(() => _running = false);
  }

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFF3B82F6),
    title: 'TCP 3-Way Handshake',
    description: 'TCP etablit une connexion fiable en 3 etapes avant tout echange de donnees. C\'est la base de HTTP, SSH, FTP...',
    theory: const [
      _TheoryRow('SYN', 'Synchronize — demande de connexion avec numero de sequence'),
      _TheoryRow('ACK', 'Acknowledge — confirmation de reception'),
      _TheoryRow('SYN-ACK', 'Synchronize + Acknowledge — acceptation de la connexion'),
      _TheoryRow('FIN', 'Finish — demande de fermeture propre'),
      _TheoryRow('Seq/Ack', 'Numeros pour garantir l\'ordre des paquets'),
    ],
    child: Column(children: [
      ElevatedButton.icon(
        onPressed: _running ? null : _animate,
        icon: const Icon(Icons.play_arrow, size: 18),
        label: Text(_running ? 'Animation...' : 'Simuler la connexion'),
        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF3B82F6)),
      ),
      const SizedBox(height: 20),
      // Diagram
      Expanded(child: Row(children: [
        // Client column
        Expanded(child: Column(children: [
          _NodeBox('CLIENT\n(Navigateur)', const Color(0xFF3B82F6)),
          const Expanded(child: VerticalDivider(color: Color(0xFF3B82F6), width: 2, thickness: 2)),
        ])),
        // Steps center
        Expanded(flex: 3, child: _step < 0
          ? const Center(child: Text('Appuyez sur Simuler', style: TextStyle(color: TdcColors.textMuted)))
          : ListView.builder(
              itemCount: _step + 1,
              itemBuilder: (_, i) {
                final s = _steps[i];
                final toRight = s.from == 'Client';
                return TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 500),
                  builder: (_, v, child) => Opacity(opacity: v, child: child),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Column(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: s.color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: s.color.withOpacity(0.4)),
                        ),
                        child: Column(children: [
                          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            if (!toRight) const Icon(Icons.arrow_back, size: 14, color: TdcColors.textMuted),
                            const SizedBox(width: 4),
                            Text(s.flag, style: TextStyle(color: s.color, fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(width: 4),
                            if (toRight) const Icon(Icons.arrow_forward, size: 14, color: TdcColors.textMuted),
                          ]),
                          Text(s.detail, style: const TextStyle(color: TdcColors.textMuted, fontSize: 10, fontFamily: 'Courier New')),
                        ]),
                      ),
                      if (i == _step) Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(s.explanation, style: const TextStyle(color: TdcColors.textSecondary, fontSize: 11), textAlign: TextAlign.center),
                      ),
                    ]),
                  ),
                );
              },
            )),
        // Server column
        Expanded(child: Column(children: [
          _NodeBox('SERVEUR\n(nginx)', const Color(0xFF6366F1)),
          const Expanded(child: VerticalDivider(color: Color(0xFF6366F1), width: 2, thickness: 2)),
        ])),
      ])),
    ]),
  );
}

class _TcpStep {
  final String from, to, flag, detail, explanation; final Color color;
  const _TcpStep(this.from, this.to, this.flag, this.detail, this.explanation, this.color);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. HTTP REQUEST SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════
class HttpSimulator extends StatefulWidget {
  @override State<HttpSimulator> createState() => _HttpSimulatorState();
}

class _HttpSimulatorState extends State<HttpSimulator> {
  String _method = 'GET';
  final _urlCtrl = TextEditingController(text: '/api/users');
  final _phases = <_HttpPhase>[];
  bool _running = false;

  static const _methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  static const _codes = {'GET': 200, 'POST': 201, 'PUT': 200, 'DELETE': 204, 'PATCH': 200};
  static const _codeTexts = {200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found'};

  Future<void> _send() async {
    setState(() { _phases.clear(); _running = true; });

    Future<void> add(String phase, String content, Color c) async {
      await Future.delayed(const Duration(milliseconds: 600));
      if (mounted) setState(() => _phases.add(_HttpPhase(phase, content, c)));
    }

    await add('DNS', 'Resolution api.example.com → 93.184.216.34', const Color(0xFF6366F1));
    await add('TCP', '3-Way Handshake etabli (port 443)', const Color(0xFF3B82F6));
    await add('TLS', 'Negociation TLS 1.3 — connexion chiffree', const Color(0xFFF59E0B));
    await add('Request', '$_method ${_urlCtrl.text} HTTP/1.1\nHost: api.example.com\nAuthorization: Bearer eyJ...\nContent-Type: application/json', const Color(0xFF10B981));
    await add('Response', 'HTTP/1.1 ${_codes[_method]} ${_codeTexts[_codes[_method]]}\nContent-Type: application/json\nX-Request-Id: abc-123\n\n{"status":"success","data":[...]}', const Color(0xFF10B981));
    await add('Rendu', 'Donnees parsees et affichees — ${_method == 'DELETE' ? 'Ressource supprimee' : 'Reponse traitee'}', TdcColors.textSecondary);

    if (mounted) setState(() => _running = false);
  }

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFFF59E0B),
    title: 'Cycle de vie HTTP',
    description: 'Chaque requete HTTP passe par DNS, TCP, TLS puis le transfert HTTP. Voyez chaque etape en detail.',
    theory: const [
      _TheoryRow('GET', 'Lire une ressource — sans effet de bord'),
      _TheoryRow('POST', 'Creer une ressource — corps requis'),
      _TheoryRow('PUT', 'Remplacer entierement une ressource'),
      _TheoryRow('DELETE', 'Supprimer une ressource'),
      _TheoryRow('TLS', 'Chiffrement de la connexion (HTTPS)'),
    ],
    child: Column(children: [
      Row(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(color: TdcColors.surfaceAlt, borderRadius: BorderRadius.circular(10), border: Border.all(color: TdcColors.border)),
          child: DropdownButtonHideUnderline(child: DropdownButton<String>(
            value: _method,
            dropdownColor: TdcColors.surface,
            items: _methods.map((m) => DropdownMenuItem(value: m, child: Text(m, style: TextStyle(color: _methodColor(m), fontWeight: FontWeight.bold, fontFamily: 'Courier New', fontSize: 13)))).toList(),
            onChanged: (v) => setState(() => _method = v!),
          )),
        ),
        const SizedBox(width: 8),
        Expanded(child: TextField(controller: _urlCtrl, style: const TextStyle(color: TdcColors.textPrimary, fontFamily: 'Courier New'), decoration: const InputDecoration(labelText: 'Endpoint', prefixText: 'https://api.example.com'))),
        const SizedBox(width: 8),
        ElevatedButton.icon(
          onPressed: _running ? null : _send,
          icon: const Icon(Icons.send, size: 16),
          label: const Text('Envoyer'),
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.black),
        ),
      ]),
      const SizedBox(height: 16),
      Expanded(child: _phases.isEmpty
        ? const Center(child: Text('Configurez et envoyez une requete HTTP', style: TextStyle(color: TdcColors.textMuted)))
        : ListView.separated(
            itemCount: _phases.length,
            separatorBuilder: (_, __) => const SizedBox(height: 1),
            itemBuilder: (_, i) {
              final p = _phases[i];
              return TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: 1), duration: const Duration(milliseconds: 400),
                builder: (_, v, child) => Opacity(opacity: v, child: child),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(width: 90, padding: const EdgeInsets.symmetric(vertical: 8), child: Row(children: [
                    Container(width: 3, height: 40, color: p.color, margin: const EdgeInsets.only(right: 10)),
                    Text(p.phase, style: TextStyle(color: p.color, fontWeight: FontWeight.bold, fontSize: 11)),
                  ])),
                  Expanded(child: Container(
                    margin: const EdgeInsets.only(bottom: 4),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: p.color.withOpacity(0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: p.color.withOpacity(0.15))),
                    child: Text(p.content, style: const TextStyle(color: TdcColors.textSecondary, fontFamily: 'Courier New', fontSize: 11, height: 1.6)),
                  )),
                ]),
              );
            },
          )),
    ]),
  );

  Color _methodColor(String m) {
    switch (m) {
      case 'GET': return const Color(0xFF10B981);
      case 'POST': return const Color(0xFF6366F1);
      case 'PUT': return const Color(0xFFF59E0B);
      case 'DELETE': return const Color(0xFFEF4444);
      default: return TdcColors.textSecondary;
    }
  }
}

class _HttpPhase { final String phase, content; final Color color; _HttpPhase(this.phase, this.content, this.color); }

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DOCKER LAYERS
// ═══════════════════════════════════════════════════════════════════════════════
class DockerLayersSimulator extends StatefulWidget {
  @override State<DockerLayersSimulator> createState() => _DockerLayersSimulatorState();
}

class _DockerLayersSimulatorState extends State<DockerLayersSimulator> {
  int _highlightLayer = -1;

  static const _layers = [
    _DockerLayer('Container Layer (R/W)', 'Couche modifiable — vos donnees en cours d\'execution', Color(0xFF10B981), 'Temporaire, perdu a l\'arret'),
    _DockerLayer('CMD node server.js', 'Commande de demarrage du conteneur', Color(0xFF6366F1), 'Instruction CMD/ENTRYPOINT'),
    _DockerLayer('COPY . .', 'Copie du code source de l\'app', Color(0xFF6366F1), 'Votre code applicatif'),
    _DockerLayer('RUN npm install', 'Installation des dependances Node.js', Color(0xFF3B82F6), 'node_modules/ — peut etre cache'),
    _DockerLayer('WORKDIR /app', 'Definition du repertoire de travail', Color(0xFF8B5CF6), 'Equivalent "cd /app"'),
    _DockerLayer('COPY package.json .', 'Copie du manifeste de dependances', Color(0xFF3B82F6), 'Optimisation: cache si unchanged'),
    _DockerLayer('FROM node:20-alpine', 'Image de base officielle Node.js', Color(0xFFF59E0B), 'Alpine Linux = 5MB seulement'),
  ];

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFF8B5CF6),
    title: 'Couches Docker (Layers)',
    description: 'Une image Docker est une pile de couches immuables. Chaque instruction Dockerfile = une couche. Les couches sont mises en cache pour accelerer les builds.',
    theory: const [
      _TheoryRow('Layer', 'Couche immuable cree par chaque instruction Dockerfile'),
      _TheoryRow('Cache', 'Si une couche n\'a pas change, Docker reutilise le cache'),
      _TheoryRow('R/O', 'Toutes les couches image sont en lecture seule'),
      _TheoryRow('R/W', 'Le conteneur ajoute une couche modifiable au dessus'),
      _TheoryRow('Union FS', 'OverlayFS fusionne toutes les couches en un seul systeme'),
    ],
    child: Row(children: [
      // Dockerfile source
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Dockerfile', style: TextStyle(color: TdcColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 8),
        Expanded(child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: const Color(0xFF050508), borderRadius: BorderRadius.circular(12), border: Border.all(color: TdcColors.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: _layers.reversed.toList().asMap().entries.map((e) {
            final i = _layers.length - 1 - e.key;
            final l = e.value;
            return MouseRegion(
              onEnter: (_) => setState(() => _highlightLayer = i),
              onExit:  (_) => setState(() => _highlightLayer = -1),
              child: Container(
                margin: const EdgeInsets.only(bottom: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _highlightLayer == i ? l.color.withOpacity(0.08) : Colors.transparent,
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text(l.instruction, style: TextStyle(color: _highlightLayer == i ? l.color : TdcColors.textSecondary, fontFamily: 'Courier New', fontSize: 12, height: 1.8)),
              ),
            );
          }).toList()),
        )),
      ])),
      const SizedBox(width: 20),
      // Visual stacking
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Image Docker', style: TextStyle(color: TdcColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 8),
        ..._layers.asMap().entries.map((e) {
          final i = e.key;
          final l = e.value;
          final highlight = _highlightLayer == i;
          return MouseRegion(
            onEnter: (_) => setState(() => _highlightLayer = i),
            onExit:  (_) => setState(() => _highlightLayer = -1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 3),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: highlight ? l.color.withOpacity(0.15) : l.color.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: highlight ? l.color.withOpacity(0.5) : l.color.withOpacity(0.15)),
              ),
              child: Row(children: [
                Container(width: 3, height: 36, color: l.color, margin: const EdgeInsets.only(right: 10)),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.instruction, style: TextStyle(color: l.color, fontFamily: 'Courier New', fontSize: 11, fontWeight: FontWeight.bold)),
                  Text(highlight ? l.detail : l.description, style: const TextStyle(color: TdcColors.textMuted, fontSize: 10, height: 1.4)),
                ])),
                if (i == 0) Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: TdcColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                  child: const Text('R/W', style: TextStyle(color: TdcColors.success, fontSize: 9, fontWeight: FontWeight.bold)),
                ) else Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: TdcColors.border, borderRadius: BorderRadius.circular(4)),
                  child: const Text('R/O', style: TextStyle(color: TdcColors.textMuted, fontSize: 9)),
                ),
              ]),
            ),
          );
        }),
      ])),
    ]),
  );
}

class _DockerLayer {
  final String instruction, description, detail; final Color color;
  const _DockerLayer(this.instruction, this.description, this.color, this.detail);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. UNIX PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════
class UnixPermissionsSimulator extends StatefulWidget {
  @override State<UnixPermissionsSimulator> createState() => _UnixPermissionsSimulatorState();
}

class _UnixPermissionsSimulatorState extends State<UnixPermissionsSimulator> {
  // owner, group, other -> r, w, x
  final _perms = [[true, true, false], [true, false, false], [false, false, false]];
  static const _who = ['Proprietaire', 'Groupe', 'Autres'];
  static const _bits = ['r', 'w', 'x'];
  static const _vals = [4, 2, 1];

  int _octal(int who) => List.generate(3, (b) => _perms[who][b] ? _vals[b] : 0).reduce((a,b) => a+b);
  String get _octalStr => List.generate(3, (i) => _octal(i)).join();
  String get _symbolic {
    final s = List.generate(3, (w) => List.generate(3, (b) => _perms[w][b] ? _bits[b] : '-').join()).join('');
    return '-$s';
  }

  static const _presets = [
    _Preset('644 — Fichier config', [[true,true,false],[true,false,false],[true,false,false]], '644'),
    _Preset('755 — Script exec', [[true,true,true],[true,false,true],[true,false,true]], '755'),
    _Preset('600 — Cle SSH', [[true,true,false],[false,false,false],[false,false,false]], '600'),
    _Preset('777 — DANGER', [[true,true,true],[true,true,true],[true,true,true]], '777'),
    _Preset('000 — Blocage', [[false,false,false],[false,false,false],[false,false,false]], '000'),
  ];

  void _applyPreset(_Preset p) => setState(() {
    for (int w = 0; w < 3; w++) for (int b = 0; b < 3; b++) _perms[w][b] = p.perms[w][b];
  });

  Color get _riskColor {
    final o = _octalStr;
    if (o == '777') return TdcColors.danger;
    if (o[2] != '0') return TdcColors.warning;
    if (o == '000') return TdcColors.textMuted;
    return TdcColors.success;
  }

  @override
  Widget build(BuildContext context) => _LabShell(
    color: const Color(0xFFEF4444),
    title: 'Permissions Unix',
    description: 'Les permissions Unix controlent qui peut lire, ecrire et executer chaque fichier. Cliquez sur les cases pour modifier.',
    theory: const [
      _TheoryRow('r (4)', 'Read — permission de lecture'),
      _TheoryRow('w (2)', 'Write — permission d\'ecriture'),
      _TheoryRow('x (1)', 'Execute — permission d\'execution'),
      _TheoryRow('owner', 'Proprietaire du fichier (vous)'),
      _TheoryRow('644', 'owner=rw, group=r, other=r — config standard'),
    ],
    child: Column(children: [
      // Presets
      Wrap(spacing: 8, runSpacing: 8, children: _presets.map((p) => GestureDetector(
        onTap: () => _applyPreset(p),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _octalStr == p.octal ? const Color(0xFFEF4444).withOpacity(0.15) : TdcColors.surfaceAlt,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _octalStr == p.octal ? const Color(0xFFEF4444) : TdcColors.border),
          ),
          child: Text(p.label, style: TextStyle(color: _octalStr == p.octal ? const Color(0xFFEF4444) : TdcColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w500)),
        ),
      )).toList()),
      const SizedBox(height: 20),
      // Grid interactif
      Table(
        border: TableBorder.all(color: TdcColors.border, borderRadius: BorderRadius.circular(8)),
        children: [
          TableRow(decoration: BoxDecoration(color: TdcColors.surfaceAlt), children: [
            const _TH('Qui'),
            const _TH('Lire (r=4)'),
            const _TH('Ecrire (w=2)'),
            const _TH('Executer (x=1)'),
            const _TH('Octal'),
            const _TH('Symbolique'),
          ]),
          ...List.generate(3, (w) => TableRow(children: [
            Padding(padding: const EdgeInsets.all(10), child: Text(_who[w], style: const TextStyle(color: TdcColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 12))),
            ...List.generate(3, (b) => Center(child: Checkbox(
              value: _perms[w][b],
              onChanged: (v) => setState(() => _perms[w][b] = v!),
              activeColor: const Color(0xFFEF4444),
              checkColor: Colors.white,
            ))),
            Padding(padding: const EdgeInsets.all(10), child: Text('${_octal(w)}', style: TextStyle(color: const Color(0xFFEF4444), fontWeight: FontWeight.bold, fontFamily: 'Courier New', fontSize: 14), textAlign: TextAlign.center)),
            Padding(padding: const EdgeInsets.all(10), child: Text(
              List.generate(3, (b) => _perms[w][b] ? _bits[b] : '-').join(),
              style: const TextStyle(color: TdcColors.textSecondary, fontFamily: 'Courier New', fontSize: 13),
              textAlign: TextAlign.center,
            )),
          ])),
        ],
      ),
      const SizedBox(height: 16),
      // Result
      AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _riskColor.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _riskColor.withOpacity(0.3)),
        ),
        child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('chmod $_octalStr fichier.sh', style: TextStyle(color: _riskColor, fontFamily: 'Courier New', fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('ls -la : $_symbolic fichier.sh', style: const TextStyle(color: TdcColors.textMuted, fontFamily: 'Courier New', fontSize: 12)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: _riskColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Column(children: [
              Text(_octalStr, style: TextStyle(color: _riskColor, fontFamily: 'Courier New', fontSize: 28, fontWeight: FontWeight.bold)),
              Text(_octalStr == '777' ? 'DANGER' : _octalStr == '000' ? 'BLOQUE' : 'OK', style: TextStyle(color: _riskColor, fontSize: 10, fontWeight: FontWeight.bold)),
            ]),
          ),
        ]),
      ),
    ]),
  );
}

class _Preset {
  final String label; final List<List<bool>> perms; final String octal;
  const _Preset(this.label, this.perms, this.octal);
}

class _TH extends StatelessWidget {
  final String text; const _TH(this.text);
  @override Widget build(_) => Padding(padding: const EdgeInsets.all(8), child: Text(text, style: const TextStyle(color: TdcColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold), textAlign: TextAlign.center));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════
class _LabShell extends StatelessWidget {
  final Color color;
  final String title, description;
  final List<_TheoryRow> theory;
  final Widget child;

  const _LabShell({required this.color, required this.title, required this.description, required this.theory, required this.child});

  @override
  Widget build(BuildContext context) {
    final isMobile = TdcBreakpoints.isMobile(context);
    return Padding(
      padding: EdgeInsets.all(TdcAdaptive.padding(context, 24)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Title
        Row(children: [
          Container(
            width: TdcAdaptive.space(context, 4), 
            height: TdcAdaptive.space(context, 24), 
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
          SizedBox(width: TdcAdaptive.space(context, 12)),
          Text(title, 
            style: TextStyle(
              color: TdcColors.textPrimary, 
              fontSize: TdcText.h2(context), 
              fontWeight: FontWeight.bold)),
        ]),
        SizedBox(height: TdcAdaptive.space(context, 6)),
        Text(description, 
          style: TextStyle(
            color: TdcColors.textSecondary, 
            fontSize: TdcText.bodySmall(context))),
        SizedBox(height: TdcAdaptive.space(context, 12)),
        // Theory pills
        Wrap(
          spacing: TdcAdaptive.space(context, 8), 
          runSpacing: TdcAdaptive.space(context, 6), 
          children: theory.map((t) => Container(
            padding: EdgeInsets.symmetric(
              horizontal: TdcAdaptive.padding(context, 10), 
              vertical: TdcAdaptive.padding(context, 4)),
            decoration: BoxDecoration(
              color: color.withOpacity(0.08), 
              borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 6)), 
              border: Border.all(color: color.withOpacity(0.2))),
            child: RichText(text: TextSpan(children: [
              TextSpan(text: '${t.key} ', 
                style: TextStyle(
                  color: color, 
                  fontWeight: FontWeight.bold, 
                  fontSize: TdcText.label(context), 
                  fontFamily: 'Courier New')),
              TextSpan(text: t.value, 
                style: TextStyle(
                  color: TdcColors.textMuted, 
                  fontSize: TdcText.label(context))),
            ])),
          )).toList()),
        SizedBox(height: TdcAdaptive.space(context, 16)),
        Divider(color: TdcColors.border),
        SizedBox(height: TdcAdaptive.space(context, 12)),
        Expanded(child: isMobile ? SingleChildScrollView(child: SizedBox(height: TdcAdaptive.space(context, 800), child: child)) : child),
      ]),
    );
  }
}

class _TheoryRow {
  final String key, value; const _TheoryRow(this.key, this.value);
}

class _NodeBox extends StatelessWidget {
  final String label; final Color color;
  const _NodeBox(this.label, this.color);
  @override Widget build(_) => Container(
    margin: const EdgeInsets.only(bottom: 4),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.3))),
    child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11, fontFamily: 'Courier New'), textAlign: TextAlign.center),
  );
}

class _Chip extends StatelessWidget {
  final String label; final Color color;
  const _Chip(this.label, this.color);
  @override Widget build(_) => Container(
    margin: const EdgeInsets.symmetric(horizontal: 3),
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
    child: Text(label, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold)),
  );
}
