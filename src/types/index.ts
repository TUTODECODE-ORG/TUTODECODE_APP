// ============================================
// TutoDeCode - Type Definitions
// ============================================

// Hardware Diagnostics Types
export interface CpuInfo {
  brand: string;
  coresPhysical: number;
  coresLogical: number;
  frequencyMhz: number;
  architecture: string;
}

export interface MemoryInfo {
  totalGb: number;
  availableGb: number;
  usedGb: number;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  vramGb?: number;
  isDedicated: boolean;
}

export interface HardwareInfo {
  platform: string;
  cpu: CpuInfo;
  memory: MemoryInfo;
  gpu?: GpuInfo;
  performanceScore: number;
}

export interface LlmRecommendation {
  modelName: string;
  modelSize: string;
  parameters: string;
  vramRequiredGb: number;
  ramRequiredGb: number;
  reason: string;
  suitableFor: string[];
}

export interface HardwareScanResult {
  hardware: HardwareInfo;
  recommendation: LlmRecommendation;
}

// Ticket System Types
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in-progress' | 'review' | 'completed';
export type TicketCategory = 'devops' | 'security' | 'frontend' | 'backend' | 'database' | 'cloud';

export interface TicketCheckpoint {
  id: string;
  description: string;
  completed: boolean;
  hint?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  context: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  checkpoints: TicketCheckpoint[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: 'user' | 'ai';
  content: string;
  timestamp: string;
  type?: 'hint' | 'error' | 'success' | 'info';
}

// Terminal Types
export interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface TerminalSession {
  id: string;
  name: string;
  outputs: TerminalOutput[];
  isActive: boolean;
  cwd: string;
}

// AI Agent Types
export interface AIContext {
  currentTicket?: Ticket;
  terminalHistory: TerminalOutput[];
  hardwareInfo?: HardwareInfo;
  userSkillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface AIResponse {
  type: 'hint' | 'explanation' | 'validation' | 'encouragement' | 'correction';
  content: string;
  codeSnippet?: string;
  relatedDocs?: string[];
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  context: AIContext;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    type?: 'hint' | 'error' | 'success';
    relatedCheckpoint?: string;
  };
}

// WebContainer Types
export interface WebContainerState {
  isBooting: boolean;
  isReady: boolean;
  error?: string;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemNode[];
}

// User Progress Types
export interface UserProgress {
  userId: string;
  completedTickets: string[];
  currentTicket?: string;
  totalTimeSpent: number;
  skillsAcquired: string[];
  streakDays: number;
  lastActivityAt: string;
}

export interface SkillBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  category: TicketCategory;
}

// App State Types
export interface AppState {
  isHardwareScanComplete: boolean;
  hardwareInfo?: HardwareInfo;
  llmRecommendation?: LlmRecommendation;
  currentTicket?: Ticket;
  tickets: Ticket[];
  terminalSessions: TerminalSession[];
  activeTerminalId?: string;
  aiConversation: AIConversation;
  webContainer: WebContainerState;
  userProgress: UserProgress;
}

// Theme Types
export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Command Palette Types
export interface Command {
  id: string;
  name: string;
  shortcut?: string;
  category: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}
