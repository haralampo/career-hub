// src/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true 
});

export async function getJobAdvice(role: string, company: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `IMPORTANT: Do not use any leading spaces, tabs, or indentation. 
          Start every line exactly at the left margin. 
          You are an expert recruiter. Format your response exactly like this:
          
          QUESTIONS:
          1. [Question 1]
          2. [Question 2]
          3. [Question 3]
          
          PRO-TIP:
          [One sentence tip]` 
        },
        { role: "user", content: `Job: ${role} at ${company}` }
      ],
    });

    // Return the string or an empty string if null
    return response.choices[0].message.content || "No advice found.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error fetching from OpenAI.";
  }
}