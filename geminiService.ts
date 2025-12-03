
import { GoogleGenAI, Type } from "@google/genai";
import { Poll, GeneratedPersona, LeadershipProfile } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateUserPersona = async (votingHistory: { question: string; choice: string; category: string }[]): Promise<GeneratedPersona> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock persona.");
    return {
      title: "The Silent Observer",
      description: "You are waiting for the right moment to speak. Add an API Key to unlock true insight.",
      tags: ["#Mystery", "#Observer", "#Unanalyzed"],
      archetype: "Neutral"
    };
  }

  const prompt = `
    Analyze the following voting history of a user on a social polling app.
    Based on their choices, construct a psychological persona profile.
    
    History:
    ${JSON.stringify(votingHistory)}
    
    Return a JSON object with:
    - title: A cool, slightly edgy 2-3 word title (e.g., "Chaos Agent", "Rational Architect", "Empathic Soul").
    - description: A 2-sentence deep dive into their psyche. Be bold, slightly astrological but grounded in the data.
    - tags: 3 hashtags that describe their vibe.
    - archetype: One word summary (e.g., "Leader", "Rebel", "Analyst").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            archetype: { type: Type.STRING },
          },
          required: ["title", "description", "tags", "archetype"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedPersona;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "The Enigma",
      description: "Your patterns are too complex for the current simulation. Or the AI is taking a nap.",
      tags: ["#Complex", "#Error", "#Human"],
      archetype: "Unknown"
    };
  }
};

export const generatePollInsight = async (pollQuestion: string, winningOption: string): Promise<string> => {
    if (!process.env.API_KEY) return "Society is divided, as always.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The poll question was "${pollQuestion}". The winning option is "${winningOption}". Give me a one-sentence witty, slightly cynical or profound observation about society based on this result.`,
        });
        return response.text || "Interesting trend.";
    } catch (e) {
        return "Data unclear.";
    }
}

export const predictFutureTrend = async (question: string, options: { text: string }[]): Promise<{ predictionText: string; predictedOptions: { text: string; percentage: number }[] }> => {
    if (!process.env.API_KEY) {
        return {
            predictionText: "The future is offline. Connect API Key to see the timeline.",
            predictedOptions: options.map(o => ({ text: o.text, percentage: Math.round(100 / options.length) }))
        };
    }

    const prompt = `
      Analyze this poll question: "${question}"
      Options: ${options.map(o => o.text).join(', ')}
      
      Predict the distribution of votes 5 years from now based on current societal and technological trends.
      Return JSON with:
      - predictionText: A 1-2 sentence explanation of why the shift occurred.
      - predictedOptions: Array of { text, percentage } where text matches original options and percentage is the integer future share (0-100).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        predictionText: { type: Type.STRING },
                        predictedOptions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    percentage: { type: Type.INTEGER }
                                },
                                required: ["text", "percentage"]
                            }
                        }
                    },
                    required: ["predictionText", "predictedOptions"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("Empty response");
    } catch (e) {
        console.error("Prediction Error:", e);
        return {
            predictionText: "Timeline clouded.",
            predictedOptions: options.map(o => ({ text: o.text, percentage: Math.round(100 / options.length) }))
        };
    }
}

// --- ELECTION MODULE AI ---

export const evaluateCandidate = async (
    username: string,
    manifesto: string, 
    background: string,
    activitySummary: string // Passed from backend or frontend
): Promise<LeadershipProfile> => {
    if (!process.env.API_KEY) {
        return {
            personalitySummary: "Mock Profile: API Key Missing. A determined individual with hidden potential.",
            strengths: ["Resilience", "Ambition", "Technological Adaptability"],
            weaknesses: ["Transparency", "Experience"],
            leadershipStyle: "Strategic",
            agendaScore: 75
        };
    }

    const prompt = `
        Evaluate this candidate for an online election.
        Candidate: ${username}
        Manifesto: "${manifesto}"
        Background: "${background}"
        Platform Activity Style: "${activitySummary}"

        Analyze their leadership potential.
        Return JSON with:
        - personalitySummary: 2 sentences describing their political persona.
        - strengths: 3 key leadership strengths.
        - weaknesses: 2 potential pitfalls.
        - leadershipStyle: One of ['Visionary', 'Strategic', 'Aggressive', 'Diplomatic', 'Servant'].
        - agendaScore: A number 0-100 representing how well their manifesto aligns with modern digital society values.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        personalitySummary: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        leadershipStyle: { type: Type.STRING, enum: ['Visionary', 'Strategic', 'Aggressive', 'Diplomatic', 'Servant'] },
                        agendaScore: { type: Type.NUMBER }
                    },
                    required: ["personalitySummary", "strengths", "weaknesses", "leadershipStyle", "agendaScore"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as LeadershipProfile;
        }
        throw new Error("No text in response");
    } catch (e) {
        console.error("Evaluation Error", e);
        return {
            personalitySummary: "Evaluation unavailable due to neural network congestion.",
            strengths: ["Unknown"],
            weaknesses: ["Unknown"],
            leadershipStyle: "Diplomatic",
            agendaScore: 50
        };
    }
}
