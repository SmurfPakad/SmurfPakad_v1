"""
Model Router - exposes the deployed TG-GATv2 model card.

Returns the architecture actually loaded, the learned per-head attention
temperatures (the paper's interpretability signal) and the held-out
Elliptic2 metrics, so the UI never has to hard-code model numbers.
"""
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from app.services.ml_service import ml_service

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/info")
async def model_info():
    """Model card for the deployed GNN (no auth: contains no user data)."""
    return await run_in_threadpool(ml_service.model_info)
