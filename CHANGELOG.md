
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Firebase Firestore Integration**:
    - Replaced `localStorage`-based mock data with Firebase Firestore for persistent trader data storage.
    - Trader data is now stored in a "traders" collection, partitioned by `branchId`.
    - Created `src/lib/firebase.ts` for Firebase app initialization (requires user configuration).
    - Implemented `src/lib/trader-service.ts` to handle all Firestore CRUD operations for traders.
    - Server actions in `src/app/(app)/dashboard/actions.ts` now use the new `trader-service.ts`.
    - Added `getTradersAction` server action for fetching traders.
    - Implemented automatic one-time data seeding from `INITIAL_SEED_TRADERS_DATA` if a branch's trader collection in Firestore is empty.
- `BRANCH_D` added as a valid branch ID for login and testing.
- Duplicate trader detection by phone number:
    - Implemented for manual trader addition with a warning toast.
    - Implemented for bulk CSV upload, skipping duplicates (from DB or within CSV) and providing a summary toast.
- New "Quick Action" to Branch Booster: "List Bricklayers & Sales Campaign".
- **Mini Dashboard**: Added a statistics section at the top of the dashboard displaying "Live Traders Count" and "Recently Active Traders Count".
- **Per-Branch Data Persistence**: Trader data is now saved in Firebase Firestore on a per-branch basis, ensuring data modifications persist across sessions and are centrally stored for each branch. (Supersedes previous localStorage implementation).

### Changed
- **Data Fetching**: `DashboardClientPageContent.tsx` now asynchronously fetches trader data using `getTradersAction`.
- **Utility Function**: `formatTraderDataForAnalysis` moved from `mock-data.ts` to `src/lib/utils.ts`.
- **Branch Booster Refactor**:
    - The Branch Booster (`profit-partner-query.ts`) now communicates directly with the Google Gemini API using Genkit and the `@google/genai` SDK, instead of relying on an `EXTERNAL_AI_URL`.
    - The API key for Gemini is now expected via the `GOOGLE_API_KEY` environment variable (updated in `.env` and for Firebase deployment).
    - Error handling in the Branch Booster flow has been made more specific to Genkit/Gemini API issues (e.g., API key problems, quota errors, model output parsing).
- **Branch ID Rename**: `BRANCH_A` has been consistently renamed to `PURLEY` throughout the application, including in types, mock data, login form examples, and documentation.
- **Trader Overview Pagination**: Increased the number of traders displayed per page in the overview table from 5 to 20.
- **Bulk CSV Trader Upload**:
    - Integrated `papaparse` library for significantly more robust and flexible CSV parsing in `BulkAddTradersDialog`. This improves handling of quoted fields, various delimiters, and relies on header names for mapping rather than strict column order/count.
    - Updated to parse 16 specific columns in the defined order (if using older parsing logic, now primarily relies on headers): Name, Total Sales, Status, Last Activity, Description, Reviews (tradesMade), Rating, Website, Phone, Owner Name, Main Category, Categories, WorkdayTiming, Address, Link (ownerProfileLink), Actions (ignored).
    - Improved numeric field parsing (Total Sales, Reviews, Rating) to better handle potential currency symbols and formatting.
    - Adjusted date parsing for "Last Activity" to better handle common UK formats (dd/MM/yyyy, dd/MM/yy).
    - Adjusted CSV parsing in `BulkAddTradersDialog` to be more flexible with column counts, expecting up to 16 columns based on provided headers and ensuring all traders are uploaded if 'Name' is present.
    - Made CSV header matching more flexible in `BulkAddTradersDialog.tsx` for "Owner Name" (also checks "Owner"), "Main Category" (also checks "Category"), and "Workday Timing" (also checks "Workday Hours", "Working Hours", "Hours", "WorkdayTiming" (no space)).
    - **Enhanced Debugging for CSV Parsing**: Added detailed console logging in `BulkAddTradersDialog.tsx` to help diagnose issues with "Owner Name", "Main Category", and "Workday Timing" fields not loading, showing detected headers for problematic rows. Updated dialog instructions for these fields.
- **Logo Update**: Replaced SVG logo with `next/image` component using a placeholder for `TradeHunter Pro` logo. Sidebar adjusts logo size based on collapsed/expanded state.
- **Wording**: Removed explicit "AI" wording from user-facing text. Renamed features and descriptions to focus on analysis, insights, and system capabilities (e.g., "AI Assistant Capabilities" in sidebar changed to "Insight & Assistance Features", related icon changed from `Brain` to `Lightbulb`). Function `formatTraderDataForAI` renamed to `formatTraderDataForAnalysis`.
- Resolved various deployment and build issues.
- Stabilized Next.js and React dependencies.
- Refactored server actions for better clarity and compatibility.
- Addressed client-side rendering issues for login page.
- Corrected React Fragment prop issue in AppSidebar.
- Fixed "React is not defined" error in TraderTableClient.
- Improved CSV parsing in BulkAddTradersDialog to handle quoted fields with internal commas.
- Fixed data loss issue on trader update by ensuring full existing trader data is fetched.
- Resolved TypeScript error in TraderTableClient sorting logic by handling undefined values.
- Corrected TypeScript error in `TraderTableClient.tsx` by ensuring `handleAddTrader` and `handleUpdateTrader` functions align with `Promise<void>` return type expected by dialog components.
- Expanded manual "Add Trader" and "Edit Trader" forms to include more fields, aligning with the trader table overview (Website, Phone, Address, Owner Name, Owner Profile Link, Main Category, Categories, Workday Timing).
- Updated prop type in `src/components/icons/Logo.tsx` from `SVGProps<SVGSVGElement>` to `React.HTMLAttributes<HTMLDivElement>` to match the rendered `div` element, resolving a TypeScript build error.

### Fixed
- Fixed runtime error: `DialogTrigger is not defined` in `AddTraderDialog.tsx` by adding the missing import.
- **DashboardClientPageContent Parsing Error**: Fixed a JavaScript parsing error in `DashboardClientPageContent.tsx` caused by an erroneous backslash in a template literal within a `console.warn` statement.
- **Data Persistence**: The previous localStorage-based persistence for trader data has been replaced by Firebase Firestore integration, ensuring more robust and centralized data storage per branch. (This addresses the intent of "ensure traders are saved to each client portal").

### Removed
- `src/lib/mock-data.ts`: Replaced by `src/lib/trader-service.ts` for Firestore integration. LocalStorage-based data persistence is removed.

## [0.2.0] - YYYY-MM-DD (Update with current date)
### Changed
- Renamed "Profit Partner AI" to "Branch Booster" throughout the application.
- Updated Branch Booster icon to a Rocket.
- Revised wording to be less "AI-centric" and more "analysis/insights-focused".
- Updated bulk trader upload to parse 14 specific columns as per user request: Name, Description, Reviews (tradesMade), Rating, Website, Phone, Owner Name, Owner Profile Link, Main Category, Categories, Workday Timing, Closed On, Address, Review Keywords.
- Updated `Trader` data model to include new fields: `ownerName`, `ownerProfileLink`, `categories`, `workdayTiming`, `closedOn`, `reviewKeywords`.
- Adjusted date display format to UK standard (dd/MM/yyyy) in the trader table.
- Adjusted currency display to UK standard (£) in the trader table and trader form.

### Added
- "Quick Actions" buttons to the Branch Booster for predefined analysis queries.
- File upload functionality to the Branch Booster, allowing users to upload a customer data file (e.g., .txt, .csv) for deeper analysis. The file content is sent to the external analysis service.
- Updated "How to Use" page to reflect Branch Booster changes and bulk upload details.

## [0.1.0] - YYYY-MM-DD (User to fill previous date)
### Added
- First version of the application.
- Basic CRUD operations for traders.
- Profit Partner AI agent integration (later renamed to Branch Booster).
- Login and branch-specific data views.
- "How to Use" page.
- Initial bulk trader upload functionality (later revised).
- Initial per-branch data persistence using browser `localStorage`. (Later superseded by Firestore).
