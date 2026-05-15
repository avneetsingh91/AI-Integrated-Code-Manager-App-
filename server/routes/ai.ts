import express from 'express';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/enhance', verifyToken, async (req, res) => {
  try {
    const { code, prompt } = req.body;
    
    if (!code || !prompt) {
      return res.status(400).json({ message: 'Code and prompt are required' });
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenRouter API key not configured' });
    }

    const fullPrompt = `You are an expert coding assistant.
      Here is the code:
      \`\`\`
      ${code}
      \`\`\`
      
      User instruction: ${prompt}
      
      Please provide ONLY the updated code without markdown code blocks or explanations, unless explicitly asked for comments. 
      Just the raw code that replaces the input.`;

    console.log('Sending request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AiCodeManager'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{
          role: 'user',
          content: fullPrompt
        }],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('OpenRouter error response:', responseText);
      throw new Error(`OpenRouter API error (${response.status}): ${responseText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response data:', JSON.stringify(data).substring(0, 200));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from OpenRouter');
    }
    
    let text = data.choices[0].message.content;
    
    // Strip markdown code blocks if present
    text = text.replace(/^```\w*\n/, '').replace(/\n```$/, '');

    res.json({ enhancedCode: text });
  } catch (error: any) {
    console.error('OpenRouter API Error:', error?.message || error);
    
    // Handle rate limit errors
    if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
      return res.status(429).json({ 
        message: 'API rate limit exceeded. Please try again in a moment.',
        details: 'Free tier has rate limits. Please wait before making another request.'
      });
    }
    
    res.status(500).json({ 
      message: 'Error enhancing code', 
      details: error?.message || 'Unknown error occurred'
    });
  }
});

export default router;
