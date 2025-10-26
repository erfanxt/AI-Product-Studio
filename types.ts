
// FIX: Merged GenerationType enums to include all features: Photo, Video, Campaign, Social Post, and Magic Edit.
export enum GenerationType {
  Photo = 'photo',
  Video = 'video',
  Campaign = 'campaign',
  SocialPost = 'social_post',
  MagicEdit = 'magic_edit',
}

export interface GenerationResult {
  type: 'photo' | 'video' | 'text';
  data: string; // base64 for photo, url for video, content for text
  error?: string; // To handle per-result errors
  title?: string; // e.g., 'Instagram Post'
}

export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4';

export const aspectRatios: { key: AspectRatio; label: string }[] = [
  { key: '1:1', label: 'مربع' },
  { key: '9:16', label: 'استوری/ریلز' },
  { key: '16:9', label: 'عریض' },
  { key: '3:4', label: 'پرتره' },
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
  { key: 'gemini-2.5-flash', label: 'Flash (سریع و بهینه)' },
  { key: 'gemini-2.5-pro', label: 'Pro (قدرتمند و پیشرفته)' },
  { key: 'gemini-2.5-flash-image', label: 'Nano Banana (بینایی و ویرایش)' },
];
