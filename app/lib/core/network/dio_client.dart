import 'package:dio/dio.dart';

import '../config/app_config.dart';
import 'api_error.dart';
import '../storage/secure_storage.dart';

/// Cliente HTTP (Dio) com baseUrl, timeout e interceptor de Bearer.
/// Em 401, [on401] é chamado (ex.: logout) e [ApiError] é lançado (ADR-003).
Dio createDio({
  SecureStorage? secureStorage,
  void Function()? on401,
}) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: Duration(seconds: AppConfig.connectTimeoutSeconds),
    receiveTimeout: Duration(seconds: AppConfig.receiveTimeoutSeconds),
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
  ));

  if (secureStorage != null) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  dio.interceptors.add(InterceptorsWrapper(
    onError: (err, handler) {
      final response = err.response;
      final statusCode = response?.statusCode ?? 0;
      if (statusCode == 401) on401?.call();
      if (response != null && response.data is Map) {
        final data = response.data as Map<String, dynamic>;
        final code = data['statusCode'] as int? ?? statusCode;
        final message = data['message'];
        final error = data['error'] as String?;
        return handler.reject(
          DioException(
            requestOptions: err.requestOptions,
            response: response,
            error: ApiError(statusCode: code, message: message, error: error),
          ),
        );
      }
      return handler.next(err);
    },
  ));

  return dio;
}

/// Extrai [ApiError] de [DioException] se existir.
ApiError? getApiError(dynamic error) {
  if (error is DioException && error.error is ApiError) {
    return error.error as ApiError;
  }
  return null;
}
