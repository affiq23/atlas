import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { destination, startDate, endDate, preferences } =
      await request.json();

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create a prompt for OpenAI
    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.
      ${preferences ? `Consider these preferences: ${preferences}\n` : ""}
      Format your response EXACTLY as follows for EACH day:

      ### Day 1: [Day Title]

      # Must-Visit Attractions and Landmarks
      - [Attraction 1]: [Brief description]
      - [Attraction 2]: [Brief description]
      - [Attraction 3]: [Brief description]


      # Local Food and Restaurants
      - [Restaurant/Food 1]: [Brief description]
      - [Restaurant/Food 2]: [Brief description]
      - [Restaurant/Food 3]: [Brief description]

      # Cultural Experiences and Activities
      - [Activity 1]: [Brief description]
      - [Activity 2]: [Brief description]
      - [Activity 3]: [Brief description]

      After all days, include these sections:

      # Best Areas to Stay
      - [Area 1]: [Brief description]
      - [Area 2]: [Brief description]

      # Transportation Tips
      - [Tip 1]: [Brief description]
      - [Tip 2]: [Brief description]

      IMPORTANT FORMATTING RULES:
      1. Use ### for day headers (e.g., ### Day 1: Downtown Exploration)
      2. Use # for section headers (exactly as shown above)
      3. Use - for list items
      4. Keep descriptions concise and clear
      5. Do not use any other markdown formatting
      6. Maintain consistent spacing
      7. Include all sections for each day`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a travel planning assistant. You MUST follow the exact formatting specified in the prompt. Do not deviate from the format or add any extra sections. Each response should be consistently structured for easy parsing.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Process the response
    const suggestions =
      completion.choices[0].message.content
        ?.split("\n")
        .filter((line) => line.trim().length > 0) ?? [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
