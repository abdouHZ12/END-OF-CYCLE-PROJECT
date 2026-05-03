import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/scan_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;
  Map<String, dynamic>? _result;
  String? _error;

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;

    setState(() {
      _isProcessing = true;
      _result = null;
      _error = null;
    });

    _controller.stop();

    try {
      final result = await ScanService.scan(barcode!.rawValue!);
      setState(() => _result = result);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  void _reset() {
    setState(() {
      _result = null;
      _error = null;
    });
    _controller.start();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('Agent Scanner', style: TextStyle(color: Colors.white)),
      ),
      body: _result != null || _error != null
          ? _buildResult()
          : _buildScanner(),
    );
  }

  Widget _buildScanner() {
    return Stack(
      children: [
        MobileScanner(
          controller: _controller,
          onDetect: _onDetect,
        ),
        if (_isProcessing)
          const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        Center(
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResult() {
    if (_error != null) {
      return _buildResultCard(
        color: const Color(0xFFE24B4A),
        icon: Icons.cancel_rounded,
        title: 'Invalid',
        subtitle: _error!,
      );
    }

    final doc = _result!['Document'];
    final message = _result!['message'] ?? '';
    final employee = doc['employee'];
    final session = doc['leaveSession'];
    final status = doc['status'];
    final isApproved = status == 'APPROVED';

    return _buildResultCard(
      color: isApproved ? const Color(0xFF639922) : const Color(0xFFE24B4A),
      icon: isApproved ? Icons.check_circle_rounded : Icons.cancel_rounded,
      title: isApproved ? 'Approved' : 'Rejected',
      subtitle: message,
      extra: Column(
        children: [
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.person_rounded, size: 16, color: Colors.white60),
              const SizedBox(width: 6),
              Text(employee['name'],
                  style: const TextStyle(fontSize: 16, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.business_rounded, size: 16, color: Colors.white60),
              const SizedBox(width: 6),
              Text(employee['structure']['name'],
                  style: const TextStyle(fontSize: 14, color: Colors.white70)),
            ],
          ),
          if (session != null) ...[
            const SizedBox(height: 8),
            Text('Status: ${session['status']}',
                style: const TextStyle(color: Colors.white70)),
          ],
        ],
      ),
    );
  }

  Widget _buildResultCard({
    required Color color,
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? extra,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Card(
          color: color.withOpacity(0.15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: color, width: 2),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: color, size: 64),
                const SizedBox(height: 12),
                Text(title,
                    style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: color)),
                const SizedBox(height: 8),
                Text(subtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white70)),
                if (extra != null) extra,
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _reset,
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Scan Again'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}