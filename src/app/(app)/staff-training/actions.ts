
'use server';

import { getSalesTrainingResponse } from '@/ai/flows/sales-training-flow';
import type { SalesTrainingInput, SalesTrainingOutput } from '@/ai/flows/sales-training-flow-schema';


export async function getSalesTrainingResponseAction(input: SalesTrainingInput): Promise<SalesTrainingOutput> {
    try {
        const result = await getSalesTrainingResponse(input);
        return result;
    } catch (error) {
        console.error("Error in sales training agent:", error);
        if (error instanceof Error) {
            return { response: `An error occurred: ${error.message}` };
        }
        return { response: "An unknown error occurred while getting the agent's response." };
    }
}
