import random
import time
import httpx
import asyncio
from sqlmodel import Session, select
from models import Transaction, PaymentStatus, PaymentMethod, Merchant

class MockGateway:
    @staticmethod
    async def process_payment(transaction: Transaction, session: Session) -> Transaction:
        """
        Simulates interacting with a Bank Gateway.
        """
        # Simulate Network Latency (0.5s to 2.0s)
        await asyncio.sleep(random.uniform(0.5, 2.0))

        # 1. Deterministic Failure Trigger
        if "fail" in (transaction.description or "").lower():
            transaction.status = PaymentStatus.FAILED
            transaction.failure_reason = "SIMULATED_FAILURE: Description contained 'fail'"
            return transaction

        # 2. Amount based failure (Limit Exceeded)
        if transaction.amount > 100000:
            transaction.status = PaymentStatus.FAILED
            transaction.failure_reason = "LIMIT_EXCEEDED: Amount > 100,000"
            return transaction
        
        # 3. Random Failure (10% chance)
        if random.random() < 0.1:
            transaction.status = PaymentStatus.FAILED
            reasons = ["BANK_DOWNTIME", "INSUFFICIENT_FUNDS", "INVALID_OTP", "NETWORK_TIMEOUT"]
            transaction.failure_reason = random.choice(reasons)
            return transaction

        # Success!
        transaction.status = PaymentStatus.SUCCESS
        transaction.gateway_transaction_id = f"gw_{int(time.time()*1000)}"
        return transaction

class WebhookService:
    @staticmethod
    async def send_webhook(transaction: Transaction, merchant: Merchant):
        if not merchant.webhook_url:
            return

        payload = {
            "event": "payment.updated",
            "transaction_id": transaction.id,
            "order_id": transaction.order_id,
            "status": transaction.status,
            "failure_reason": transaction.failure_reason,
            "updated_at": transaction.updated_at.isoformat()
        }

        try:
            async with httpx.AsyncClient() as client:
                await client.post(merchant.webhook_url, json=payload, timeout=5.0)
                print(f"Webhook sent to {merchant.webhook_url} for txn {transaction.id}")
        except Exception as e:
            print(f"Failed to send webhook: {e}")
