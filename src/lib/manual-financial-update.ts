'use server';

import { getFirebaseAdmin } from './firebase-admin';
import type { BaseBranchId } from '@/types';

const BATCH_UPDATE_BRANCH_ID: BaseBranchId = 'PURLEY';

const financialData = [
    { name: "D HARRISON & SON (JOINERS & CARPENTERS) LTD", employeeCount: 1, estimatedAnnualRevenue: 36333, estimatedCompanyValue: 17399.88 },
    { name: "CAPITAL JOINERY LIMITED", employeeCount: 1, estimatedAnnualRevenue: 53699, estimatedCompanyValue: 60938.55 },
    { name: "A & A FRENCH POLISHING AND SON LIMITED", employeeCount: 1, estimatedAnnualRevenue: 40638, estimatedCompanyValue: 48691.88 },
    { name: "FIRST CARPENTRY LTD", employeeCount: 2, estimatedAnnualRevenue: 99148, estimatedCompanyValue: 65306.41 },
    { name: "MILLAND JOINERY LIMITED", employeeCount: 3, estimatedAnnualRevenue: 172485, estimatedCompanyValue: 155865.2 },
    { name: "REAL ARCHITECTURAL DESIGNS CARPENTRY LIMITED", employeeCount: 3, estimatedAnnualRevenue: 178413, estimatedCompanyValue: 114677.3 },
    { name: "HOLDEN & HOLDEN CARPENTRY LTD.", employeeCount: 3, estimatedAnnualRevenue: 145026, estimatedCompanyValue: 125110 },
    { name: "REDRING INVESTMENTS LIMITED", employeeCount: 3, estimatedAnnualRevenue: 147132, estimatedCompanyValue: 88032.59 },
    { name: "THE WOOD WORKERS BUILDING AND CONSTRUCTION LIMITED", employeeCount: 4, estimatedAnnualRevenue: 158772, estimatedCompanyValue: 170230.9 },
    { name: "BUILDER PLUS LTD", employeeCount: 4, estimatedAnnualRevenue: 224168, estimatedCompanyValue: 159647.1 },
    { name: "HARRIS CARPENTRY LIMITED", employeeCount: 4, estimatedAnnualRevenue: 299192, estimatedCompanyValue: 164873.3 },
    { name: "RAPHAEL CONTRACTING LIMITED", employeeCount: 4, estimatedAnnualRevenue: 268060, estimatedCompanyValue: 292324.6 },
    { name: "ADI BUILDING & REFURBISHMENT LIMITED", employeeCount: 4, estimatedAnnualRevenue: 278496, estimatedCompanyValue: 143311.5 },
    { name: "BROTHERS JOINERY LIMITED", employeeCount: 4, estimatedAnnualRevenue: 151340, estimatedCompanyValue: 132880.8 },
    { name: "ROMA JOINERY AND GLAZING LIMITED", employeeCount: 5, estimatedAnnualRevenue: 235360, estimatedCompanyValue: 136313.9 },
    { name: "CHARLIE FOSTER CARPENTRY & ROOFING LTD", employeeCount: 5, estimatedAnnualRevenue: 202665, estimatedCompanyValue: 109930.9 },
    { name: "JASON BAKER DESIGN LTD", employeeCount: 5, estimatedAnnualRevenue: 313235, estimatedCompanyValue: 184460 },
    { name: "ANTONY MORAWSKI LIMITED", employeeCount: 5, estimatedAnnualRevenue: 312315, estimatedCompanyValue: 321416.5 },
    { name: "RADFORD MANAGEMENT INC.", employeeCount: 5, estimatedAnnualRevenue: 240020, estimatedCompanyValue: 100584.3 },
    { name: "TOTS CARPENTRY LIMITED", employeeCount: 5, estimatedAnnualRevenue: 180545, estimatedCompanyValue: 126736.1 },
    { name: "RELM BESPOKE LTD", employeeCount: 6, estimatedAnnualRevenue: 392430, estimatedCompanyValue: 465896.9 },
    { name: "JLA JOINERY LTD", employeeCount: 7, estimatedAnnualRevenue: 335258, estimatedCompanyValue: 219548.3 },
    { name: "ASHCREST JOINERY LTD", employeeCount: 8, estimatedAnnualRevenue: 504944, estimatedCompanyValue: 485773.9 },
    { name: "D N JOINERY & PROPERTY MAINTENANCE LTD", employeeCount: 9, estimatedAnnualRevenue: 614052, estimatedCompanyValue: 650603.1 },
    { name: "PROHAUS LTD", employeeCount: 9, estimatedAnnualRevenue: 317547, estimatedCompanyValue: 303915.8 },
    { name: "CLASSIC IMAGES LIMITED", employeeCount: 10, estimatedAnnualRevenue: 622200, estimatedCompanyValue: 305099.9 },
    { name: "ARLINGTON BUILDING SERVICES LTD", employeeCount: 10, estimatedAnnualRevenue: 441300, estimatedCompanyValue: 450881.3 },
    { name: "SDR CARPENTRY & CONSTRUCTION LTD", employeeCount: 11, estimatedAnnualRevenue: 533863, estimatedCompanyValue: 262004.3 },
    { name: "GREENWOOD JOINERY UK LTD.", employeeCount: 11, estimatedAnnualRevenue: 490083, estimatedCompanyValue: 270187.4 },
    { name: "M J KLOSS CARPENTRY AND JOINERY LIMITED", employeeCount: 12, estimatedAnnualRevenue: 457068, estimatedCompanyValue: 282907.9 },
    { name: "SWIFT CRAFTED LIMITED", employeeCount: 12, estimatedAnnualRevenue: 705756, estimatedCompanyValue: 631136.9 },
    { name: "414 CONSTRUCTION LTD", employeeCount: 12, estimatedAnnualRevenue: 820368, estimatedCompanyValue: 843619 },
    { name: "WILD OAK CARPENTRY LIMITED", employeeCount: 12, estimatedAnnualRevenue: 459732, estimatedCompanyValue: 416194.1 },
    { name: "BRAYER DESIGN LTD", employeeCount: 12, estimatedAnnualRevenue: 452388, estimatedCompanyValue: 403972.3 },
];

/**
 * A one-time script to update financial data for traders in a specific branch.
 * To run this script, you can temporarily call it from an accessible server-side
 * location, like from an admin page or a temporary API route.
 * 
 * Example usage (e.g. in an API route or server action):
 * 
 * import { runManualFinancialUpdate } from '@/lib/manual-financial-update';
 * ...
 * await runManualFinancialUpdate();
 * ...
 * 
 */
export async function runManualFinancialUpdate() {
    console.log(`[MANUAL_UPDATE] Starting financial data update for branch: ${BATCH_UPDATE_BRANCH_ID}`);

    const { firestore } = await getFirebaseAdmin();
    const tradersCollection = firestore.collection('traders').doc(BATCH_UPDATE_BRANCH_ID).collection('branchTraders');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundNames: string[] = [];

    // The Firestore SDK supports up to 500 operations in a single batch.
    // We will process in chunks of 400 to be safe.
    const batchSize = 400;
    for (let i = 0; i < financialData.length; i += batchSize) {
        const chunk = financialData.slice(i, i + batchSize);
        const batch = firestore.batch();
        
        console.log(`[MANUAL_UPDATE] Processing chunk ${i / batchSize + 1}...`);

        for (const item of chunk) {
            const querySnapshot = await tradersCollection.where('name', '==', item.name).limit(1).get();

            if (!querySnapshot.empty) {
                const traderDoc = querySnapshot.docs[0];
                const dataToUpdate = {
                    employeeCount: item.employeeCount,
                    estimatedAnnualRevenue: item.estimatedAnnualRevenue,
                    estimatedCompanyValue: item.estimatedCompanyValue,
                };
                batch.update(traderDoc.ref, dataToUpdate);
                updatedCount++;
            } else {
                notFoundCount++;
                notFoundNames.push(item.name);
            }
        }

        try {
            await batch.commit();
            console.log(`[MANUAL_UPDATE] Batch commit successful for this chunk.`);
        } catch (error) {
            console.error('[MANUAL_UPDATE] Error committing batch:', error);
            throw new Error('Failed to commit updates to Firestore.');
        }
    }

    console.log('[MANUAL_UPDATE] --- Update Summary ---');
    console.log(`Successfully queued updates for ${updatedCount} traders.`);
    console.log(`Failed to find ${notFoundCount} traders.`);
    if (notFoundNames.length > 0) {
        console.log('Traders not found by name:', notFoundNames);
    }
    console.log('[MANUAL_UPDATE] --- Update Complete ---');

    return { updatedCount, notFoundCount, notFoundNames };
}
