
export interface MagicMoment {
  id: string;
  start: number;
  end: number;
  summary: string;
  subtitle: string;
}

export interface AnalysisResult {
  moments: MagicMoment[];
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  ERROR = 'ERROR'
}
