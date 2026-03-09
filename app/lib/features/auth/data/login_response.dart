import 'package:json_annotation/json_annotation.dart';

part 'login_response.g.dart';

/// Response 200 de POST /auth/login — contratos-frontend.md.
@JsonSerializable()
class LoginResponse {
  const LoginResponse({required this.accessToken});

  @JsonKey(name: 'access_token')
  final String accessToken;

  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
}
