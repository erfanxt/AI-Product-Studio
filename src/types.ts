

// FIX: Removed unnecessary import of GenerationType from "." which was causing circular dependency errors.
// The enum is defined in this file, so it should not be imported.
export enum GenerationType {
  Photo = 'photo',
  Video = 'video',
  Campaign = 'campaign',
  SocialPost = 'social_post',
}

export interface GenerationResult {
  type: 'photo' | 'video' | 'text';
  data: string; // base64 for photo, url for video, content for text
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
  preview: string; // A base64 image or a placeholder identifier
  results: GenerationResult[];
  prompt: string;
}