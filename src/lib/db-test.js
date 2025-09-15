
const { bulkAddTraders } = require('./trader-service');

const TEST_BRANCH_ID = 'test-branch-do-not-use';
const sampleTraders = [
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

async function run() {
    try {
        console.log('--- Running Step 1: Bulk Add Traders ---');
        const addedTraders = await bulkAddTraders(TEST_BRANCH_ID, sampleTraders);
        console.log(JSON.stringify(addedTraders, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

run();
