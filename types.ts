
export type AppView = 'home' | 'slides' | 'docs' | 'stories' | 'data' | 'audio' | 'research' | 'agent';

export interface Slide {
  title: string;
  content: string[];
  layout: 'bullet' | 'text-only' | 'image-text';
}

export interface StoryPage {
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface DataInsight {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface AnalysisResult {
  summary: string;
  chartData: DataInsight[];
  chartType: 'bar' | 'line' | 'pie';
}

export interface ResearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentTask {
  id: string;
  description: string;
  status: TaskStatus;
  tool?: string;
  result?: any;
}

export interface AgentState {
  objective: string;
  plan: AgentTask[];
  logs: { type: 'thought' | 'action' | 'observation', message: string }[];
  isThinking: boolean;
  isComplete: boolean;
}
