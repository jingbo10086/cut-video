
import { GoogleGenAI, Type } from "@google/genai";
import { MagicMoment } from "../types";

export class GeminiService {
  // Always initialize GoogleGenAI inside the method call to ensure the latest API key is used
  async analyzeVideo(videoBase64: string, mimeType: string): Promise<MagicMoment[]> {
    // Fixed: Initialize GoogleGenAI using a named parameter and direct access to process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        // Use gemini-3-pro-preview for complex multimodal reasoning tasks
        model: 'gemini-3-pro-preview',
        // Fixed: Use the recommended single Content object structure for contents
        contents: {
          parts: [
            {
              inlineData: {
                data: videoBase64,
                mimeType: mimeType
              }
            },
            {
              text: "请深度分析这段课堂视频。识别出所有学生表现出色、回答准确且自信的“高光时刻”。请提取出多个（通常为 3-5 个）最精彩的片段。为每个片段提供起止时间、一段精彩的中文总结以及学生在该片段中的核心发言字幕。请严格按照 JSON 数组格式返回。"
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "唯一标识符（如 moment_1）"
                },
                start: {
                  type: Type.NUMBER,
                  description: "高光时刻的开始时间（秒）。"
                },
                end: {
                  type: Type.NUMBER,
                  description: "高光时刻的结束时间（秒）。"
                },
                summary: {
                  type: Type.STRING,
                  description: "对该瞬间的简短、精彩的中文描述。"
                },
                subtitle: {
                  type: Type.STRING,
                  description: "学生在此高光时刻所说的原话转录（中文）。"
                }
              },
              required: ["id", "start", "end", "summary", "subtitle"]
            }
          }
        }
      });

      // Fixed: Directly access the .text property from GenerateContentResponse as per guidelines
      const jsonStr = response.text || '[]';
      return JSON.parse(jsonStr) as MagicMoment[];
    } catch (error) {
      console.error("Gemini 分析错误:", error);
      throw new Error("视频分析失败。请确保文件格式正确且 API 密钥有效。如果视频非常大，Gemini 可能需要更多时间。");
    }
  }
}

export const geminiService = new GeminiService();
