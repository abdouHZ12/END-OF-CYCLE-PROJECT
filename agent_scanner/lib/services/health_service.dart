import 'package:http/http.dart' as http;
import '../config.dart';

class HealthService {
  static Future<bool> check() async {
    try {
      final response = await http
          .get(Uri.parse(Config.baseUrl))
          .timeout(const Duration(seconds: 5));
      return response.statusCode < 500;
    } catch (_) {
      return false;
    }
  }
}