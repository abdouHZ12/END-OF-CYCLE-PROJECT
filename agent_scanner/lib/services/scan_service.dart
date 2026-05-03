import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';
import 'agent_service.dart';
import 'auth_service.dart';

class ScanService {
  static Future<Map<String, dynamic>> scan(String raw) async {
    final agentId = await AgentService.getAgentId();
    final token = await AuthService.getToken();

    String qrToken = raw;
    try {
      final uri = Uri.parse(raw);
      if (uri.queryParameters.containsKey('token')) {
        qrToken = uri.queryParameters['token']!;
      }
    } catch (_) {}

    final response = await http.post(
      Uri.parse('${Config.baseUrl}/scan'),
      headers: {
        'Content-Type': 'application/json',
        'x-agent-id': agentId,
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'token': qrToken}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200 || response.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_scan_employee', data['Document']['employee']['name'] ?? '');
      await prefs.setString('last_scan_status', data['Document']['leaveSession']?['status'] ?? 'UNKNOWN');
      await prefs.setString('last_scan_time', DateTime.now().toIso8601String());
      return data;
    } else {
      throw Exception(data['message'] ?? 'Scan failed');
    }
  }
}