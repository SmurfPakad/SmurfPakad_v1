"""
Local SQLite Database Configuration with SQLAlchemy
"""
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Float, Text, Boolean, ForeignKey, Index
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import os
import uuid

from app.config import settings

# Create SQLite database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smurfpakad.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# =============================================================================
# MODELS
# =============================================================================

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Google ID
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    provider = Column(String, default="Google")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    status = Column(String, default="processing")  # processing, completed, failed
    row_count = Column(Integer, default=0)
    size_bytes = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    processing_time = Column(Float, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="uploads")
    analysis_results = relationship("AnalysisResult", back_populates="upload", cascade="all, delete-orphan")
    patterns = relationship("Pattern", back_populates="upload", cascade="all, delete-orphan")
    suspicious_addresses = relationship("SuspiciousAddress", back_populates="upload", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="upload", cascade="all, delete-orphan")
    graph_snapshot = relationship("GraphSnapshot", back_populates="upload", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="upload", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, unique=True, index=True)
    suspicious_node_count = Column(Integer, default=0)
    smurfing_patterns_detected = Column(Integer, default=0)
    max_risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="analysis_results")


class Pattern(Base):
    __tablename__ = "patterns"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # critical, high, medium, low
    confidence = Column(Float, default=0.0)
    transactions = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    addresses = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="patterns")


class SuspiciousAddress(Base):
    __tablename__ = "suspicious_addresses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, index=True)
    address = Column(String, nullable=False, index=True)
    risk_level = Column(String, nullable=False)  # critical, high, medium, low
    suspicious_score = Column(Float, default=0.0)
    transaction_count = Column(Integer, default=0)
    total_amount = Column(Float, default=0.0)
    avg_score = Column(Float, default=0.0)
    flags = Column(JSON, default=list)
    first_seen = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="suspicious_addresses")
    
    # Composite index for upsert on_conflict
    __table_args__ = (
        Index('ix_suspicious_upload_address', 'upload_id', 'address', unique=True),
    )


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, index=True)
    # Raw transaction fields - flexible schema
    source_wallet = Column(String, nullable=True, index=True)
    dest_wallet = Column(String, nullable=True, index=True)
    amount = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    token_type = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True)  # Store all other columns
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="transactions")


class GraphSnapshot(Base):
    __tablename__ = "graph_snapshots"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, unique=True, index=True)
    graph_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    upload = relationship("Upload", back_populates="graph_snapshot")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # compliance, investigation, summary
    format = Column(String, nullable=False)  # pdf, excel, json
    status = Column(String, default="generating")  # generating, completed, failed
    size_bytes = Column(Integer, nullable=True)
    file_path = Column(String, nullable=True)
    filters = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    upload = relationship("Upload", back_populates="reports")
    user = relationship("User", back_populates="reports")


class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False)
    prefix = Column(String, nullable=False)  # First 8 chars for display
    permissions = Column(JSON, default=list)  # ["read", "write"]
    expires_at = Column(DateTime, nullable=True)
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")


class Webhook(Base):
    __tablename__ = "webhooks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    events = Column(JSON, default=list)  # ["upload.completed", "analysis.completed"]
    secret = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_triggered = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="webhooks")


# =============================================================================
# DATABASE INITIALIZATION
# =============================================================================

def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize on import
init_db()