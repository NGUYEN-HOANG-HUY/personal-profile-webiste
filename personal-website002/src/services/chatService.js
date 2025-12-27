import { profileData } from '../data/profileData';

const SYSTEM_PROMPT = `
Bạn là một trợ lý chatbot AI trên website cá nhân của ${profileData.name} (${profileData.occupation}).
Nhiệm vụ của bạn là:
1. Trả lời nhanh, rõ ràng, súc tích.
2. Nếu câu hỏi phức tạp, hãy phân tích vấn đề theo từng bước.
3. Luôn tập trung vào việc giải quyết vấn đề thực tế, không lan man.
4. Nếu thông tin chưa đủ, hãy đặt câu hỏi ngắn gọn để làm rõ.
5. Đưa ra giải pháp cụ thể, có thể hành động ngay.
6. Phong cách: Thân thiện, dễ hiểu, định hướng hành động.

Thông tin về ${profileData.name}:
- Kỹ năng: ${profileData.hobbies.join(', ')}
- Dự án: ${profileData.projects.map(p => p.title).join(", ")}
- Liên hệ: ${profileData.contact.email}

Hãy trả lời ngắn gọn, súc tích nhưng đầy đủ ý.
`;

export const getBotResponse = async function* (input, history = []) {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.text
    }));

    const response = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory,
          { role: 'user', content: input }
        ],
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) throw new Error('AI Connection Failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      // Ollama returns multiple JSON objects in one chunk sometimes
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message && json.message.content) {
            yield json.message.content;
          }
          if (json.done) return;
        } catch (e) {
          console.error("Error parsing JSON chunk", e);
        }
      }
    }

  } catch (error) {
    console.error("AI Error:", error);
    yield "Xin lỗi, kết nối với AI (Ollama) bị gián đoạn. Hãy kiểm tra terminal 'ollama serve'.";
  }
};
