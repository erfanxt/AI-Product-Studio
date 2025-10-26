
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { GenerationType, AspectRatio } from "../types";

const getAspectRatioDescription = (ratio: AspectRatio): string => {
  const mapping = {
    '1:1': 'Ensure the final output has a square (1:1) aspect ratio.',
    '9:16': 'Ensure the final output has a vertical (9:16) aspect ratio, perfect for stories and reels.',
    '16:9': 'Ensure the final output has a widescreen (16:9) aspect ratio, suitable for web banners or video thumbnails.',
    '3:4': 'Ensure the final output has a portrait (3:4) aspect ratio.'
  };
  return mapping[ratio] || '';
};


const photoPromptSchema = {
    type: Type.OBJECT,
    properties: {
        scene_description: { type: Type.STRING, description: "A detailed description of the environment and background." },
        lighting: { type: Type.STRING, description: "Describe the lighting of the scene (e.g., soft morning light, dramatic studio lighting)." },
        mood: { type: Type.STRING, description: "The overall feeling or vibe of the image (e.g., luxurious, natural, modern)." },
        props: { type: Type.STRING, description: "Subtle supporting elements or props in the scene." },
    },
    required: ["scene_description", "lighting", "mood", "props"]
};

export const generateCreativeConcept = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    base64ImageData: string,
    mimeType: string,
    productHint: string,
    generationType: GenerationType.Photo | GenerationType.SocialPost
): Promise<string> => {
     try {
        // FIX: Initialize with API_KEY from process.env.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const purpose = "a professional, eye-catching lifestyle photo";

        const systemInstruction = `You are an expert creative director. Analyze the user's product image and generate a creative concept for ${purpose}. Respond with a JSON object following the specified schema. The concept should be detailed, compelling, and highly descriptive. ${productHint ? `The user specifies the product is: "${productHint}".` : ""}`;
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: 'Analyze this product and generate a creative concept.' },
                ],
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: photoPromptSchema,
            },
        });

        const conceptJson = JSON.parse(response.text);
        // Return pretty-printed JSON for the user to edit
        return JSON.stringify(conceptJson, null, 2);

    } catch (error) {
        console.error("Error generating creative concept:", error);
        throw new Error("Failed to generate an AI concept. Please try again or write your own.");
    }
};


export const generateCampaignStrategy = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    base64ImageData: string,
    mimeType: string,
    productHint: string,
): Promise<any> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const systemInstruction = `You are an expert AI marketing strategist. Your task is to generate a complete marketing campaign strategy based on the user's uploaded product image.
The strategy must be a JSON object with the specified schema.
It must include:
1.  **Three distinct photo concepts**: Each should have a unique theme (e.g., one lifestyle, one minimalist, one abstract).
2.  **Three social media captions**: One for Instagram, one for Facebook, and one for X (formerly Twitter), each with relevant hashtags.
${productHint ? `The user has specified that the product is: "${productHint}".` : ""}`;

    try {
        const response = await ai.models.generateContent({
            model: modelName, // Using user selected model
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: "Analyze this product and generate a full campaign strategy." }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        photo_concepts: {
                            type: Type.ARRAY,
                            description: "An array of 3 unique photo concepts.",
                            items: photoPromptSchema,
                        },
                        social_captions: {
                            type: Type.ARRAY,
                            description: "An array of 3 social media captions for different platforms.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    platform: { type: Type.STRING },
                                    caption: { type: Type.STRING },
                                },
                                required: ["platform", "caption"],
                            },
                        },
                    },
                    required: ["photo_concepts", "social_captions"],
                },
            },
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error generating campaign strategy:", error);
        throw new Error("Failed to generate a campaign strategy. The AI may be experiencing high load. Please try again later.");
    }
};

const generateInstagramCaption = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    base64ImageData: string,
    mimeType: string,
    productHint: string
): Promise<string> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const systemInstruction = `You are an expert Instagram social media manager for a high-end e-commerce brand.
Analyze the provided product image and generate a complete, algorithm-friendly Instagram caption.
The caption must be returned as a JSON object with the specified schema.
It must contain:
1.  **hook**: A short, scroll-stopping first line (max 125 characters) that grabs attention. Use an emoji.
2.  **body**: A descriptive paragraph that highlights the product's benefits and creates desire. Use 2-3 relevant emojis.
3.  **cta**: A clear call-to-action that encourages engagement or purchase (e.g., "Shop the link in bio," "Comment your favorite color").
4.  **hashtags**: A string of 10-15 relevant, well-researched hashtags, mixing popular and niche tags. Start with a newline and separate with spaces.
${productHint ? `The user has specified that the product is: "${productHint}".` : ""}`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: "Analyze this product and generate an Instagram caption." }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hook: { type: Type.STRING },
                        body: { type: Type.STRING },
                        cta: { type: Type.STRING },
                        hashtags: { type: Type.STRING },
                    },
                    required: ["hook", "body", "cta", "hashtags"],
                },
            },
        });
        
        const captionJson = JSON.parse(response.text);
        return `${captionJson.hook}\n\n${captionJson.body}\n\n${captionJson.cta}\n\n${captionJson.hashtags}`;
    } catch (error) {
        console.error("Error generating Instagram caption:", error);
        throw new Error("Failed to generate an Instagram caption. Please try again.");
    }
};

export const generateProductPhoto = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    aspectRatio: AspectRatio,
    referenceImageBase64?: string | null
): Promise<string> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
        const aspectRatioInstruction = getAspectRatioDescription(aspectRatio);

        const parts: any[] = [
            { inlineData: { data: base64ImageData, mimeType: mimeType } },
        ];

        let textPrompt = `${aspectRatioInstruction} Generate a photorealistic, trendy, and professional product image based on the user's uploaded product. Style: ${prompt}`;

        if (referenceImageBase64) {
            parts.push({
                inlineData: {
                    data: referenceImageBase64,
                    // The API is robust enough to handle common image types without a precise mimeType.
                    mimeType: 'image/jpeg',
                },
            });
            textPrompt += " Use the second image provided as a strong reference for style, lighting, and overall aesthetic.";
        }
        
        parts.push({ text: textPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image was generated by the API.");
    } catch (error) {
        console.error("Error generating product photo:", error);
        throw new Error("Failed to generate product photo. Please check the console for details.");
    }
};

export const editProductPhoto = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    referenceImageBase64?: string | null
): Promise<string> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
         const parts: any[] = [
            { inlineData: { data: base64ImageData, mimeType: mimeType, }, },
        ];

        let textPrompt = prompt;

        if (referenceImageBase64) {
            parts.push({
                inlineData: {
                    data: referenceImageBase64,
                    mimeType: 'image/jpeg',
                },
            });
            textPrompt += " Use the second image as a strong reference for style and aesthetic when applying this edit.";
        }

        parts.push({ text: textPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // This feature is specific to this model
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No edited image was generated by the API.");
    } catch (error) {
        console.error("Error editing product photo:", error);
        throw new Error("Failed to edit product photo. Please check your prompt and try again.");
    }
};

export const validateGeneratedImage = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    originalImageBase64: string,
    originalMimeType: string,
    generatedImageBase64: string,
): Promise<{ isValid: boolean; reason: string; }> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
        const systemInstruction = `You are a strict Quality Assurance specialist for an AI image generator. Your task is to compare two images: the 'Original Product' and the 'Generated Scene'. You must determine if the generated image meets quality standards.

Return a JSON object with the specified schema.

Set 'isValid' to false if ANY of the following critical issues are found:
1.  **Cropping:** The main product is visibly cut-off, cropped, or incomplete in the 'Generated Scene'.
2.  **Distortion/Artifacts:** The product or its surroundings have severe visual glitches, unrealistic warping, or distracting artifacts.
3.  **Inconsistency:** The product in the 'Generated Scene' looks like a completely different item compared to the 'Original Product' (e.g., different shape, core features are missing). Minor changes in angle or lighting are acceptable, but the core identity must be the same.

If none of these critical issues are present, set 'isValid' to true. Provide a brief, one-sentence explanation for your decision in the 'reason' field.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: originalImageBase64, mimeType: originalMimeType } },
                    { text: "Original Product" },
                    { inlineData: { data: generatedImageBase64, mimeType: 'image/png' } },
                    { text: "Generated Scene" }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING },
                    },
                    required: ["isValid", "reason"]
                },
            },
        });
        
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;

    } catch (error) {
        console.error("Error during image validation:", error);
        // Default to valid to avoid blocking generation if the validation process itself fails.
        return { isValid: true, reason: "Validation process failed, approving image by default." };
    }
};

export const validateGeneratedText = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    originalImageBase64: string,
    originalMimeType: string,
    generatedText: string,
): Promise<{ isValid: boolean; reason: string; }> => {
    // FIX: Initialize with API_KEY from process.env.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    try {
        const systemInstruction = `You are a Quality Assurance specialist. Analyze the product image and the accompanying text. Your task is to determine if the text is relevant to the product shown. The text should not describe a completely different item or be nonsensical.

Return a JSON object with the specified schema: { "isValid": boolean, "reason": "A brief, one-sentence explanation for your decision." }`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: originalImageBase64, mimeType: originalMimeType } },
                    { text: `Is the following text relevant to the product in the image?\n\nText: "${generatedText}"` }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isValid: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING },
                    },
                    required: ["isValid", "reason"]
                },
            },
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error during text validation:", error);
        return { isValid: true, reason: "Validation process failed, approving by default." };
    }
};

export const regenerateInvalidCaption = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    base64ImageData: string,
    mimeType: string,
    productHint: string,
    invalidCaption: string,
    validationReason: string,
): Promise<string> => {
     // FIX: Initialize with API_KEY from process.env.
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
     const systemInstruction = `You are an expert Instagram social media manager. A previously generated caption for the product in the image was rejected by QA for the following reason: "${validationReason}".
The rejected caption was: "${invalidCaption}".
Please analyze the product image and write a new, high-quality, and relevant caption that corrects the issue.
Return a JSON object with 'hook', 'body', 'cta', and 'hashtags'.
${productHint ? `The user has specified that the product is: "${productHint}".` : ""}`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: "Generate a corrected Instagram caption based on the instructions." }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { hook: { type: Type.STRING }, body: { type: Type.STRING }, cta: { type: Type.STRING }, hashtags: { type: Type.STRING }, },
                    required: ["hook", "body", "cta", "hashtags"],
                },
            },
        });
        
        const captionJson = JSON.parse(response.text);
        return `${captionJson.hook}\n\n${captionJson.body}\n\n${captionJson.cta}\n\n${captionJson.hashtags}`;

    } catch (error) {
        console.error("Error regenerating caption:", error);
        // Fallback to original if regeneration fails
        return invalidCaption;
    }
}

export const generateAndValidateCaption = async (
    // FIX: Removed apiKey parameter. API key is now read from environment variables.
    modelName: string,
    base64ImageData: string,
    mimeType: string,
    productHint: string
): Promise<string> => {
    const MAX_RETRIES = 2;
    let lastReason = "Generation failed.";
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // FIX: Removed apiKey from service call.
            const caption = await generateInstagramCaption(modelName, base64ImageData, mimeType, productHint);
            // FIX: Removed apiKey from service call.
            const validation = await validateGeneratedText(modelName, base64ImageData, mimeType, caption);
            if (validation.isValid) {
                return caption;
            }
            lastReason = validation.reason;
            console.warn(`Caption validation failed (Attempt ${i + 1}/${MAX_RETRIES}): ${lastReason}. Retrying...`);
        } catch (err) {
             if (err instanceof Error) lastReason = err.message;
             console.error(`Caption generation attempt ${i+1} failed`, err);
        }
    }
    throw new Error(`Failed to generate a valid caption. Last reason: ${lastReason}`);
};
