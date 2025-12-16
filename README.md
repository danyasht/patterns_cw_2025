Coursework: "Online-service for booking gyms and sections".
The system allows users to book vivsits, to buy subscriptions and to receive notifications. Admin can manage gyms and view analytics data.

## Main features

- **User:**
  - Register and login.
  - Browse through available gyms.
  - Book visits.
  - Buy subscriptions (Standard/Premium).
  - History of bookings and notifications.
- **Admin:**
  - Create new gyms (Sections included).
  - Cancel users' bookings.
  - View data analytics about gyms (e.g. Total revenue per gym).

## Tech stack

**Backend:**

- Node.js
- Express.js
- MongoDB (Mongoose ODM)

**Frontend:**

- HTML5 / CSS3 (Custom Styles)
- Vanilla JavaScript (ES6+)

**Architecture:**

- MVC
- REST API
- SOLID

## Used patterns

Overall there are 6 patterns:

1.  **Chain of Responsibility:**.
2.  **Strategy:**.
3.  **Observer:**.
4.  **Builder:**.
5.  **Factory Method:**.
6.  **Singleton:**.

## Launch instructions (Installation)

### 1. Prerequisites

Make sure to download:

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/try/download/community) (local / cloud(Atlas))
- Git

### 2. Clonning the repo

Open the terminal and run following commands:

```bash
git clone https://github.com/danyasht/patterns_cw_2025.git
cd gym-booking-system
```

Alternatively you can download zip from Git by clicking the green 'Code' button

### 3. Install necessary libraries

Open the terminal in project folder and run following command:

```bash
npm install
```

### 4. Start the server

Open the terminal in project folder and run following command:

```bash
node ./server/index.js
```
