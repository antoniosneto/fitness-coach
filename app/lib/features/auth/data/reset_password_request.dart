import 'package:json_annotation/json_annotation.dart';

part 'reset_password_request.g.dart';

@JsonSerializable()
class ResetPasswordRequest {
  const ResetPasswordRequest({
    required this.token,
    required this.newPassword,
  });

  final String token;
  @JsonKey(name: 'new_password')
  final String newPassword;

  Map<String, dynamic> toJson() => _$ResetPasswordRequestToJson(this);
}
