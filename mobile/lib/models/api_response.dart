class APIResponse<T> {
  final bool success;
  final T? data;
  final APIError? error;
  final APIMetadata? metadata;

  APIResponse({
    required this.success,
    this.data,
    this.error,
    this.metadata,
  });

  factory APIResponse.fromJson(Map<String, dynamic> json, T Function(dynamic) fromJsonT) {
    return APIResponse(
      success: json['success'],
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      error: json['error'] != null ? APIError.fromJson(json['error']) : null,
      metadata: json['metadata'] != null ? APIMetadata.fromJson(json['metadata']) : null,
    );
  }
}

class APIError {
  final String code;
  final String message;
  final dynamic details;

  APIError({required this.code, required this.message, this.details});

  factory APIError.fromJson(Map<String, dynamic> json) {
    return APIError(
      code: json['code'],
      message: json['message'],
      details: json['details'],
    );
  }
}

class APIMetadata {
  final String timestamp;
  final String? requestId;

  APIMetadata({required this.timestamp, this.requestId});

  factory APIMetadata.fromJson(Map<String, dynamic> json) {
    return APIMetadata(
      timestamp: json['timestamp'],
      requestId: json['requestId'],
    );
  }
}
