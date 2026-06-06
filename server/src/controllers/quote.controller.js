import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMotivationalQuote = asyncHandler(async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt =
      'Generate a short, insightful, and motivational quote for someone trying to be productive. The quote should be one or two sentences long. Provide only the quote and the author\'s name in the format: "Quote text" - Author';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parts = text.split('" - ');
    const quoteText = parts[0]?.replace(/"/g, "").trim();
    const author = parts[1]?.trim() || "AI";

    if (!quoteText) {
      throw new ApiError(500, "Failed to parse the generated quote.");
    }

    const quote = {
      text: quoteText,
      author: author,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, quote, "Quote generated successfully"));
  } catch (error) {
    console.error("Error generating quote:", error);
    
    const fallbackQuotes = [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
      { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
      { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" }
    ];
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    return res
      .status(200)
      .json(new ApiResponse(200, randomQuote, "Fallback quote used due to AI service unavailability."));
  }
});

export { generateMotivationalQuote };
