
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup.
- Core features for trader management.
- Integration with external analysis service for Branch Booster.
- `BRANCH_D` added as a valid branch ID for login and testing.

### Changed
- Resolved various deployment and build issues.
- Stabilized Next.js and React dependencies.
- Refactored server actions for better clarity and compatibility.
- Addressed client-side rendering issues for login page.
- Corrected React Fragment prop issue in AppSidebar.
- Fixed "React is not defined" error in TraderTableClient.
- Improved CSV parsing in BulkAddTradersDialog to handle quoted fields with internal commas.
- Fixed data loss issue on trader update by ensuring full existing trader data is fetched.
- Resolved TypeScript error in TraderTableClient sorting logic by handling undefined values.
- Adjusted BulkAddTradersDialog CSV parsing to be more flexible with column counts, expecting up to 16 columns based on provided headers (Name, Total Sales, Status, Last Activity, Description, Reviews, Rating, Website, Phone, Owner Name, Main Category, Categories, Workday Timing, Address, Link, Actions) and ensuring all traders are uploaded if 'Name' is present.

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

