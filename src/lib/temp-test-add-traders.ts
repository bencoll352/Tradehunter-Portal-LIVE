
import { bulkAddTraders, getTraders, bulkDeleteTraders } from './trader-service';
import type { BaseBranchId, ParsedTraderData } from '@/types';

const TEST_BRANCH_ID: BaseBranchId = 'test-branch-e2e';

const tradersToAdd: ParsedTraderData[] = [
    {
        name: 'Test Trader A - Plumbing',
        description: 'Emergency plumbing services.',
        reviews: '45',
        rating: '4.8',
        website: 'https://plumbing-test.com',
        phone: '0800123456',
        ownerName: 'John Plumb',
        ownerProfileLink: '',
        mainCategory: 'Plumbing',
        categories: 'Plumbing, Heating',
        workdayTiming: '24/7',
        address: '1 Test Street, London',
        totalAssets: '150000',
        estimatedAnnualRevenue: '95000',
        employeeCount: '5',
        lastActivity: new Date().toISOString(),
        status: 'Active',
    },
    {
        name: 'Test Trader B - Electrical',
        description: 'Certified electrical installations.',
        reviews: '112',
        rating: '4.9',
        website: 'https://electric-test.co.uk',
        phone: '0800789101',
        ownerName: 'Jane Spark',
        ownerProfileLink: '',
        mainCategory: 'Electrician',
        categories: 'Electrician, PAT Testing',
        workdayTiming: 'Mon-Fri 9am-5pm',
        address: '2 Test Avenue, Manchester',
        totalAssets: '350000',
        estimatedAnnualRevenue: '210000',
        employeeCount: '8',
        lastActivity: new Date().toISOString(),
        status: 'Active',
    },
];

async function testAddTraders() {
    console.log("--- Starting Trader Addition Test ---");
    let addedTraderIds: string[] = [];

    try {
        // 1. Add traders
        console.log(`\n[Step 1] Adding ${tradersToAdd.length} traders...`);
        const newTraders = await bulkAddTraders(TEST_BRANCH_ID, tradersToAdd);
        if (newTraders.length !== tradersToAdd.length) {
            throw new Error(`Expected ${tradersToAdd.length} traders to be added, but got ${newTraders.length}.`);
        }
        addedTraderIds = newTraders.map(t => t.id);
        console.log(" -> Success: Traders added.");

        // 2. Verify addition
        console.log("\n[Step 2] Verifying traders were added...");
        const allTraders = await getTraders(TEST_BRANCH_ID);
        const foundTraders = allTraders.filter(t => addedTraderIds.includes(t.id));
        if (foundTraders.length !== addedTraderIds.length) {
            throw new Error(`Verification failed. Found ${foundTraders.length} of the ${addedTraderIds.length} added traders.`);
        }
        console.log(" -> Success: All test traders found in the database.");

    } catch (error) {
        console.error("\n--- !!! TEST FAILED !!! ---");
        console.error(error);
    } finally {
        // 3. Clean up
        if (addedTraderIds.length > 0) {
            console.log(`\n[Step 3] Cleaning up ${addedTraderIds.length} test traders...`);
            const { successCount, failureCount } = await bulkDeleteTraders(TEST_BRANCH_ID, addedTraderIds);
            if (failureCount > 0) {
                console.error(` -> Cleanup Warning: ${failureCount} traders could not be deleted.`);
            } else {
                console.log(` -> Success: ${successCount} test traders deleted.`);
            }
        }
    }
    console.log("\n--- Trader Addition Test Finished ---");
}

testAddTraders();
