import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes an image to produce a detailed visual description (script).
 */
export const generateFaceScript = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this image and write a highly detailed visual description (script) of the person's face. 
            Focus on facial structure, skin tone, specific eye details, hair texture and color, distinctive features, expression, and lighting. 
            The output should be a single, high-quality prompt suitable for an AI image generator to recreate a similar style portrait.`
          }
        ]
      }
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Error analyzing face:", error);
    throw new Error("Failed to generate script from image.");
  }
};

/**
 * Generates an AI avatar based on the text script.
 */
export const generateAvatarFromScript = async (script: string): Promise<string> => {
  try {
    // Using gemini-2.5-flash-image for image generation as per guidelines for general tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: script + " --aspect-ratio 1:1 --style photorealistic masterpiece"
          }
        ]
      }
    });

    // Extract image from response parts
    // The response candidates content parts will contain the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content returned from image generation.");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw new Error("Failed to generate image from script.");
  }
};