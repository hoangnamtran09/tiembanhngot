import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Graceful fallback if no key is present, though the prompt implies it will be there.
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("API_KEY is missing from environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const askGeminiAssistant = async (prompt: string, contextData: string) => {
  try {
    const ai = getAIClient();
    const systemInstruction = `
      Bạn là một trợ lý ảo thông minh chuyên về làm bánh và quản lý tiệm bánh nhỏ (Home Bakery).
      Tên của bạn là "Bếp Phó AI".
      
      Nhiệm vụ của bạn:
      1. Gợi ý công thức làm bánh dựa trên nguyên liệu có sẵn.
      2. Tính toán giá vốn (cost) và gợi ý giá bán để có lãi.
      3. Viết nội dung quảng cáo (marketing) cho các món bánh.
      4. Giải đáp các thắc mắc kỹ thuật làm bánh (ví dụ: tại sao bánh bị xẹp, cách đánh bông lòng trắng trứng).
      
      Dữ liệu hiện tại của cửa hàng (dưới dạng JSON string):
      ${contextData}

      Hãy trả lời ngắn gọn, thân thiện, dùng tiếng Việt tự nhiên. Nếu gợi ý công thức, hãy liệt kê nguyên liệu rõ ràng.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, hiện tại Bếp Phó đang bị quá tải. Vui lòng thử lại sau hoặc kiểm tra API Key.";
  }
};
