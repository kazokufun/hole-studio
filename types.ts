
export interface PromptHistoryEntry {
  id: number;
  title: string;
  prompt: string;
}

export interface NotificationEntry {
  id: number;
  message: string;
}

export interface PromptBGOptions {
  style: string;
  type: string;
  special: string;
}

export interface VectorBGOptions {
  design: string;
  iconDesign: string;
  iconType: string;
}
