# 🔮 ChurnPredictor AI

> **A Premium AI SaaS Application for Telecom Customer Churn Prediction**  
> Powered by RandomForest ML + Groq LLM (Llama 3.3)

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3-F55036?logo=groq)

---

## ✨ Features & UI

This project has been redesigned from the ground up as a modern, premium AI SaaS application (inspired by ChatGPT, Claude, and Vercel).

- 🤖 **ChatGPT-style Interface** — Describe a customer in natural language. The Groq LLM understands your message, tracks missing required fields, and extracts all information into structured JSON.
- 🔮 **RandomForest Prediction** — Trained on the IBM Telco Customer Churn dataset. Encodes the extracted JSON into 50 features and predicts churn probability.
- 📊 **Animated Analytics Cards** — Beautiful result panels featuring SVG circular progress charts, risk levels, and confidence scores.
- 💡 **AI Business Explanations** — Uses Llama-3-8B to generate instant retention recommendations based on the customer profile.
- 📝 **Manual Entry Fallback** — A clean, structured dropdown form for users who prefer standard data entry.
- 🌙 **Premium Deep Purple Theme** — Custom glassmorphism design system with animated background mesh orbs, floating navbars, and micro-interactions.

---

## 🗂️ Project Structure

```text
Customer Churn Analysis/
│
├── backend/                        ← Flask REST API
│   ├── app.py                      ← Main Flask app (routes, ML, Groq LLM)
│   ├── model.pkl                   ← Trained RandomForest model (50 features)
│   ├── requirements.txt            ← Python dependencies
│   ├── .env.example                ← Environment variable template
│   └── vercel.json                 ← Vercel deployment config
│
├── frontend/                       ← React + Vite SPA
│   ├── index.html
│   ├── vite.config.js              ← Dev proxy: /predict, /chat, /explain → localhost:5000
│   ├── package.json
│   └── src/
│       ├── main.jsx                ← React entry point
│       ├── App.jsx / .css          ← Root view router (landing/chat/manual)
│       ├── index.css               ← Global CSS variables & premium design tokens
│       ├── hooks/
│       │   ├── useChatbot.js       ← Complex chatbot state & Groq API orchestration
│       │   └── useChurnForm.js     ← Manual form state
│       └── components/
│           ├── Navbar.jsx / .css        ← Floating glass navigation
│           ├── Hero.jsx / .css          ← Landing page with animated mockup
│           ├── ChatView.jsx / .css      ← Full-height ChatGPT-style interface
│           ├── ChatMessage.jsx          ← Individual bubbles with avatars & markdown
│           ├── ResultCard.jsx / .css    ← Analytics card with SVG ring charts
│           ├── CustomerPanel.jsx / .css ← Grid summary of extracted features
│           ├── ManualForm.jsx / .css    ← Structured fallback form
│           └── ModelInfoSection.jsx     ← Tech stack & ML details
│
├── dataset/
│   ├── WA_Fn-UseC_-Telco-Customer-Churn.csv
│   └── final_data.csv
│
├── notebooks/                        ← EDA & Model Training
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/customer-churn-analysis.git
cd customer-churn-analysis
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
```

**Get a free Groq API key at: [console.groq.com/keys](https://console.groq.com/keys)**  
Edit `backend/.env`:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
FLASK_DEBUG=true
FLASK_PORT=5000
```

**Start the Flask backend:**
```bash
python app.py
```
*The API will run at `http://localhost:5000`*

### 3. Frontend setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.  
*(Vite proxies `/chat`, `/explain`, and `/predict` to Flask automatically to avoid CORS issues).*

---

## 🔌 API Architecture

The system uses JSON mode on Groq to guarantee zero parsing errors.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/test-ai` | Verify Groq connectivity |
| `POST` | `/chat` | **LLM NLP Extraction** (`llama-3.3-70b-versatile`) |
| `POST` | `/predict` | **RandomForest Prediction** (50 one-hot features) |
| `POST` | `/explain` | **LLM Business Insights** (`llama-3-8b-8192`) |

---

## 🧠 ML Model Details

- **Algorithm:** `RandomForestClassifier` (Scikit-Learn)
- **Dataset:** IBM Telco Customer Churn (7,043 samples)
- **Input:** 19 raw features (converted to 50 one-hot encoded columns)
- **Handling Imbalance:** SMOTE resampling
- **Smart Defaults:** The backend auto-calculates fields like `TotalCharges` (`tenure × MonthlyCharges`) and infers dependent services (e.g. no Internet = no Tech Support) so the user never has to specify them manually.

---

## 🌐 Deployment

### Backend — Vercel (Python)
The `backend/vercel.json` is ready for Vercel serverless deployment:
```bash
cd backend
vercel --prod
```

### Frontend — Vercel / Netlify
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder to your static host. *(Update the API base URL in `api/chat.js` and `api/predict.js` to point to your live Flask backend).*

---

## 📄 License

MIT License — feel free to use this project for learning or commercial purposes.

<p align="center">Built with Flask · React · Groq · RandomForest</p>
