import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class AgentService {
  static const String _key = 'agent_device_id';

  static Future<String> getAgentId() async {
    final prefs = await SharedPreferences.getInstance();
    String? id = prefs.getString(_key);
    if (id == null) {
      id = const Uuid().v4();
      await prefs.setString(_key, id);
    }
    return id;
  }
}