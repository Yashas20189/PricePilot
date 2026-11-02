# PricePilot – Smart Product Price Tracking & Alert Platform

PricePilot is a full-stack web application that helps users track product prices across e-commerce platforms like Amazon and Flipkart. Users can monitor price changes, set target prices, view historical price trends, and receive email notifications when products reach their desired prices.

The goal is to help users make informed purchasing decisions and avoid constantly checking product prices manually.

## 🚀 Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Product Tracking:** Add, view, and delete products you want to monitor.
- **Price Monitoring:** Automatically track product prices from Amazon and Flipkart.
- **Price History:** Maintain historical records of product price changes.
- **Target Price Alerts:** Set desired prices and receive notifications when products reach their target price.
- **Email Notifications:** Get automated email alerts when your target price conditions are met.
- **Analytics Dashboard:** View product statistics and price trends through interactive charts.
- **Automated Scheduling:** Use scheduled background jobs to periodically check product prices.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcryptjs |
| Web Scraping | Playwright, Axios |
| Data Visualization | Recharts |
| Automation | node-cron |
| Notifications | Nodemailer |

## 🏗️ Project Structure

```text
PricePilot/
│
└── pricepilot/
    ├── client/
    │   ├── public/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── theme/
    │   │   └── App.jsx
    │   ├── package.json
    │   └── vite.config.js
    │
    └── server/
        ├── middleware/
        ├── prisma/
        │   ├── migrations/
        │   └── schema.prisma
        ├── scrapers/
        ├── services/
        ├── server.js
        ├── scraper.js
        ├── cron.js
        └── package.json
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Yashas20189/PricePilot.git
cd PricePilot/pricepilot
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Configure your environment variables in a `.env` file, including your PostgreSQL database connection, JWT secret, and email configuration.

### 3. Configure the Database

Make sure PostgreSQL is running and your database connection is configured.

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 4. Start the Backend

```bash
npm start
```

### 5. Setup the Frontend

Open another terminal:

```bash
cd pricepilot/client
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔄 How It Works

1. Users register and log in to their accounts.
2. Users add product URLs from supported e-commerce platforms.
3. The backend extracts product information and tracks current prices.
4. Scheduled jobs periodically check product prices.
5. Price changes are stored in the PostgreSQL database.
6. Users can monitor price history through the dashboard.
7. Email notifications are triggered when products reach their target prices.

## 🔮 Future Enhancements

- Support for additional e-commerce platforms.
- Improved product scraping reliability.
- Intelligent BUY NOW / WAIT recommendations.
- Advanced price trend analysis.
- More notification channels.
- Enhanced price comparison and analytics.

## 👨‍💻 Developer

**Yashas V Murthy**

Electronics and Communication Engineering Student

[GitHub](https://github.com/Yashas20189)

---

*PricePilot – Track Smarter. Save Better.*
