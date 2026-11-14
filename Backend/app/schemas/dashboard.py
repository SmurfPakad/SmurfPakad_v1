"""
Dashboard Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DashboardStats(BaseModel):
    totalTransactions: int
    suspiciousCount: int
    activeCases: int
    riskScore: float
    patternsCount: Optional[int] = 0
    addressesMonitored: Optional[int] = 0


class DashboardChanges(BaseModel):
    transactions: Optional[str] = None
    suspicious: Optional[str] = None
    cases: Optional[str] = None
    risk: Optional[str] = None

class DashboardResponse(BaseModel):
    stats: DashboardStats
    changes: DashboardChanges


class RecentUpload(BaseModel):
    id: str
    name: str
    date: datetime
    status: str
    records: int


class RecentUploadsResponse(BaseModel):
    uploads: List[RecentUpload]
