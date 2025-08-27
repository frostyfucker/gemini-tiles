import { GoogleGenAI } from "@google/genai";
import type { Part } from "@google/genai";


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a multi-modal analysis expert. Your goal is to analyze the user's inputs (text, images from camera or screen share) and provide a concise, insightful textual response.

When the user's prompt implies a desire for 3D visualization of objects in the scene (e.g., asks to 'describe the scene in 3D', 'identify objects', or asks for a JSON representation), you MUST follow your text response with a JSON code block.

The JSON should be an array of objects. Each object represents a distinct element in the scene and must have the following properties:
- "geometry": A primitive shape (e.g., "box", "sphere", "cylinder", "plane").
- "color": A hex color string (e.g., "#FF0000").
- "position": An array of three numbers [x, y, z] for the object's position.

Optionally, you can also include:
- "scale": An array of three numbers [x, y, z] for the object's scale.
- "rotation": An array of three numbers [x, y, z] for the object's rotation in degrees.

Example JSON response:
\`\`\`json
[
  {
    "geometry": "box",
    "color": "#4CC3D9",
    "position": [0, 1.5, -3],
    "scale": [1, 1, 1],
    "rotation": [0, 45, 0]
  }
]
\`\`\`
Provide only the text analysis and the JSON block when appropriate. Do not add extra commentary about the JSON itself.`;

export async function analyzeContent(prompt: string, base64Images: string[]): Promise<string> {
    try {
        const imageParts: Part[] = base64Images.map(imgData => {
            const [header, data] = imgData.split(',');
            if (!header || !data) {
                throw new Error("Invalid base64 image data format.");
            }
            const mimeTypeMatch = header.match(/data:(image\/\w+);base64/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) {
                throw new Error("Could not determine MIME type from base64 string.");
            }

            return {
                inlineData: {
                    mimeType: mimeTypeMatch[1],
                    data: data,
                },
            };
        });
        
        const textPart: Part = { text: prompt };

        const allParts = [textPart, ...imageParts];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: allParts },
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Gemini API Error: ${error.message}`));
        }
        return Promise.reject(new Error("An unknown error occurred while contacting the Gemini API."));
    }
}