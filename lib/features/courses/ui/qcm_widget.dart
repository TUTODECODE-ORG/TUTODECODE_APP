import 'package:flutter/material.dart';

class QcmQuestion {
  final String question;
  final List<String> choices;
  final int correctIndex;

  QcmQuestion({required this.question, required this.choices, required this.correctIndex});
}

class QcmWidget extends StatefulWidget {
  final List<QcmQuestion> questions;
  final void Function(bool success)? onComplete;

  const QcmWidget({required this.questions, this.onComplete, Key? key}) : super(key: key);

  @override
  State<QcmWidget> createState() => _QcmWidgetState();
}

class _QcmWidgetState extends State<QcmWidget> {
  int _current = 0;
  int _score = 0;
  int? _selected;
  bool _finished = false;

  void _next() {
    if (_selected == widget.questions[_current].correctIndex) {
      _score++;
    }
    if (_current < widget.questions.length - 1) {
      setState(() {
        _current++;
        _selected = null;
      });
    } else {
      setState(() {
        _finished = true;
      });
      widget.onComplete?.call(_score == widget.questions.length);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_finished) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Résultat : $_score / ${widget.questions.length}', style: TextStyle(fontSize: 20)),
            if (_score == widget.questions.length)
              Text('Bravo, cours validé !', style: TextStyle(color: Colors.green)),
            if (_score < widget.questions.length)
              Text('Certaines réponses sont incorrectes.', style: TextStyle(color: Colors.red)),
          ],
        ),
      );
    }
    final q = widget.questions[_current];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Q${_current + 1}: ${q.question}', style: TextStyle(fontSize: 18)),
        ...List.generate(q.choices.length, (i) => RadioListTile<int>(
          value: i,
          // ignore: deprecated_member_use
          groupValue: _selected,
          title: Text(q.choices[i]),
          // ignore: deprecated_member_use
          onChanged: (v) => setState(() => _selected = v),
        )),
        ElevatedButton(
          onPressed: _selected != null ? _next : null,
          child: Text(_current < widget.questions.length - 1 ? 'Suivant' : 'Valider'),
        ),
      ],
    );
  }
}
