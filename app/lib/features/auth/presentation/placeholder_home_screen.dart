import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';

/// Placeholder até Fase 3 (abas Perfil, Treino, Alimentação).
class PlaceholderHomeScreen extends ConsumerWidget {
  const PlaceholderHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Início'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil('/', (r) => false);
              }
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Você está logado. (Abas Perfil/Treino/Alimentação na Fase 3)'),
      ),
    );
  }
}
