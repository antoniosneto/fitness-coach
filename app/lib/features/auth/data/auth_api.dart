import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';
import 'forgot_password_request.dart';
import 'login_request.dart';
import 'login_response.dart';
import 'reset_password_request.dart';
import 'signup_request.dart';

/// Chamadas à API de auth. Contratos: docs/backend/contratos-frontend.md.
class AuthApi {
  AuthApi(this._dio);

  final Dio _dio;

  /// POST /auth/signup — 201 vazio, 400 validação, 409 email já utilizado.
  Future<void> signup(SignupRequest request) async {
    await _dio.post<void>(
      '/auth/signup',
      data: request.toJson(),
    );
  }

  /// POST /auth/login — 200 { access_token }, 400/401/429.
  Future<LoginResponse> login(LoginRequest request) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: request.toJson(),
    );
    final data = response.data;
    if (data == null) throw Exception('Resposta de login vazia');
    return LoginResponse.fromJson(data);
  }

  /// POST /auth/forgot-password — 200 vazio (sempre), 400/429.
  Future<void> forgotPassword(ForgotPasswordRequest request) async {
    await _dio.post<void>(
      '/auth/forgot-password',
      data: request.toJson(),
    );
  }

  /// POST /auth/reset-password — 200 vazio, 400 token inválido/expirado, 429.
  Future<void> resetPassword(ResetPasswordRequest request) async {
    await _dio.post<void>(
      '/auth/reset-password',
      data: request.toJson(),
    );
  }
}

/// Lança [ApiError] a partir de [DioException] para tratamento na UI.
ApiError ensureApiError(DioException e) {
  final apiError = getApiError(e);
  if (apiError != null) return apiError;
  final statusCode = e.response?.statusCode ?? 0;
  final message = e.response?.data is Map
      ? (e.response!.data as Map)['message']
      : e.message ?? 'Erro de rede';
  return ApiError(statusCode: statusCode, message: message);
}
