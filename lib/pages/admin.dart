import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/responsive/responsive.dart';

class AdminPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TdcColors.bg,
      appBar: AppBar(
        backgroundColor: TdcColors.surface,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: TdcColors.accent),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Admin', 
          style: TextStyle(
            color: TdcColors.textPrimary, 
            fontSize: TdcText.h2(context), 
            fontWeight: FontWeight.bold)),
      ),
      body: Padding(
        padding: EdgeInsets.all(TdcAdaptive.padding(context, 20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Panneau d\'administration', 
              style: TextStyle(
                color: TdcColors.textPrimary, 
                fontSize: TdcText.h3(context), 
                fontWeight: FontWeight.bold)),
            SizedBox(height: TdcAdaptive.space(context, 16)),
            Card(
              color: TdcColors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(TdcAdaptive.radius(context, 12)),
                side: BorderSide(color: TdcColors.border),
              ),
              child: ListTile(
                title: Text('Broadcast control (placeholder)', 
                  style: TextStyle(
                    color: TdcColors.textSecondary, 
                    fontSize: TdcText.body(context))),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
