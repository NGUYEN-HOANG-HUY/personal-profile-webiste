import { profileData } from '../data/profileData';

// Simple keyword matching for "AI" behavior
// Support varying questions in English and Vietnamese
export const getBotResponse = (input) => {
  const lowerInput = input.toLowerCase();

  // Greetings
  if (lowerInput.match(/(hello|hi|hey|xin chào|chào)/)) {
    return "Hello! I am Huy's AI Assistant. How can I help you today? (Xin chào! Tôi là trợ lý AI của Huy. Tôi có thể giúp gì cho bạn?)";
  }

  // Identity
  if (lowerInput.match(/(who are you|bạn là ai|what can you do)/)) {
    return "I am an AI assistant integrated into this website to answer questions about Nguyen Hoang Huy. You can ask about his projects, skills, or how to contact him.";
  }

  // Name/Owner
  if (lowerInput.match(/(who is huy|vn|about huy|tên gì|name)/)) {
    return `This website belongs to ${profileData.name}, a ${profileData.occupation}.`;
  }

  // Skills/Tech
  if (lowerInput.match(/(skill|tech|stack|giỏi|công nghệ|biết làm gì)/)) {
    return `Huy is skilled in: ${profileData.hobbies.join(', ')} (and more!). He mainly works with React, Node.js, and modern web tech.`;
  }

  // Projects
  if (lowerInput.match(/(project|work|portfolio|dự án|làm được gì)/)) {
    const projectTitles = profileData.projects.map(p => p.title).join(", ");
    return `Huy has worked on projects like: ${projectTitles}. Check out the Portfolio section for more details!`;
  }

  // Contact
  if (lowerInput.match(/(contact|email|phone|liên hệ|gọi|mess)/)) {
    return `You can contact Huy via email at ${profileData.contact.email} or connect on LinkedIn/GitHub.`;
  }

  // Hobbies
  if (lowerInput.match(/(hobby|hobbies|like|love|sở thích|thích gì)/)) {
    return `Huy enjoys: ${profileData.hobbies.join(', ')}.`;
  }

  // Default
  return "I'm not sure I understand. Try asking about 'projects', 'skills', or 'contact'. (Tôi chưa hiểu rõ. Hãy thử hỏi về 'dự án', 'kỹ năng', hoặc 'liên hệ' nhé.)";
};
