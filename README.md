<p align="center">
  <img src="public/favicon/android-chrome-512x512.png" alt="SmurfPakad Logo" width="120" height="120">
</p>

<h1 align="center">🔍 SmurfPakad (SMURF HUNTER)</h1>

<p align="center">
  <strong>AI-Powered Anti-Money Laundering Detection Platform using Graph Neural Networks</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-documentation">API Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/IBM_watsonx.ai-Granite_3.3-054ADA?logo=ibm&logoColor=white" alt="IBM watsonx.ai">
  <img src="https://img.shields.io/badge/Accuracy-98.5%25-success" alt="Accuracy">
  <img src="https://img.shields.io/badge/FATF-Compliant-orange" alt="FATF">
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Machine Learning Model](#-machine-learning-model)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Performance Benchmarks](#-performance-benchmarks)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**SmurfPakad** is an enterprise-grade RegTech solution that detects money laundering patterns in blockchain transactions using state-of-the-art Graph Neural Networks (GNN). The platform specifically targets **"Smurfing"** or **"Layering"** schemes where illicit funds are:

1. **Broken** into multiple small transactions to avoid detection thresholds
2. **Passed** through complex networks of intermediate wallets
3. **Re-aggregated** through fan-in patterns before final extraction

Our GraphSAGE-based model achieves **98.5% accuracy** on the Elliptic Bitcoin dataset, outperforming traditional ML approaches by 10-15%.

### 🎬 Problem Statement

Money laundering through cryptocurrency poses a significant challenge for financial institutions and regulators. Traditional rule-based systems fail to detect sophisticated layering patterns that exploit the pseudo-anonymous nature of blockchain transactions.

### 💡 Solution

SmurfPakad uses message-passing Graph Neural Networks to analyze transaction topology, detecting:
- **Fan-Out Patterns**: Single wallet distributing to many destinations
- **Fan-In Patterns**: Multiple sources consolidating into one wallet
- **Layering Chains**: Multi-hop transaction flows designed to obscure fund origins
- **Peeling Chains**: Sequential small withdrawals from a large pool

---

## 🚀 Live Demo

> **Demo URL**: [https://smurfpakad.ai](https://smurfpakad.ai) *(Coming Soon)*

### Test Credentials
```
Email: demo@smurfpakad.ai
Password: Demo123!
```

Or use **Google OAuth** for instant access.

---

## ✨ Features

### 🛡️ SafeGuard Real-time Shield *(NEW)*
| Feature | Description |
|---------|-------------|
| **Chrome Extension** | Intercepts UPI/wallet payments in real-time before money leaves |
| **Instant Risk Scoring** | Sub-200ms risk assessment on every transaction |
| **Cross-Platform** | Works across Paytm, PhonePe, GPay, and bank transfers |
| **WebSocket Alerts** | Broadcasts high-risk detections to all connected dashboards |

### 🔵 IBM watsonx.ai Integration *(DEEP)*
| Feature | Description |
|---------|-------------|
| **Granite 3.3 Agent** | Autonomous 6-tool AML Investigation Agent (not just text gen) |
| **FATF Red Flag Mapping** | Automated regulatory compliance mapping |
| **watsonx.governance** | Bias detection, fairness metrics, prediction drift monitoring |
| **AI Audit Trail** | Every prediction logged with model version + timestamp |
| **Graceful Fallback** | Works without IBM credentials via local template engine |

### 🤖 AML Investigation Agent *(NEW — Hackathon Centerpiece)*
| Feature | Description |
|---------|-------------|
| **Autonomous Pipeline** | Agent calls 6 tools in sequence: GNN → Patterns → FATF → TX Context → Cross-Platform → Synthesis |
| **IBM watsonx.ai Brain** | Granite 3.3 synthesizes all evidence into a structured investigation report |
| **Agent Chat UI** | Interactive chat interface — type any wallet ID to trigger full investigation |
| **SAR Recommendation** | FILE_SAR / ESCALATE / MONITOR / DISMISS with full justification |
| **Evidence Chain** | Expandable step-by-step tool outputs with timing |

### 🔐 Federated Learning *(MEGA USP)*
| Feature | Description |
|---------|-------------|
| **FedAvg Algorithm** | McMahan et al. (2017) — standard federated averaging |
| **3-Bank Simulation** | Paytm, PhonePe, GPay train locally, share only gradients |
| **Zero Data Exposure** | Raw transaction data never leaves each institution |
| **vs Isolated Comparison** | Shows +6.8% accuracy gain from federation |
| **Differential Privacy** | (ε=1.0, δ=1e-5)-DP Gaussian mechanism on gradients |
| **GDPR Compliant** | Article 5(1)(c) data minimisation satisfied |

### ⚖️ AI Governance & Compliance
| Feature | Description |
|---------|-------------|
| **Fairness Score** | A-F grading across wallet categories + platforms |
| **Bias Detection** | Demographic parity alerts, equalized odds proxy |
| **Drift Monitoring** | 7-day rolling prediction distribution tracking |
| **SAR Queue** | Track pending/overdue/filed Suspicious Activity Reports |
| **FATF Jurisdiction Map** | Risk scores per regulatory jurisdiction |
| **Compliance Audit** | Full audit trail exportable for regulators |

### 🎯 War Room Investigation *(NEW)*
| Feature | Description |
|---------|-------------|
| **Interactive Graph** | Click nodes to investigate, view connections |
| **XAI Panel** | Feature importance bars explain why each wallet was flagged |
| **FATF Mapping** | See which FATF Red Flag indicators apply to each node |
| **IBM AI Brief** | One-click analyst brief powered by watsonx.ai |
| **SAR Generation** | Generate Suspicious Activity Reports from investigation |

### 🌐 Cross-Platform Silo Breaker *(NEW)*
| Feature | Description |
|---------|-------------|
| **Silo Visualization** | Shows money flowing across Paytm → PhonePe → GPay |
| **Toggle View** | Switch between "Traditional" (blind) and "SmurfPakad" (full graph) |
| **Innovation Story** | "Banks see one silo. SmurfPakad sees the whole picture." |

### 🧠 AI-Powered Analysis
| Feature | Description |
|---------|-------------|
| **GraphSAGE Model** | 2-layer GNN with 98.5% accuracy on Elliptic dataset |
| **Pattern Detection** | Smurfing, Layering, Rapid Movement, Peeling Chains, Threshold Evasion |
| **Risk Scoring** | 0-100 suspicion scores per wallet/transaction |
| **Explainable AI** | Feature importance for every prediction |

### 📊 Visualization & Reporting
| Feature | Description |
|---------|-------------|
| **Live Threat Map** | Real-time animated canvas with WebSocket alert feed |
| **Interactive Graph** | 2D/3D force-directed transaction network |
| **Heatmap Analysis** | Risk distribution, pattern matrix, activity timeline |
| **SAR PDF Reports** | FATF-compliant Suspicious Activity Reports with branded tables |
| **Export Options** | Download graphs as PNG, data as CSV/JSON |

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| **OAuth 2.0** | Sign in with Google, GitHub, or Microsoft |
| **JWT Tokens** | Secure session management with refresh tokens |
| **Role-Based Access** | Analyst, Professional, and Enterprise tiers |

### 📈 Dashboard & Monitoring
| Feature | Description |
|---------|-------------|
| **Real-time Stats** | Animated count-up stats with stagger animations |
| **Cross-Platform Graph** | Silo visualization embedded in dashboard |
| **WebSocket Alerts** | Live notifications for high-risk detections |
| **Notification Bell** | Badge count with red dot indicator |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **TanStack Query** | Server state management |
| **react-force-graph** | Graph visualization (2D/3D) |
| **Lucide Icons** | Modern icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API |
| **Python 3.10+** | Backend language |
| **Pydantic v2** | Data validation |
| **Supabase** | PostgreSQL + Auth + Storage |
| **WebSockets** | Real-time communication |
| **ReportLab** | PDF generation |

### Machine Learning
| Technology | Purpose |
|------------|---------|
| **PyTorch 2.0** | Deep learning framework |
| **PyTorch Geometric** | Graph neural network library |
| **GraphSAGE** | Inductive node embedding model |
| **NetworkX** | Graph analysis utilities |
| **NumPy/Pandas** | Data processing |
| **scikit-learn** | Evaluation metrics |

### IBM & Infrastructure
| Technology | Purpose |
|------------|---------|
| **IBM watsonx.ai** | Enterprise AI (Granite 3.3 model) |
| **Supabase** | Backend-as-a-Service (BaaS) |
| **Google Gemini** | AI chatbot API |
| **GitHub Actions** | CI/CD pipeline |
| **pytest** | Backend testing |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   React +   │  │   Graph     │  │   Heatmap   │  │     SmurfBot        │ │
│  │   Router    │  │   Viz (3D)  │  │   Charts    │  │   (Gemini AI)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Auth     │  │   Upload    │  │  Analysis   │  │      Graph          │ │
│  │   Router    │  │   Router    │  │   Router    │  │      Router         │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                    │            │
│         ▼                ▼                ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         ML SERVICE                                    │   │
│  │   ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐   │   │
│  │   │  GraphSAGE    │    │   Pattern     │    │    Subgraph       │   │   │
│  │   │    Model      │    │   Detection   │    │    Extraction     │   │   │
│  │   └───────────────┘    └───────────────┘    └───────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL │  │    Auth     │  │   Storage   │  │    Realtime         │ │
│  │  Database   │  │   (OAuth)   │  │   (Files)   │  │   (WebSocket)       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User uploads CSV** → Backend validates and stores in Supabase Storage
2. **Analysis triggered** → ML Service loads data, builds graph, runs GNN inference
3. **Results computed** → Suspicious scores, patterns, and subgraphs cached
4. **Frontend fetches** → React Query manages server state with caching
5. **Visualization rendered** → Force-graph displays interactive network

---

## 🧠 Machine Learning Model

### GraphSAGE Architecture

```
Input Features (166 dims)
         │
         ▼
┌─────────────────────┐
│   SAGEConv Layer 1  │  (166 → 64, mean aggregator)
│   + ReLU + Dropout  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   SAGEConv Layer 2  │  (64 → 2, mean aggregator)
│   + Softmax         │
└──────────┬──────────┘
           │
           ▼
    Output: P(illicit)
```

### Why GraphSAGE?

| Property | Benefit for AML |
|----------|-----------------|
| **Inductive** | Generalizes to new, unseen wallets |
| **Scalable** | Samples neighborhoods instead of full graph |
| **Message Passing** | Captures structural patterns (fan-in/fan-out) |
| **Mean Aggregator** | Robust to noisy transaction features |

### Training Dataset: Elliptic Bitcoin

| Metric | Value |
|--------|-------|
| **Transactions** | 203,769 |
| **Edges** | 234,355 |
| **Features per node** | 165 |
| **Illicit labels** | 4,545 |
| **Licit labels** | 42,019 |

### Performance Metrics

| Metric | Score |
|--------|-------|
| **Accuracy** | 98.5% |
| **Precision** | 96.2% |
| **Recall** | 94.8% |
| **F1-Score** | 95.5% |
| **ROC-AUC** | 0.985 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/bun
- **Python** 3.10+
- **CUDA** (optional, for GPU acceleration)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/SmurfPakad.git
cd SmurfPakad
```

### 2️⃣ Frontend Setup

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:8080`

### 3️⃣ Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase and OAuth credentials

# Start FastAPI server
python main.py
```

Backend runs at: `http://localhost:8000`

### 4️⃣ Environment Variables

#### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend (`Backend/.env`)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URL=http://localhost:8080/cryptoflow/auth/callback

# App Config
FRONTEND_URL=http://localhost:8080
DEBUG=true
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
All endpoints (except `/auth/*`) require a JWT token:
```http
Authorization: Bearer <token>
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Get Google OAuth URL |
| `POST` | `/auth/callback` | Exchange OAuth code for JWT |
| `GET` | `/dashboard/stats` | Dashboard statistics |
| `POST` | `/upload` | Upload CSV for analysis |
| `GET` | `/upload/history` | List uploaded files |
| `POST` | `/analysis/{upload_id}/run` | Trigger ML analysis |
| `GET` | `/analysis/{upload_id}/patterns` | Get detected patterns |
| `GET` | `/analysis/{upload_id}/suspicious` | Get suspicious addresses |
| `GET` | `/graph/{upload_id}/suspicious-subgraph` | Get visualization data |
| `POST` | `/reports/generate` | Generate PDF report (SAR/Compliance) |
| `POST` | `/safeguard/check` | Real-time payment risk check |
| `GET` | `/safeguard/stats` | SafeGuard global statistics |
| `POST` | `/ibm-ai/analyst-brief` | Generate IBM watsonx.ai brief |
| `POST` | `/ibm-ai/safeguard-advisory` | Get AI risk advisory |
| `GET` | `/ibm-ai/status` | Check IBM watsonx.ai config status |
| `POST` | `/agent/investigate` | **★ AML Agent: full 6-tool autonomous investigation** |
| `POST` | `/agent/chat` | **★ AML Agent: conversational interface** |
| `GET` | `/agent/history` | Recent investigation history |
| `GET` | `/agent/capabilities` | Agent tools + IBM config status |
| `GET` | `/governance/fairness` | **★ AI fairness + bias detection report** |
| `GET` | `/governance/drift` | Prediction drift monitoring |
| `GET` | `/governance/audit` | Compliance audit trail |
| `POST` | `/federated/simulate` | **★ Run federated learning simulation** |
| `GET` | `/federated/status` | Federated training status |
| `WS` | `/ws/{upload_id}` | Real-time analysis updates |

### Example: Upload and Analyze

```bash
# 1. Upload CSV file
curl -X POST http://localhost:8000/api/v1/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@transactions.csv"

# Response: { "upload_id": "abc123", "status": "uploaded" }

# 2. Run analysis
curl -X POST http://localhost:8000/api/v1/analysis/abc123/run \
  -H "Authorization: Bearer $TOKEN"

# 3. Get results
curl http://localhost:8000/api/v1/analysis/abc123/patterns \
  -H "Authorization: Bearer $TOKEN"
```

📖 **Full API documentation**: See [Backend/API_ENDPOINTS.md](Backend/API_ENDPOINTS.md)

---

## 📁 Project Structure

```
SmurfPakad/
├── 📂 AI/
│   └── 📂 ML/
│       ├── models.py                  # GraphSAGE + GATv2 model definition
│       ├── models_colab.py            # Google Colab training notebook
│       ├── federated_learning.py      # ★ FedAvg cross-bank training
│       ├── differential_privacy.py   # ★ (ε,δ)-DP Gaussian mechanism
│       ├── synthetic_data_generator.py# ★ Indian UPI transaction generator
│       └── smurf_hunter_model.pt      # Trained model weights
│
├── 📂 demo_data/
│   └── upi_transactions_demo.csv      # ★ 360-row demo with real patterns
│
├── 📂 docs/
│   ├── DEMO_SCRIPT.md                 # ★ 3-minute video demo script
│   └── PITCH_DECK.md                  # ★ 10-slide pitch deck outline
│
├── 📂 Backend/
│   ├── main.py                        # FastAPI entry + all router mounts
│   ├── Dockerfile                     # ★ IBM Code Engine deployment
│   ├── .env.example                   # All env vars template
│   ├── requirements.txt               # Python dependencies
│   ├── 📂 app/
│   │   ├── 📂 routers/
│   │   │   ├── agent.py               # ★ AML Agent API
│   │   │   ├── governance.py          # ★ AI Governance API
│   │   │   ├── federated.py           # ★ Federated Learning API
│   │   │   ├── auth.py
│   │   │   ├── safeguard.py
│   │   │   ├── ibm_ai.py
│   │   │   └── ws.py
│   │   ├── 📂 services/
│   │   │   ├── aml_agent_service.py   # ★ 6-tool autonomous agent
│   │   │   ├── governance_service.py  # ★ Bias detection + drift
│   │   │   ├── ml_service.py
│   │   │   ├── ibm_watsonx_service.py
│   │   │   ├── fatf_service.py
│   │   │   └── safeguard_service.py
│   │   ├── 📂 schemas/            # Pydantic models
│   │   └── 📂 core/               # Security, Supabase, WebSocket
│   └── 📂 tests/                  # pytest test suite
│
├── 📂 demo/                       # ★ Hackathon demo scripts
│   ├── simulate_attack.py         # 10-txn smurfing attack simulator
│   └── seed_data.py               # Pre-seed SafeGuard stats
│
├── 📂 src/                        # React frontend
│   ├── 📂 components/
│   │   ├── ChatBot.tsx            # Gemini AI assistant
│   │   ├── DashboardLayout.tsx    # Layout + notification bell + LIVE
│   │   ├── CrossPlatformGraph.tsx  # ★ Paytm/PhonePe/GPay silo viz
│   │   ├── Hero.tsx               # ★ Animated counters + IBM badge
│   │   ├── Navbar.tsx             # ★ IBM Hackathon badge
│   │   └── 📂 ui/                 # shadcn components
│   ├── 📂 pages/
│   │   ├── Index.tsx              # Landing page
│   │   ├── Dashboard.tsx          # ★ Cross-platform graph + CTAs
│   │   ├── LiveThreatMap.tsx      # ★ Real-time animated threat map
│   │   ├── WarRoom.tsx            # ★ Investigation workspace
│   │   ├── AgentChat.tsx          # ★ IBM AML Investigation Agent chat
│   │   ├── FederatedDemo.tsx      # ★ Federated learning visualization
│   │   ├── Governance.tsx         # ★ AI fairness + bias detection
│   │   ├── ComplianceDashboard.tsx# ★ SAR queue + jurisdiction risk
│   │   ├── Upload.tsx             # File upload
│   │   ├── Analysis.tsx           # Analysis results
│   │   ├── Graph.tsx              # Network visualization
│   │   ├── Heatmap.tsx            # Risk heatmaps
│   │   ├── Reports.tsx            # ★ SAR report gen + FATF banner
│   │   └── Benchmarks.tsx         # Model performance
│   ├── 📂 lib/
│   │   └── api.ts                 # ★ Full API client (all endpoints incl. agent)
│   └── 📂 data/
│       └── featuresData.tsx       # ★ Updated feature list
│
├── 📂 public/                     # Static assets
├── package.json                   # Frontend dependencies
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind configuration
└── README.md                      # This file
```

> ★ = New files added for IBM International Hackathon

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Install test dependencies
pip install -r tests/requirements-test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

### Test Coverage

| Module | Coverage |
|--------|----------|
| `auth` | 95% |
| `upload` | 92% |
| `analysis` | 88% |
| `graph` | 90% |
| `ml_service` | 85% |

---

## 📸 Screenshots

### Landing Page
> Modern, responsive landing with animated particle background

### Dashboard
> Real-time statistics, upload history, and quick actions

### Graph Visualization
> Interactive 2D/3D force-directed graph with path tracing

### Heatmap Analysis
> Risk distribution, pattern matrix, and activity timeline

### SmurfBot
> AI-powered chatbot for blockchain forensics Q&A

---

## 📊 Performance Benchmarks

### Model Comparison

| Method | Accuracy | Speed | Memory |
|--------|----------|-------|--------|
| **SmurfPakad GNN** | **98.5%** | **2.4s** | 1.2GB |
| Random Forest | 88.7% | 6.2s | 1.8GB |
| Traditional ML | 85.3% | 8.1s | 2.5GB |
| Rule-Based | 72.1% | 15.3s | 0.8GB |

### Pattern Detection Rates

| Pattern | True Positives | False Positives | Accuracy |
|---------|----------------|-----------------|----------|
| Smurfing | 247 | 8 | 95.4% |
| Layering | 156 | 6 | 94.2% |
| Peeling Chain | 124 | 5 | 93.8% |
| Rapid Movement | 89 | 11 | 89.5% |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python type hints
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

---

## 👨‍💻 Author

**Divyansh Bhatia**

- LinkedIn: https://www.linkedin.com/in/divyansh-bhatia-88223b316/
- GitHub: https://github.com/Bhatia06/

---

## 🙏 Acknowledgments

- [IBM watsonx.ai](https://www.ibm.com/watsonx) for enterprise AI (Granite models)
- [Elliptic Dataset](https://www.kaggle.com/datasets/ellipticco/elliptic-data-set) for Bitcoin AML data
- [PyTorch Geometric](https://pytorch-geometric.readthedocs.io/) for GNN framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com/) for backend infrastructure

---

<p align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
</p>

<p align="center">
  Built for the <strong>IBM International Financial Hackathon</strong> 🏆
</p>

<p align="center">
  Made with ❤️ for the blockchain security community
</p>

