import 'package:flutter/material.dart';
import '../services/ai_service.dart';

class AIChatPage extends StatefulWidget {
  @override
  _AIChatPageState createState() => _AIChatPageState();
}

class _AIChatPageState extends State<AIChatPage> {
  final _ai = AIService();
  final _controller = TextEditingController();
  final List<Map<String,String>> _messages = [];
  bool _loading = false;

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({'role': 'user', 'text': text});
      _loading = true;
      _controller.clear();
    });
    final reply = await _ai.sendMessage(text);
    setState(() {
      _messages.add({'role': 'ai', 'text': reply});
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat IA')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final m = _messages[i];
                final isUser = m['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    padding: EdgeInsets.all(10),
                    margin: EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.cyan[400] : Colors.grey[800],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(m['text'] ?? ''),
                  ),
                );
              },
            ),
          ),
          if (_loading) LinearProgressIndicator(),
          SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    child: TextField(controller: _controller, decoration: InputDecoration(hintText: 'Écrire un message...')),
                  ),
                ),
                IconButton(icon: Icon(Icons.send), onPressed: _send)
              ],
            ),
          )
        ],
      ),
    );
  }
}
