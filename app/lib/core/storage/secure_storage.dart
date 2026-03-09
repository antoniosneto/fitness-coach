import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Chave do access_token (JWT) no armazenamento seguro.
/// Nunca usar SharedPreferences para JWT (AGENTS.md, agents/frontend.md).
const String _keyAccessToken = 'access_token';

class SecureStorage {
  SecureStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
        );

  final FlutterSecureStorage _storage;

  Future<String?> getAccessToken() => _storage.read(key: _keyAccessToken);

  Future<void> setAccessToken(String token) =>
      _storage.write(key: _keyAccessToken, value: token);

  Future<void> deleteAccessToken() => _storage.delete(key: _keyAccessToken);

  Future<void> clear() => _storage.deleteAll();
}
