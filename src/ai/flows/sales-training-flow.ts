
'use server';
/**
 * @fileOverview A sales training AI agent that simulates customer interactions.
 * 
 * - salesTrainingAgent - A function that handles the role-playing interaction.
 * - SalesTrainingInput - The input type for the salesTrainingAgent function.
 * - SalesTrainingOutput - The return type for the salesTrainingAgent function.
 */

import { ai, geminiPro } from '@/ai/genkit';
import { z } from 'genkit/zod';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const SalesTrainingInputSchema = z.object({
    scenario: z.string().describe("The sales scenario provided by the user. The agent will role-play the customer described in this scenario."),
    history: z.array(MessageSchema).describe("The history of the conversation so far."),
    userMessage: z.string().describe("The latest message from the user (the sales trainee)."),
});
export type SalesTrainingInput = z.infer<typeof SalesTrainingInputSchema>;

export const SalesTrainingOutputSchema = z.object({
    response: z.string().describe("The agent's response, role-playing as the customer."),
});
export type SalesTrainingOutput = z.infer<typeof SalesTrainingOutputSchema>;

export async function salesTrainingAgent(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
    return salesTrainingFlow(input);
}

const salesTrainingFlow = ai.defineFlow(
    {
        name: 'salesTrainingFlow',
        inputSchema: SalesTrainingInputSchema,
        outputSchema: SalesTrainingOutputSchema,
    },
    async ({ scenario, history, userMessage }) => {

        const systemPrompt = `
            You are a sales training assistant for Jewson, a UK builders merchant.
            Your task is to role-play as a customer based on a scenario provided by a sales trainee.
            You must be a realistic and challenging conversational partner to help them practice their skills.

            **Your Persona and Rules:**
            1.  **Stay in Character:** You are NOT an AI assistant. You are the customer described in the scenario. Do not break character.
            2.  **Adhere to the Scenario:** Your personality, motivations, and knowledge are strictly defined by the scenario. The scenario is: "${scenario}".
            3.  **Be Conversational:** Respond naturally. If the trainee asks a question, answer it from the customer's perspective. If they make a statement, react to it.
            4.  **Be Realistic (UK Context):** Use UK-centric language and concepts. Be aware of typical customer behaviours in a builders merchant context. You can be difficult, skeptical, friendly, or rushed, depending on the scenario.
            5.  **Do Not Give Feedback:** Your job is ONLY to role-play. Do not provide feedback, scores, or suggestions on the trainee's performance. Just act as the customer.
            6.  **Keep it Concise:** Your responses should be short and to the point, like a real conversation. Avoid long monologues.

            The trainee has just said: "${userMessage}".
            Based on the conversation history and the scenario, provide the customer's next response.
        `;
        
        const { output } = await ai.generate({
            model: geminiPro,
            prompt: userMessage,
            history: [
                { role: 'system', content: systemPrompt },
                ...history
            ],
            output: {
                schema: SalesTrainingOutputSchema
            },
            config: {
                temperature: 0.7, // A bit higher for more creative/realistic conversation
            }
        });
        
        if (!output) {
            throw new Error("The AI model did not return a response.");
        }
        
        return output;
    }
);
