const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// System prompt — short, direct, example-driven answers
const PRODUCT_CHAT_SYSTEM_PROMPT = `You are a sharp, no-nonsense AI assistant on CampusLoop, a student marketplace. A student is viewing a product listing and has a question.

Rules:
- Answer in 2–3 sentences MAX. No fluff, no padding, no intros like "Great question!".
- Always end with one short, concrete real-world example relevant to a student (e.g., "e.g., for a B.Tech student, this is useful for numerical methods and matrix calculations").
- Use the product context if it helps. Skip it if the question is general.
- Never fabricate specs or prices. If you don't know something specific, say so in one line.
- Tone: confident, direct, helpful — like advice from a smart senior student.`;

/**
 * Ask Gemini a question about a specific product listing.
 * @param {Object} productContext - Safe product fields (no PII)
 * @param {string} userMessage - The student's question
 * @returns {Promise<string>} - Gemini's text response
 */
const chatAboutProduct = async (productContext, userMessage) => {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: PRODUCT_CHAT_SYSTEM_PROMPT,
  });

  // Assemble structured context – keep it short to minimize tokens
  const contextBlock = `
PRODUCT LISTING DETAILS:
- Title: ${productContext.title}
- Price: ₹${productContext.price} (Listing type: ${productContext.listingType})
- Category: ${productContext.category}
- Condition: ${productContext.condition}
- Description: ${productContext.description || 'No description provided'}
- Campus Pickup Location: ${productContext.location}
- Seller Rating: ${productContext.sellerRating ? `${productContext.sellerRating}/5` : 'No ratings yet'} (${productContext.sellerRatingsCount || 0} reviews)
- Verified Student Seller: ${productContext.sellerVerified ? 'Yes' : 'No'}

STUDENT QUESTION: ${userMessage}
`.trim();

  const result = await model.generateContent(contextBlock);
  return result.response.text();
};

module.exports = { chatAboutProduct };
