export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  script: string;
  generatedImageBase64?: string;
}

export interface IconProps {
  className?: string;
  onClick?: () => void;
}