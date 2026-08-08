"""
Federated Learning Router — Cross-Bank AML Training API
=========================================================
Provides endpoints for the federated learning simulation.
"""
import sys
from pathlib import Path
from fastapi import APIRouter

# Add AI/ML to path
ML_PATH = Path(__file__).parent.parent.parent.parent / "AI" / "ML"
sys.path.insert(0, str(ML_PATH))

from federated_learning import federated_trainer


router = APIRouter(prefix="/federated", tags=["Federated Learning"])


@router.post("/simulate")
async def simulate_federated_training(num_rounds: int = 10):
    """
    Run a full federated learning simulation.
    
    Simulates 3 banks (Paytm, PhonePe, GPay) training locally
    and sharing only gradients via FedAvg.
    
    Compares federated vs isolated training accuracy.
    """
    result = federated_trainer.simulate_full_training(num_rounds=min(num_rounds, 20))
    return result


@router.get("/status")
async def get_federated_status():
    """Get current federated training status and history."""
    return {
        "clientsRegistered": len(federated_trainer.clients),
        "roundsCompleted": len(federated_trainer.round_history),
        "clients": [
            {"name": c.name, "transactions": c.num_transactions, "fraudRate": c.fraud_rate}
            for c in federated_trainer.clients
        ],
        "latestRound": federated_trainer.round_history[-1] if federated_trainer.round_history else None,
    }
