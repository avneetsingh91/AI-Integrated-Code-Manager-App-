import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/enhance', verifyToken, async (req, res) => {
  try {
    const { code, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fullPrompt = `
      You are an expert coding assistant.
      Here is the code:
      \`\`\`
      ${code}
      \`\`\`
      
      User instruction: ${prompt}
      
      Please provide ONLY the updated code without markdown code blocks or explanations, unless explicitly asked for comments. 
      Just the raw code that replaces the input.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    // Strip markdown code blocks if Gemini adds them
    text = text.replace(/^```\w*\n/, '').replace(/\n```$/, '');

    res.json({ enhancedCode: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Error enhancing code', error });
  }
});

export default router;
