import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/health_service.dart';
import '../services/agent_service.dart';
import 'scanner_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

String _formatTime(String iso) {
  if (iso.isEmpty) return '';
  final dt = DateTime.tryParse(iso);
  if (dt == null) return '';
  return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
}

class _HomeScreenState extends State<HomeScreen> {
  bool _backendOnline = false;
  bool _loading = true;
  String _agentId = '';
  String _lastScanEmployee = '';
  String _lastScanStatus = '';
  String _lastScanTime = '';

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    _lastScanEmployee = prefs.getString('last_scan_employee') ?? '';
    _lastScanStatus = prefs.getString('last_scan_status') ?? '';
    _lastScanTime = prefs.getString('last_scan_time') ?? '';

    final id = await AgentService.getAgentId();
    final online = await HealthService.check();
    setState(() {
      _agentId = id;
      _backendOnline = online;
      _loading = false;
    });
  }

  String get _shortId {
    if (_agentId.length < 8) return _agentId;
    final clean = _agentId.replaceAll('-', '');
    return '···· ···· ${clean.substring(clean.length - 8, clean.length - 4).toUpperCase()} ${clean.substring(clean.length - 4).toUpperCase()}';
  }

  Widget _statusRow(String label, bool online) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 13, color: Colors.white60)),
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: online
                      ? const Color(0xFF3B6D11)
                      : const Color(0xFFA32D2D),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                online ? 'Online' : 'Offline',
                style: TextStyle(
                  fontSize: 12,
                  color: online
                      ? const Color(0xFF639922)
                      : const Color(0xFFE24B4A),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF12213A),
      body: SafeArea(
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFFffa500)))
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.white10),
                      ),
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
                            style:
                                TextStyle(fontSize: 11, color: Colors.white30)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DEVICE',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white38,
                                  letterSpacing: 0.06)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              border: Border.all(
                                  color: Colors.white.withOpacity(0.08)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'ID: $_shortId',
                              style: const TextStyle(
                                  fontSize: 13,
                                  fontFamily: 'monospace',
                                  color: Colors.white60),
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text('SYSTEM STATUS',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white38,
                                  letterSpacing: 0.06)),
                          const SizedBox(height: 10),
                          _statusRow('Backend', _backendOnline),
                          _statusRow('Camera', true),
                          _statusRow('Network', _backendOnline),
                          const Spacer(),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _backendOnline
                                  ? () async {
                                      await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => const ScannerScreen(),
                                        ),
                                      );
                                      _init();
                                    }
                                  : null,
                              icon: const Icon(Icons.qr_code_scanner,
                                  color: Color(0xFF0f1117)),
                              label: const Text(
                                'Start Scanning',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF0f1117)),
                              ),
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
                            ),
                          ),
                          const SizedBox(height: 20),
                          const Divider(color: Colors.white10),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Last scan',
                                  style: TextStyle(
                                      fontSize: 11, color: Colors.white24)),
                              Text(
                                _lastScanEmployee.isEmpty
                                    ? '—'
                                    : '$_lastScanEmployee · $_lastScanStatus · ${_formatTime(_lastScanTime)}',
                                style: const TextStyle(
                                    fontSize: 11, color: Colors.white38),
                              ),
                            ],
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