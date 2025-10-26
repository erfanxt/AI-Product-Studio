
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { AspectRatio, GenerationResult, GenerativeModel } from '../types';

declare global {
    interface Window {
        aistudio?: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        }
    }
}

// FIX: Initialize GoogleGenAI with a named apiKey object as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const base64DataUrlToPureBase64 = (dataUrl: string): string => {
    return dataUrl.split(',')[1];
};

const getMimeTypeFromDataUrl = (dataUrl: string): string => {
    return dataUrl.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
}

export const generatePhoto = async (
    prompt: string,
    sourceImageBase64: string,
    model: GenerativeModel = 'gemini-2.5-flash-image'
): Promise<GenerationResult> => {
    try {
        const pureBase64 = base64DataUrlToPureBase64(sourceImageBase64);
        const mimeType = getMimeTypeFromDataUrl(sourceImageBase64);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: pureBase64, mimeType } },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });

        // FIX: Correctly extract image data from the response.
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return {
                type: 'photo',
                data: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
            };
        }
        
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`API returned text instead of an image. Safety feedback might have been triggered. Response: ${textResponse}`);
        }

        throw new Error("No image data found in response.");
    } catch (e) {
        console.error("Error generating photo:", e);
        return { type: 'photo', data: '', error: (e as Error).message };
    }
};

export const generateSocialPostText = async (
    prompt: string,
    sourceImageBase64: string,
    model: GenerativeModel = 'gemini-2.5-pro'
): Promise<GenerationResult> => {
    try {
        const pureBase64 = base64DataUrlToPureBase64(sourceImageBase64);
        const mimeType = getMimeTypeFromDataUrl(sourceImageBase64);
        const textPrompt = `Based on this product image, write a catchy social media post. The user's goal is: "${prompt}". Write only the caption text. Keep it concise and engaging.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: pureBase64, mimeType } },
                    { text: textPrompt }
                ]
            },
        });

        // FIX: Correctly extract text from response.
        return { type: 'text', data: response.text.trim(), title: 'کپشن اینستاگرام' };
    } catch (e) {
        console.error("Error generating social post text:", e);
        return { type: 'text', data: '', error: (e as Error).message, title: 'کپشن اینستاگرام' };
    }
};

export const generateVideoFrame = async (
    prompt: string,
    sourceImageBase64: string,
    model: GenerativeModel = 'gemini-2.5-flash-image'
): Promise<string> => {
    const framePrompt = `Generate a cinematic, high-quality, visually appealing single image based on the following product and prompt. This image will be used as the starting and ending frame for a video. User prompt: "${prompt}"`;
    const result = await generatePhoto(framePrompt, sourceImageBase64, model);
    if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to generate video frame.');
    }
    return result.data;
};

export const generateVideo = async (
    prompt: string,
    startFrameBase64: string,
    aspectRatio: AspectRatio,
): Promise<GenerationResult> => {
    try {
        // FIX: Implement API key selection flow for Veo models as per guidelines.
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio.openSelectKey();
        }
        const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const pureBase64 = base64DataUrlToPureBase64(startFrameBase64);
        const mimeType = getMimeTypeFromDataUrl(startFrameBase64);
        
        const videoAspectRatio = aspectRatio === '16:9' ? '16:9' : '9:16';

        let operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes: pureBase64, mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: videoAspectRatio,
                lastFrame: { imageBytes: pureBase64, mimeType },
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await localAi.operations.getVideosOperation({ operation });
        }
        
        if(operation.error) {
            throw new Error(operation.error.message || 'Video generation operation failed.');
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was found.");
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            const errorText = await videoResponse.text();
            throw new Error(`Failed to download video: ${videoResponse.statusText}. Details: ${errorText}`);
        }
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        return { type: 'video', data: videoUrl };
    } catch (e) {
        console.error("Error generating video:", e);
        if ((e as Error).message.includes("Requested entity was not found.")) {
            if(window.aistudio) {
                // Don't await this, let the user re-trigger
                window.aistudio.openSelectKey();
            }
            return {
                type: 'video', data: '',
                error: "Authentication failed. Please select your API key again and retry."
            };
        }
        return { type: 'video', data: '', error: (e as Error).message };
    }
};
