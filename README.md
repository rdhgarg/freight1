# HAMS Flow

Build a complete, production-quality, fully interactive Logistics & Transport Management ERP Admin Panel called HAMS (Sales & Operations Workflow System).

CRITICAL REQUIREMENTS (VERY IMPORTANT)

This is NOT a static UI project.

Do NOT create placeholder pages.

Do NOT leave any button, icon, card, table action, status badge, menu item, or dropdown without functionality.

Every interaction must navigate to relevant screens or perform appropriate actions.

The application should behave like a real enterprise SaaS ERP product.

Use realistic mock data and local state management.

All modules must be completely clickable and interconnected.

If some backend APIs are unavailable, simulate complete workflows using frontend state management.

TECH & UI REQUIREMENTS

Build a premium enterprise-grade admin panel with:

Modern SaaS design

Logistics industry dashboard aesthetics

Professional Blue + White + Dark Gray color scheme

Clean typography

Soft shadows

Responsive layouts

Mobile, Tablet and Desktop support

Dark Mode and Light Mode

Smooth animations

Hover effects everywhere

Framer Motion transitions

Beautiful data tables

Sticky headers

Reusable components

Professional forms and modals

Toast notifications

Empty states

Loading states

Success and error states

AUTHENTICATION

Build:

Login Page

Forgot Password

Reset Password

User Profile

Change Password

Session Management

Use dummy authentication with local state.

ROLE & PERMISSION MANAGEMENT (MANDATORY)

Implement complete RBAC (Role Based Access Control).

Roles:

Super Admin

Sales Manager

Operations Manager

Accounts Manager

Driver Manager

Customer Support

Viewer

Permissions:

Every module should support:

View

Add

Edit

Delete

Export

Approve

Requirements:

Dynamic sidebar

Route guards

Permission-based menus

Permission-based actions

Role assignment screens

User management screens

DASHBOARD

Build a modern executive dashboard.

Cards:

Completed Shipments (Monthly)

Ongoing Shipments

Total Shipment Revenue

Outstanding Invoices

Pending Payments

Total Customers

Active Drivers

Total Expenses

All cards must be clickable and navigate to filtered pages.

Charts:

Revenue Analytics

Shipment Status Trends

Expense Distribution

Monthly Business Performance

All KPIs should calculate dynamically from available mock data.

CUSTOMER MANAGEMENT

Complete CRUD functionality.

Fields:

Customer Name

Company Name

GST Number

Email

Phone

Address

Payment Terms

Credit Limit

Status

Features:

Customer List

Add Customer

Edit Customer

View Customer

Delete Customer

Customer Ledger

Shipment History

Search

Filters

Pagination

DRIVER MANAGEMENT

Fields:

Driver Name

Mobile Number

License Number

Assigned Truck

Assigned Shipments

Status

Features:

Add Driver

Edit Driver

Driver Details

Shipment Assignment

Delivery History

Performance Reports

Search

Filters

Pagination

SUPPLIER MANAGEMENT

Fields:

Supplier Name

GST Number

Category

Services

Address

Contact Details

Payment Terms

Features:

Complete CRUD

Supplier Bills

Purchase Linking

Expense Linking

WORK ORDER MANAGEMENT (PROJECT ENTRY POINT)

Work Order is the beginning of the business process.

Fields:

WO Number

Customer

Number of Containers

Rates

Pickup Location

Delivery Location

Terms

Timeline

Status

Workflow:

Create Work Order

↓

Approve Work Order

↓

Generate Shipment

Features:

Work Order List

Add/Edit/View/Delete

Approval Flow

Search

Filters

Pagination

SHIPMENT MANAGEMENT (MOST IMPORTANT MODULE)

Shipment Workflow:

Customs Clearance

↓

Driver Assignment

↓

Port Activity

↓

Inspection

↓

X-Ray

↓

Out From Port

↓

In Transit

↓

Delivered

Build:

Shipment List

Shipment Details

Timeline View

Driver Assignment

Delivery Proof

Activity Logs

Status Tracking

Documents Section

Expense Tracking

Driver updates should reflect in shipment timelines.

Use beautiful timeline components.

TRUCK MANAGEMENT

Fields:

Truck Number

Capacity

Driver Mapping

Insurance Details

Fitness Details

Status

Features:

CRUD

Truck Assignment

Shipment Mapping

Reports

EXPENSE MANAGEMENT

Expense Categories:

Port Charges

Toll Charges

Parking Charges

X-Ray Fees

Driver Expenses

Miscellaneous Expenses

Features:

Add Expense

Edit Expense

Upload Receipts

Shipment Linking

Approval Flow

Expense Reports

Filters

Search

PURCHASE MANAGEMENT

Features:

Purchase Orders

Supplier Bills

Approval Workflow

Payment Tracking

Purchase Reports

Complete CRUD implementation.

ACCOUNT MANAGEMENT (MOST IMPORTANT)

Build complete accounting modules.

Invoice Management

Features:

Generate Invoice

Invoice Preview

PDF Layout Preview

Outstanding Status

Paid Status

Due Dates

Receipt Management

Features:

Payment Receipts

Customer Payments

Download Receipts

Receipt History

Ledger Management

Features:

Customer Ledger

Supplier Ledger

Transaction History

Outstanding Management

Features:

Pending Payments

Overdue Invoices

Due Date Tracking

Journal & Contra

Features:

Accounting Entries

Transaction Logs

Financial Records

SETTINGS MODULE

Sections:

Company Profile

Invoice Settings

Tax Configuration

Email Templates

Notification Settings

User Management

Role Management

Permissions

System Preferences

COMMON FEATURES (FOR EVERY MODULE)

Every module must include:

List Page

Add Page

Edit Page

Details Page

Delete Confirmation Modal

Search

Filters

Pagination

Export Button

Status Updates

Action Dropdowns

Breadcrumb Navigation

Toast Notifications

No static screens are allowed.

COMPLETE BUSINESS FLOW (MUST BE IMPLEMENTED)

Customer

↓

Work Order Creation

↓

Shipment Generation

↓

Driver Assignment

↓

Port Activities

↓

Delivery Completion

↓

Expense Tracking

↓

Invoice Generation

↓

Payment Receipt

↓

Outstanding Clearance

↓

Transaction Closed

The application should visually represent this complete logistics workflow.

Everything should be fully interactive, clickable, responsive, and production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://freight1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5efe04d-d00b-4884-882f-0852fb6cc52b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
