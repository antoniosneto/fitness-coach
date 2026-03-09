import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../data/auth_api.dart';
import '../data/auth_state.dart';
import '../data/forgot_password_request.dart';
import '../data/login_request.dart';
import '../data/reset_password_request.dart';
import '../data/signup_request.dart';

final secureStorageProvider = Provider<SecureStorage>((ref) => SecureStorage());

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return createDio(
    secureStorage: storage,
    on401: () => ref.read(authStateProvider.notifier).logout(),
  );
});

final authApiProvider = Provider<AuthApi>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthApi(dio);
});

final authStateProvider =
    NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const Unauthenticated();

  SecureStorage get _storage => ref.read(secureStorageProvider);
  AuthApi get _api => ref.read(authApiProvider);

  Future<void> checkToken() async {
    final token = await _storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      state = const Authenticated();
    } else {
      state = const Unauthenticated();
    }
  }

  Future<void> login(String email, String password) async {
    state = const Authenticating();
    try {
      final res = await _api.login(LoginRequest(email: email, password: password));
      await _storage.setAccessToken(res.accessToken);
      state = const Authenticated();
    } on DioException catch (e) {
      state = AuthError(message: ensureApiError(e).displayMessage);
    }
  }

  Future<void> signup(String email, String password, String name) async {
    state = const Authenticating();
    try {
      await _api.signup(SignupRequest(email: email, password: password, name: name));
      state = const Unauthenticated();
    } on DioException catch (e) {
      state = AuthError(message: ensureApiError(e).displayMessage);
    }
  }

  Future<void> logout() async {
    await _storage.deleteAccessToken();
    state = const Unauthenticated();
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _api.forgotPassword(ForgotPasswordRequest(email: email));
    } on DioException catch (e) {
      rethrow;
    }
  }

  Future<void> resetPassword(String token, String newPassword) async {
    try {
      await _api.resetPassword(
        ResetPasswordRequest(token: token, newPassword: newPassword),
      );
    } on DioException catch (e) {
      rethrow;
    }
  }
}
