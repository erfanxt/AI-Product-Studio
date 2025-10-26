// FIX: Removed unnecessary import of GenerationType from "." which was causing circular dependency errors.
// The enum is defined in this file, so it should not be imported.
export enum GenerationType {
  Photo = 'photo',
  Campaign = 'campaign',
  SocialPost = 'social_post',
  MagicEdit = 'magic_edit',
}

export interface GenerationResult {
  type: 'photo' | 'text';
  data: string; // base64 for photo, content for text
  error?: string; // To handle per-result errors
  title?: string; // e.g., 'Instagram Post'
}

export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4';

export const aspectRatios: { key: AspectRatio; label: string }[] = [
  { key: '1:1', label: 'Square' },
  { key: '9:16', label: 'Story / Reel' },
  { key: '16:9', label: 'Widescreen' },
  { key: '3:4', label: 'Portrait' },
];

export interface StylePreset {
  key: string;
  label: string;
  keywords: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  generationType: GenerationType;
  preview: string; // A base64 image or an empty string
  results: GenerationResult[];
  prompt: string;
}

export type GenerativeModel = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-image';

export const generativeModels: { key: GenerativeModel; label: string }[] = [
  { key: 'gemini-2.5-flash', label: 'Flash (Fast & Efficient)' },
  { key: 'gemini-2.5-pro', label: 'Pro (Powerful & Advanced)' },
  { key: 'gemini-2.5-flash-image', label: 'Nano Banana (Vision & Edit)' },
];