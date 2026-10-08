# NearMart — Multi-Vendor E-Commerce Marketplace

NearMart is a modern, full-stack **hyper-local multi-vendor e-commerce platform** connecting customers with verified nearby shops, vendors, and delivery partners.

---

## 🚀 Key Features & Highlights

### 🎤 Voice Search (Web Speech API)
- **Native Browser Speech Recognition**: Tap the microphone icon in the main search bar to search products or categories hands-free.
- **Multi-Language Support**: Supports English (India), हिंदी (Hindi), اردو (Urdu), and English (US).
- **Visual Feedback**: Real-time listening animation and browser support fallback.

### 🤖 AI Chatbot Assistant (Ollama & Backend Integration)
- **Local AI / LLM Communication**: Communicates securely through the Express backend with local **Ollama** LLMs (e.g. `llama3`).
- **Context-Aware Responses**: Injects real-time catalog metadata (active local stores, categories, and items) to answer marketplace queries.
- **Graceful Fallback**: Intelligent fallback assistant when local LLM service is offline.
- **Interactive Floating UI**: Expandable, responsive floating modal with session history retention and quick-prompt suggestions.

### 🧠 AI/ML Content-Based Product Recommendation Engine
- **Similarity Matrix**: Uses term frequency (TF-IDF), category matching, vendor proximity, and price distance scoring.
- **Dynamic Placement**: Automatically renders "Recommended for You" sections on product details pages.
- **Zero Third-Party API Cost**: Fully self-contained ML calculation algorithm running directly on the backend.

### 🏪 Marketplace & Multi-Role Platform
- **Customer Shopping**: Browse categories, search shops, manage wishlist, cart, addresses, orders, and payment flow.
- **Shopkeeper Vendor Portal**: Shop onboarding, product catalog management, order processing, and earnings reporting.
- **Delivery Partner Interface**: Available delivery dispatch, active order fulfillment, and route tracking.
- **Admin Dashboard**: Approvals for new shopkeepers and delivery partners, system reports, and platform controls.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS Design System + Tailwind CSS v4
- **Icons & Motion**: Lucide React + Framer Motion
- **Routing**: React Router v7

### Backend
- **Framework**: Node.js + Express
- **Database ORM**: PostgreSQL / Neon + PostGIS + TypeORM
- **Authentication**: JWT Access & Refresh Tokens + Role-Based Access Control (RBAC)
- **AI / ML**: Ollama API Integration + Local Content Similarity Algorithms

---

## 📁 Project Architecture

```
multi_vendor/
├── Backend/
│   ├── src/
│   │   ├── config/          # Environment & Database config
│   │   ├── entities/        # TypeORM database schemas (Shop, Product, Category, User...)
│   │   ├── modules/
│   │   │   ├── ai/          # AI Chatbot endpoint (/api/ai/chat)
│   │   │   ├── products/    # Products & Recommendation Engine (/api/products/:id/recommendations)
│   │   │   ├── shops/       # Vendor management
│   │   │   ├── orders/      # Checkout & Order processing
│   │   │   └── ...
│   │   └── index.js         # API Server Entrypoint
│   └── .env                 # Server Configuration
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/      # Voice Search, ChatBotModal, BrandLogo
    │   │   ├── hero/        # Dynamic Background Slideshow Hero & Rotating Title
    │   │   └── products/    # ProductRecommendations Component
    │   ├── features/        # Customer, Vendor, Delivery, Admin Modules
    │   ├── services/        # API Client, AI Service, Catalog Service
    │   └── app/             # Routes & App Providers
    └── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (or Neon Postgres URL)
- (Optional) [Ollama](https://ollama.com/) installed locally for AI chatbot responses (`ollama run llama3`).

---

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Setup environment variables in Backend/.env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# Run development server
npm run dev
```

The API server will start on `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

## 📌 Environment Variables

### Backend (`Backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | API Server Port (Default: 5000) |
| `DATABASE_URL` | PostgreSQL / Neon DB connection URL |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `OLLAMA_HOST` | Ollama local server host URL (`http://localhost:11434`) |
| `OLLAMA_MODEL` | Ollama LLM model name (`llama3`) |

### Frontend (`Frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base path for API proxy (`/api`) |

---

## 📜 License

This project is open source and available for multi-vendor e-commerce development.
