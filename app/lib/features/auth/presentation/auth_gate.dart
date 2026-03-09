import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/widgets/loading_screen.dart';
import '../data/auth_state.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'placeholder_home_screen.dart';

/// Verifica token ao iniciar; exibe Login ou Home conforme estado (ADR-003).
class AuthGate extends ConsumerStatefulWidget {
  const AuthGate({super.key});

  @override
  ConsumerState<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends ConsumerState<AuthGate> {
  bool _checked = false;

  @override
  void initState() {
    super.initState();
    ref.read(authStateProvider.notifier).checkToken().then((_) {
      if (mounted) setState(() => _checked = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_checked) return const LoadingScreen();

    final authState = ref.watch(authStateProvider);

    return switch (authState) {
      Authenticated() => const PlaceholderHomeScreen(),
      Unauthenticated() || AuthError() => const LoginScreen(),
      Authenticating() => const LoadingScreen(),
    };
  }
}
