/// Estado de autenticação (Riverpod). Tratar todos os casos na UI com when/switch.
sealed class AuthState {
  const AuthState();
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class Authenticating extends AuthState {
  const Authenticating();
}

class Authenticated extends AuthState {
  const Authenticated();
}

class AuthError extends AuthState {
  const AuthError({required this.message});
  final String message;
}
