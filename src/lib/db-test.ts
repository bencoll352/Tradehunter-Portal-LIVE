
import { bulkAddTraders, getTraders, createTask, deleteTask, bulkDeleteTraders } from './trader-service';
import type { BaseBranchId, ParsedTraderData, Task } from '@/types';

// Use a test-specific branch ID to avoid interfering with real data.
const TEST_BRANCH_ID: BaseBranchId = 'test-branch-do-not-use';

// Data transcribed from the user's spreadsheet image.
const sampleTraders: ParsedTraderData[] = [
    {
        name: 'A B Brickwork Services',
        description: 'Brickwork Service',
        reviews: '1',
        rating: '5',
        website: '',
        phone: '01795 534',
        ownerName: 'A B Brickwork',
        ownerProfileLink: '',
        mainCategory: 'Masonry co',
        categories: 'Masonry contractor',
        workdayTiming: 'Open All D',
        address: '13 Giraud Dr, Faversh',
        totalAssets: '810000',
        estimatedAnnualRevenue: '540000',
        employeeCount: '12',
    },
    {
        name: 'ALEXANDER LLOYD CONST',
        description: '',
        reviews: '23',
        rating: '5',
        website: 'https://ww...',
        phone: '07415 194',
        ownerName: 'ALEXANDE',
        ownerProfileLink: 'https://ww...',
        mainCategory: 'Constructi',
        categories: 'Constructi',
        workdayTiming: 'Open 24 h',
        address: '29 Richmond Ave, Da',
        totalAssets: '810000',
        estimatedAnnualRevenue: '540000',
        employeeCount: '12',
    },
    {
        name: "Ballinger's Carp Essex base",
        description: '',
        reviews: '6',
        rating: '5',
        website: '',
        phone: '07763 380',
        ownerName: "Ballinger's",
        ownerProfileLink: 'https://ww...',
        mainCategory: 'Home buil',
        categories: 'Home buil',
        workdayTiming: '9 am-9 pm Sunday',
        address: '27 Cedar Park Cl, Thu',
        totalAssets: '810000',
        estimatedAnnualRevenue: '540000',
        employeeCount: '12',
    },
];

async function runDbTests() {
    console.log('--- Starting Database Integrity Test ---');

    try {
        // --- 1. Bulk Add Traders ---
        console.log('\nStep 1: Running bulkAddTraders...');
        const addedTraders = await bulkAddTraders(TEST_BRANCH_ID, sampleTraders);
        if (addedTraders.length !== sampleTraders.length) {
            throw new Error(`Bulk add failed: Expected ${sampleTraders.length} traders, but only ${addedTraders.length} were added.`);
        }
        console.log(` -> Success: ${addedTraders.length} traders added.`);

        // --- 2. Verify Traders ---
        console.log('\nStep 2: Verifying added traders with getTraders...');
        const fetchedTraders = await getTraders(TEST_BRANCH_ID);
        if (fetchedTraders.length !== sampleTraders.length) {
            throw new Error(`Verification failed: Expected ${sampleTraders.length} traders, but found ${fetchedTraders.length}.`);
        }
        console.log(` -> Success: ${fetchedTraders.length} traders fetched and verified.`);

        const testTrader = fetchedTraders[0];
        if (!testTrader || !testTrader.tasks) {
            throw new Error(`Verification failed: First trader or its tasks array is missing.`);
        }
        console.log(` -> Success: First trader has a valid 'tasks' array.`);

        // --- 3. Create Task ---
        console.log(`\nStep 3: Creating a new task for trader: ${testTrader.name}`);
        const taskData: Omit<Task, 'id'> = {
            traderId: testTrader.id,
            title: 'Follow up on quote',
            dueDate: new Date().toISOString(),
            completed: false,
        };
        const createdTask = await createTask(TEST_BRANCH_ID, taskData);
        if (!createdTask || createdTask.title !== taskData.title) {
            throw new Error('Task creation failed: The created task data is incorrect.');
        }
        console.log(` -> Success: Task "${createdTask.title}" created with ID: ${createdTask.id}`);

        // --- 4. Verify Task Creation ---
        console.log('\nStep 4: Verifying task was added to the trader...');
        const tradersAfterTaskAdd = await getTraders(TEST_BRANCH_ID);
        const updatedTestTrader = tradersAfterTaskAdd.find(t => t.id === testTrader.id);
        if (!updatedTestTrader || !updatedTestTrader.tasks || updatedTestTrader.tasks.length !== 1 || updatedTestTrader.tasks[0].id !== createdTask.id) {
            throw new Error('Verification failed: Task was not correctly associated with the trader.');
        }
        console.log(' -> Success: Task correctly associated with the trader.');

        // --- 5. Delete Task ---
        console.log(`\nStep 5: Deleting task ID: ${createdTask.id}`);
        await deleteTask(TEST_BRANCH_ID, testTrader.id, createdTask.id);
        console.log(' -> Success: deleteTask function executed.');

        // --- 6. Verify Task Deletion ---
        console.log('\nStep 6: Verifying task was deleted...');
        const tradersAfterTaskDelete = await getTraders(TEST_BRANCH_ID);
        const finalTestTrader = tradersAfterTaskDelete.find(t => t.id === testTrader.id);
        if (!finalTestTrader || !finalTestTrader.tasks || finalTestTrader.tasks.length !== 0) {
            throw new Error('Verification failed: Tasks array is not empty after deletion.');
        }
        console.log(' -> Success: Task was successfully deleted from the trader.');

    } catch (error) {
        console.error('\n--- !!! TEST FAILED !!! ---');
        console.error(error);
    } finally {
        // --- 7. Cleanup: Bulk Delete Test-Traders ---
        console.log('\nStep 7: Cleaning up test data...');
        const finalTraders = await getTraders(TEST_BRANCH_ID);
        const traderIdsToDelete = finalTraders.map(t => t.id);

        if (traderIdsToDelete.length > 0) {
            const { successCount, failureCount } = await bulkDeleteTraders(TEST_BRANCH_ID, traderIdsToDelete);
            if (failureCount > 0) {
                console.error(` -> Cleanup Warning: ${failureCount} traders could not be deleted.`);
            } else {
                console.log(` -> Success: ${successCount} test traders deleted.`);
            }
        } else {
            console.log(' -> Info: No test traders to delete.');
        }

        // --- 8. Final Verification ---
        console.log('\nStep 8: Final verification of cleanup...');
        const cleanupCheck = await getTraders(TEST_BRANCH_ID);
        // The seed data will be re-added if the collection is empty, so we check against the seed data size.
        // A more robust test would mock the seed data, but for this purpose, we just ensure no extra traders are left.
        if (cleanupCheck.every(t => !traderIdsToDelete.includes(t.id))) {
             console.log(' -> Success: Test branch is clean.');
        } else {
             console.error(' -> ERROR: Cleanup failed. Test data may still exist in the database.');
        }
        
        console.log('\n--- Database Integrity Test Finished ---');
    }
}

runDbTests();
