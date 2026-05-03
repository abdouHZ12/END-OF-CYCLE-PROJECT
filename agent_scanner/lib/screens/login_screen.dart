import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _obscurePassword = true;

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.login(
        _usernameController.text.trim(),
        _passwordController.text.trim(),
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF12213A),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white10)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('NAFTAL',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFffa500),
                          letterSpacing: 0.04)),
                  Text('Agent Portal',
                      style: TextStyle(fontSize: 11, color: Colors.white30)),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 32),
                    const Text('Sign in',
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w600,
                            color: Colors.white)),
                    const SizedBox(height: 4),
                    const Text('Agent access only',
                        style:
                            TextStyle(fontSize: 13, color: Colors.white38)),
                    const SizedBox(height: 32),

                    // Username
                    const Text('USERNAME',
                        style: TextStyle(
                            fontSize: 11,
                            color: Colors.white38,
                            letterSpacing: 0.06)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _usernameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Enter your username',
                        hintStyle:
                            const TextStyle(color: Colors.white24),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.05),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: Colors.white.withOpacity(0.08)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: Colors.white.withOpacity(0.08)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFffa500)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Password
                    const Text('PASSWORD',
                        style: TextStyle(
                            fontSize: 11,
                            color: Colors.white38,
                            letterSpacing: 0.06)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        hintStyle:
                            const TextStyle(color: Colors.white24),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.05),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off_rounded
                                : Icons.visibility_rounded,
                            color: Colors.white38,
                            size: 20,
                          ),
                          onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: Colors.white.withOpacity(0.08)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(
                              color: Colors.white.withOpacity(0.08)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: Color(0xFFffa500)),
                        ),
                      ),
                      onSubmitted: (_) => _login(),
                    ),

                    if (_error != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE24B4A).withOpacity(0.1),
                          border: Border.all(
                              color: const Color(0xFFE24B4A)
                                  .withOpacity(0.3)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded,
                                color: Color(0xFFE24B4A), size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(_error!,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFFE24B4A))),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const Spacer(),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFffa500),
                          disabledBackgroundColor:
                              const Color(0xFFffa500).withOpacity(0.3),
                          padding:
                              const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: _loading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Color(0xFF0f1117),
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Sign in',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF0f1117))),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}