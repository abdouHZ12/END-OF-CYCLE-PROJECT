import 'package:flutter/material.dart';
import 'screens/scanner_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const AgentScannerApp());
}

class AgentScannerApp extends StatelessWidget {
  const AgentScannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agent Scanner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const HomeScreen(),
    );
  }
}