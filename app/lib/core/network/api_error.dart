/// Erro padronizado das respostas 4xx/5xx do backend (NestJS).
/// Ver docs/backend/contratos-frontend.md — formato: statusCode, message (string | array), error?.
class ApiError implements Exception {
  const ApiError({
    required this.statusCode,
    required this.message,
    this.error,
  });

  final int statusCode;
  /// Mensagem única ou array de erros de validação; exibir ao usuário.
  final dynamic message;
  final String? error;

  /// Mensagem exibível: se for List, junta com espaço; senão toString.
  String get displayMessage {
    if (message is List) {
      return (message as List).map((e) => e.toString()).join(' ');
    }
    return message?.toString() ?? 'Erro desconhecido';
  }

  /// 401 → deslogar e redirecionar para login (ADR-003).
  bool get isUnauthorized => statusCode == 401;
  bool get isConflict => statusCode == 409;
  bool get isTooManyRequests => statusCode == 429;
}
