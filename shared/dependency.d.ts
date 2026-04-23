export interface DependencyData {
    id: string;
    name: string;
    version: string;
    type: 'npm' | 'system' | 'custom';
    status: 'active' | 'deprecated' | 'unknown';
    lastChecked: string;
}
