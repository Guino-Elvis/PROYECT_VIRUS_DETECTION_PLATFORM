export interface Scan {
    id: number;
    project_id: number;
    key_project_id: number;
    zap_scan_id: string;
    status: ScanStatus;
    active: boolean;
    expires_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}
export enum ScanStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed'
}