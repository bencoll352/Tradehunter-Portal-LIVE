
import { NextResponse } from 'next/server';
import { bulkAddTraders, getTraders, createTask, deleteTask, bulkDeleteTraders } from '@/lib/trader-service';
import type { BaseBranchId, ParsedTraderData, Task } from '@/types';

const TEST_BRANCH_ID: BaseBranchId = 'test-branch-do-not-use';

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

export async function GET() {
    const logs: string[] = [];
    const log = (message: string) => logs.push(message);

    log('--- Starting Database Integrity Test ---');

    try {
        log('\nStep 1: Running bulkAddTraders...');
        const addedTraders = await bulkAddTraders(TEST_BRANCH_ID, sampleTraders);
        if (addedTraders.length !== sampleTraders.length) throw new Error(`Bulk add failed: Expected ${sampleTraders.length}, got ${addedTraders.length}`);
        log(` -> Success: ${addedTraders.length} traders added.`);

        log('\nStep 2: Verifying added traders...');
        const fetchedTraders = await getTraders(TEST_BRANCH_ID);
        if (fetchedTraders.length < sampleTraders.length) throw new Error(`Verification failed: Expected at least ${sampleTraders.length} traders, found ${fetchedTraders.length}.`);
        log(` -> Success: ${fetchedTraders.length} traders fetched.`);

        const testTrader = fetchedTraders.find(t => t.name === 'A B Brickwork Services');
        if (!testTrader) throw new Error('Could not find test trader A B Brickwork Services');
        log(` -> Success: Found test trader.`);

        log(`\nStep 3: Creating a new task for trader: ${testTrader.name}`);
        const taskData: Omit<Task, 'id'> = { traderId: testTrader.id, title: 'Follow up on quote', dueDate: new Date().toISOString(), completed: false };
        const createdTask = await createTask(TEST_BRANCH_ID, taskData);
        if (!createdTask) throw new Error('Task creation failed.');
        log(` -> Success: Task created with ID: ${createdTask.id}`);

        log('\nStep 4: Verifying task was added...');
        const tradersAfterTaskAdd = await getTraders(TEST_BRANCH_ID);
        const updatedTestTrader = tradersAfterTaskAdd.find(t => t.id === testTrader.id);
        if (!updatedTestTrader?.tasks?.some(t => t.id === createdTask.id)) throw new Error('Verification failed: Task not associated with trader.');
        log(' -> Success: Task correctly associated.');

        log(`\nStep 5: Deleting task ID: ${createdTask.id}`);
        await deleteTask(TEST_BRANCH_ID, testTrader.id, createdTask.id);
        log(' -> Success: deleteTask executed.');

        log('\nStep 6: Verifying task was deleted...');
        const tradersAfterTaskDelete = await getTraders(TEST_BRANCH_ID);
        const finalTestTrader = tradersAfterTaskDelete.find(t => t.id === testTrader.id);
        if (finalTestTrader?.tasks?.some(t => t.id === createdTask.id)) throw new Error('Verification failed: Task was not deleted.');
        log(' -> Success: Task successfully deleted.');

    } catch (error: any) {
        log('\n--- !!! TEST FAILED !!! ---');
        log(error.message);
    } finally {
        log('\nStep 7: Cleaning up test data...');
        const finalTraders = await getTraders(TEST_BRANCH_ID);
        const traderIdsToDelete = finalTraders.filter(t => sampleTraders.some(st => st.name === t.name)).map(t => t.id);

        if (traderIdsToDelete.length > 0) {
            const { successCount, failureCount } = await bulkDeleteTraders(TEST_BRANCH_ID, traderIdsToDelete);
            if (failureCount > 0) log(` -> Cleanup Warning: ${failureCount} traders could not be deleted.`);
            else log(` -> Success: ${successCount} test traders deleted.`);
        } else {
            log(' -> Info: No test traders to delete.');
        }
        log('\n--- Database Integrity Test Finished ---');
    }

    return new Response(logs.join('\n'), { headers: { 'Content-Type': 'text/plain' } });
}
