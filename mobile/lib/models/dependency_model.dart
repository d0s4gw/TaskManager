class DependencyData {
  final String id;
  final String name;
  final String version;
  final String type; // 'npm' | 'system' | 'custom'
  final String status; // 'active' | 'deprecated' | 'unknown'
  final String lastChecked;

  DependencyData({
    required this.id,
    required this.name,
    required this.version,
    required this.type,
    required this.status,
    required this.lastChecked,
  });

  factory DependencyData.fromJson(Map<String, dynamic> json) {
    return DependencyData(
      id: json['id'],
      name: json['name'],
      version: json['version'],
      type: json['type'],
      status: json['status'],
      lastChecked: json['lastChecked'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'version': version,
      'type': type,
      'status': status,
      'lastChecked': lastChecked,
    };
  }
}
