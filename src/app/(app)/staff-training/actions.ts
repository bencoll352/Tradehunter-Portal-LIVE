'use server';

import { salesTrainingAgent, type SalesTrainingInput, type SalesTrainingOutput } from '@/ai/flows/sales-training-flow';
import { testFlow } from '@/ai/flows/test-flow';

export async function getSalesTrainingResponseAction(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
    try {
        const result = await salesTrainingAgent(input);
        return result;
    } catch (error) {
        console.error("Error in sales training agent:", error);
        if (error instanceof Error) {
            return { response: `An error occurred: ${error.message}` };
        }
        return { response: "An unknown error occurred while getting the agent's response." };
    }
}

export async function getTestResponseAction(input: string): Promise<string> {
    return testFlow(input);
}
