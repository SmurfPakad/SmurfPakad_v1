# SmurfPakad backend (FastAPI + TG-GATv2 on CPU)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/Backend

# CPU-only PyTorch first (much smaller than the default CUDA wheels)
RUN pip install --index-url https://download.pytorch.org/whl/cpu "torch>=2.2,<2.6"

COPY Backend/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY Backend/ /app/Backend/
COPY AI/ /app/AI/
COPY demo_data/ /app/demo_data/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

# One worker: WebSocket fan-out and the attack simulator keep state in-process.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
