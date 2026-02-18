# Expense Splitter App - Project Idea

## Project Overview
The Expense Splitter App is a full-stack application designed to simplify the process of sharing expenses among friends, roommates, and travel groups. It allows users to track expenses, split costs in various ways (equal, unequal, percentage), and settle balances efficiently. The application aims to minimize the number of transactions required to settle debts using smart algorithms.

## Scope
The application will focus on a robust backend system that handles complex logic for expense splitting and balance calculation. It will feature a user-friendly frontend for interacting with the system. The core functionality includes user management, group creation, expense tracking with multiple split types, and a settlement system.

## Key Features

### 1. User Management
- **User Registration & Login:** Secure authentication using JWT/Session.
- **Profile Management:** Users can manage their profiles and view personal expense history.
- **Security:** Password encryption and secure authentication flow.

### 2. Group Management
- **Create & Manage Groups:** Users can create groups (e.g., "Trip to Goa", "Apartment 101") and add/remove members.
- **Group Summary:** View overall expenses and balances within a group.

### 3. Expense Management
- **Add Expense:** detailed expense entry with amount, description, date, and payer.
- **Flexible Split Options:**
    - **Equal Split:** Divide equally among members.
    - **Unequal Split:** Specify exact amounts for each member.
    - **Percentage Split:** Split by percentage shares.

### 4. Balance Calculation & Smart Settlement
- **Automated Calculation:** The system automatically calculates who owes whom and how much.
- **Smart Settlement Algorithm:** An advanced feature to minimize the total number of transactions needed to settle all debts within a group (e.g., if A owes B, and B owes C, the system might suggest A pays C directly).

### 5. Settlement
- **Settle Up:** Users can record full or partial payments to settle their debts.
- **History:** Keep track of all settlements.

### 6. Dashboard & Reporting
- **Dashboard:** A snapshot of "Total you owe" and "Total you are owed".
- **Expense History:** Filterable history of expenses by date, group, or user.

### 7. Optional/Bonus Features
- **Notifications:** Alerts for new expenses or settlements.
- **Admin Panel:** For system monitoring and user management.
- **Recurring Expenses:** Support for monthly bills like rent or subscriptions.
- **Export Reports:** Generate PDF reports of group expenses.

## Tech Stack
- **Backend:** Node.js / Express (Focus on OOP, Clean Architecture, System Design)
- **Frontend:** React / HTML / CSS
- **Database:** MongoDB / SQL (PostgreSQL/MySQL) 

## Engineering Practices
- **OOP Principles:** Extensive use of Encapsulation, Abstraction, Inheritance, and Polymorphism.
- **Design Patterns:** Applied where appropriate (e.g., Strategy pattern for different split types).
- **Clean Architecture:** Separation of concerns (Controllers, Services, Repositories).
