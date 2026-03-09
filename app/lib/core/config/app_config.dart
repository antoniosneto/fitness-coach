/// Configuração da aplicação (base URL da API).
/// Em produção, usar variáveis de ambiente ou flavor.
class AppConfig {
  AppConfig._();

  /// Base URL da API (ex.: http://localhost:3000/api/v1).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );

  static const int connectTimeoutSeconds = 30;
  static const int receiveTimeoutSeconds = 30;
}
