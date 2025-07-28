// This file can be simplified as the complex branch logic is no longer needed.

export interface SalesScenario {
    customerProfile: string;
    scenario: string;
    objections: string[];
    potentialOutcomes: {
        positive: string;
        negative: string;
    };
}

export interface ScenarioInput {
    product: string;
    customerIndustry: string;
    keyChallenge: string;
}
