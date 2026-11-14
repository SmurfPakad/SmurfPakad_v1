# SmurfPakad

**Find smurfing and layering rings in payment and crypto ledgers, and see exactly why each wallet was flagged.**

SmurfPakad combines a graph neural network trained on Bitcoin transaction subgraphs with explainable,
FATF-style red-flag scoring for UPI, bank and crypto ledgers. Upload a CSV, and an analyst gets the laundering
patterns, a ranked list of flagged wallets with the evidence behind each one, an interactive transaction graph,
and a watsonx.ai-drafted analyst brief and SAR.

![Overview dashboard](docs/screenshots/dashboard.webp)

## The model: Temperature-Gated GATv2

We add one learnable softmax temperature per attention head to GATv2 (`α = softmax(e / τ)`), 12 extra
parameters in total. On sparse laundering subgraphs (average degree ≈ 2.5) standard attention spreads weight across
every neighbour; learned `τ < 1` lets a head lock onto the one discriminative neighbour.

Held-out test results on **Elliptic2** (121,810 subgraphs, 2.27% suspicious, temporal 72/8/20 split):

| Model | F1 (suspicious) | PR-AUC | Precision | Recall | Threshold |
|---|---|---|---|---|---|
| GATv2 baseline (published) | 0.5558 | 0.5906 | 0.6988 | 0.4614 | 0.79 |
| **TG-GATv2 (ours)** | **0.5640** | **0.6042** | 0.6117 | **0.5232** | 0.70 |

The specialisation emerges from training alone: three of four first-layer heads converge to τ ≈ 0.13–0.20
(near one-hot attention), the rest stay near 1.0. The **Model card** page reads these temperatures live from the
deployed checkpoint (`GET /api/v1/model/info`).

> We report F1 and PR-AUC, not accuracy: with 2.27% positives a model that labels everything licit already
> scores 97.7% accuracy. Full method and training curve: [docs/findings.md](docs/findings.md).

![Model card](docs/screenshots/model-card.webp)

## How an upload is scored

| Upload type | Scored by |
|---|---|
| Elliptic-style node features (43 columns) | TG-GATv2 directly, flagged at the validation-optimal threshold 0.70 |
| Payment ledger (sender, receiver, amount, time) | Explainable typology scoring, with the GNN probability shown alongside |

Ledgers don't carry the features the GNN was trained on, so for them each wallet is scored from red flags that
analysts can verify:

- **Structuring:** amounts at 90–100% of common reporting thresholds (₹10k, ₹50k, ₹1L, …)
- **Fan-out / fan-in and velocity:** peer-relative, above the ledger's own 95th percentile
- **Pass-through layering:** a similar high value received and forwarded
- **Cross-app identity:** one holder's UPI handles on several apps (`name@ybl`, `name@paytm`, …) merged into one entity
- **One-hop propagation:** mules and feeders of a strongly flagged hub inherit part of its risk

Every flagged wallet comes with its reasons, e.g. *"Fan-in from 5 distinct senders · Likely same holder operating
3 handles across apps (@okaxis, @paytm, @ybl)"*. On the bundled demo ledger
([demo_data/upi_transactions_demo.csv](demo_data/upi_transactions_demo.csv)) this flags 68 wallets at 100%
precision and 87% recall against its labels. That ledger is synthetic, so treat this as a sanity check, not a
real-world benchmark.

![Flagged wallet with reasons](docs/screenshots/flagged-wallet.webp)

![Transaction graph](docs/screenshots/graph.webp)

## Quick start

### Backend (FastAPI)

```bash
cd Backend
pip install -r requirements.txt        # CPU torch: pip install torch --index-url https://download.pytorch.org/whl/cpu
cp .env.example .env                   # optional — runs without any keys
uvicorn main:app --reload --port 8000  # API docs at http://localhost:8000/docs
```

### Frontend (React + Vite)

```bash
npm install
npm run dev                            # http://localhost:5173/cryptoflow/
```

Click **Login**. Without Google OAuth configured, the backend signs you in as a demo analyst. Upload
`demo_data/upi_transactions_demo.csv` and you land on the analysis for that file. If the API isn't running, the
UI still opens in an offline demo mode with clearly labelled sample data.

### Docker + PostgreSQL

```bash
docker compose up --build              # Postgres 16 + API on :8000
```

The database is any SQLAlchemy URL set through `DATABASE_URL`. SQLite is the zero-setup default;
`postgresql://user:pass@host:5432/db` works for local Postgres or a hosted one (Neon, Render, Railway, Supabase).

### Optional integrations (`Backend/.env`)

| Variable | Enables |
|---|---|
| `IBM_WATSONX_API_KEY`, `IBM_WATSONX_PROJECT_ID` | watsonx.ai (Granite) analyst briefs and agent chat; a local fallback is used otherwise |
| `GROQ_API_KEY` | LLM fallback when watsonx.ai is not configured |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Real Google sign-in (demo sign-in is disabled once these are set) |
| `JWT_SECRET_KEY` | Persistent sessions (a random per-process secret is used if unset) |
| `TELEGRAM_BOT_TOKEN`, `ELEVENLABS_API_KEY` | Ops alerts to Telegram, spoken briefs |

## Demo flow (about 3 minutes)

1. **Overview:** live totals, the highest-risk wallets with their red flags, the cross-platform flow
2. **Upload ledger:** drop the demo CSV and watch the analysis stream in
3. **Analysis:** 4 patterns (structuring, layering, smurfing, chain) and 68 wallets, each explained
4. **Transaction graph:** fan-out stars and layering chains coloured by risk; right-click to trace paths
5. **War room:** pick a wallet, generate the watsonx.ai brief, download the SAR
6. **Simulate attack:** a live smurfing ring streamed over WebSocket
7. **Model card:** TG-GATv2 vs GATv2, confusion matrix, learned temperatures

See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for talking points.

## Project layout

```
AI/                      Model code and checkpoints
  gatv2_conv.py            Temperature-gated GATv2Conv (PyG-compatible)
  train_tg_gatv2.py        Training script (threshold sweep, LR schedule)
  All_models/              best_model_tg.pt (deployed), baselines
  ML/                      Temporal features, federated learning, DP, explainability
Backend/                 FastAPI service
  app/routers/             auth, upload, analysis, graph, reports, model, attack, agent, governance, …
  app/services/            ml_service (GNN inference), typology (red flags), tabular (schema normalisation)
  app/core/database.py     SQLAlchemy models — SQLite or PostgreSQL
  tests/                   pytest suite (runs against a throw-away database)
src/                     React frontend (Vite, Tailwind, shadcn/ui, react-force-graph, recharts)
demo_data/               Synthetic UPI ledger with labelled typologies
docs/                    Findings, demo script, pitch deck, screenshots
docker-compose.yml       Postgres + API
```

## Main API endpoints

All under `/api/v1`. Interactive docs at `/docs`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/upload/file` | Upload CSV / XLSX / JSON; analysis runs automatically |
| `GET` | `/analysis/patterns?upload_id=` | Detected laundering patterns |
| `GET` | `/analysis/suspicious-addresses/{upload_id}` | Flagged wallets with scores and reasons |
| `GET` | `/graph/{upload_id}` · `/graph/suspicious/{upload_id}` | Full graph, or top-K suspicious subgraph |
| `POST` | `/reports/generate` · `GET /reports/download/{id}` | PDF / Excel / JSON compliance reports |
| `GET` | `/model/info` | Deployed model, learned temperatures, metrics |
| `POST` | `/ibm-ai/analyst-brief` | watsonx.ai analyst brief for a wallet |
| `POST` | `/attack/start` | Live smurfing simulation (events over `/ws`) |
| `WS` | `/ws?token=` | Upload progress, analysis stream, alerts |

## Tests

```bash
cd Backend && pytest                          # 41 tests: API end to end, typology, model fidelity
TEST_DATABASE_URL=postgresql://... pytest     # same suite against PostgreSQL
npx tsc -p tsconfig.app.json --noEmit && npm run lint && npm run build
```

## License

MIT
