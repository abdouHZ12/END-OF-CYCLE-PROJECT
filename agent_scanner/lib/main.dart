import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final loggedIn = await AuthService.isLoggedIn();
  runApp(AgentScannerApp(loggedIn: loggedIn));
}

class AgentScannerApp extends StatelessWidget {
  final bool loggedIn;
  const AgentScannerApp({super.key, required this.loggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agent Scanner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: loggedIn ? const HomeScreen() : const LoginScreen(),
    );
  }
}