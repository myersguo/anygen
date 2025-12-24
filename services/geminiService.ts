
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * CORE TOOL EXPORTS
 */

export const generateSlides = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5–7 presentation slides on: ${topic}. JSON output.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } },
            layout: { type: Type.STRING }
          },
          required: ["title", "content", "layout"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateDoc = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text || "";
};

export const researchWeb = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Source",
    uri: chunk.web?.uri || ""
  })).filter((s: any) => s.uri) || [];
  return { text, sources };
};

export const generateStory = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a children's story about: ${topic}. Break it into 4-6 pages. For each page, provide the text of the story and a detailed visual prompt for an image generator. Output as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["text", "imagePrompt"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateImage = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    }
  });
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

export const analyzeData = async (input: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the following data and provide a summary of key insights and structure it for a chart. Data: ${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          chartType: { type: Type.STRING, description: "The type of chart: bar, line, or pie" },
          chartData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["label", "value"]
            }
          }
        },
        required: ["summary", "chartType", "chartData"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const summarizeAudio = async (base64Data: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: "Please provide a concise and professional summary of this audio recording." }
      ]
    }
  });
  return response.text || "";
};

/**
 * AGENT ORCHESTRATION TOOLS
 */

export const toolsDeclarations: FunctionDeclaration[] = [
  {
    name: "researchWeb",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "The search query to research on the web." }
      },
      required: ["query"]
    },
    description: "Search the web for up-to-date information, news, or specific data."
  },
  {
    name: "generateDoc",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: "The content or requirement for the document." }
      },
      required: ["prompt"]
    },
    description: "Write a professional document, report, or creative text."
  },
  {
    name: "generateSlides",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING, description: "The topic for the presentation slides." }
      },
      required: ["topic"]
    },
    description: "Generate a presentation structure with slide titles and bullet points."
  },
  {
    name: "directResponse",
    parameters: {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING, description: "The message to send directly to the user." }
      },
      required: ["message"]
    },
    description: "Used for greetings, common sense answers, or small talk where no complex research or document generation is needed."
  }
];

export const createInitialPlan = async (goal: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are a world-class AI Project Manager and Assistant. 
Analyze the user's input: "${goal}"

DECISION CRITERIA:
1. If the input is a greeting (e.g., "Hi", "Hello"), a simple question (e.g., "What is 2+2?"), or small talk, use the 'directResponse' tool as a SINGLE task.
2. If the input is a complex objective (e.g., "Research X and write a report"), decompose it into 2-5 tasks using researchWeb, generateDoc, or generateSlides.

Format: JSON object with "objective" (string) and "tasks" (array of {id, description, tool}).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objective: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
                tool: { type: Type.STRING, enum: ["researchWeb", "generateDoc", "generateSlides", "directResponse"] }
              },
              required: ["id", "description", "tool"]
            }
          }
        },
        required: ["objective", "tasks"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const executeAgentStep = async (task: string, tool: string, context: string) => {
  if (tool === 'directResponse') {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Task: ${task}\nSystem Context: You are a friendly AI Agent. Provide a direct, helpful response to the user's request. Context so far: ${context}`,
    });
    return response.text || "Hello! How can I help you today?";
  }
  if (tool === 'researchWeb') return await researchWeb(task + "\nContext: " + context);
  if (tool === 'generateDoc') return await generateDoc(task + "\nContext: " + context);
  if (tool === 'generateSlides') return await generateSlides(task + "\nContext: " + context);
  return "Tool not found";
};
