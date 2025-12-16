from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel
from enum import Enum

class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentMethod(str, Enum):
    UPI = "UPI"
    CARD = "CARD"
    NETBANKING = "NETBANKING"

class Merchant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    api_key: str = Field(index=True)
    webhook_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    merchant_id: int = Field(foreign_key="merchant.id")
    order_id: str
    amount: float
    currency: str
    status: PaymentStatus = Field(default=PaymentStatus.CREATED)
    method: PaymentMethod
    description: Optional[str] = None
    failure_reason: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TransactionCreate(SQLModel):
    order_id: str
    amount: float
    currency: str
    method: PaymentMethod
    description: Optional[str] = None

class TransactionRead(TransactionCreate):
    id: int
    status: PaymentStatus
    failure_reason: Optional[str] = None
    created_at: datetime
    gateway_transaction_id: Optional[str] = None
