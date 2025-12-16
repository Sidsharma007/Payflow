from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select, func
from database import get_session
from models import Transaction, TransactionCreate, TransactionRead, Merchant, PaymentStatus
from services import MockGateway, WebhookService
from datetime import datetime

router = APIRouter()

def get_current_merchant(api_key: str, session: Session = Depends(get_session)) -> Merchant:
    statement = select(Merchant).where(Merchant.api_key == api_key)
    merchant = session.exec(statement).first()
    if not merchant:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return merchant

@router.post("/pay/initiate", response_model=TransactionRead)
async def initiate_payment(
    *,
    session: Session = Depends(get_session),
    transaction_in: TransactionCreate,
    api_key: str,
    background_tasks: BackgroundTasks
):
    merchant = get_current_merchant(api_key, session)
    
    transaction = Transaction.from_orm(transaction_in)
    transaction.merchant_id = merchant.id
    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    # Process in background to simulate async gateway
    background_tasks.add_task(process_transaction_task, transaction.id, session, merchant)

    return transaction

async def process_transaction_task(transaction_id: int, session: Session, merchant: Merchant):
    # Re-fetch because session might be closed or different thread
    # In a real app we'd handle session management better for background tasks
    # For now, we will just use a new session mechanism if needed, but passing session 
    # to bg task is risky. Let's assume we use a fresh session logic or just simple for MVP.
    # Actually, SQLModel/FastAPI session dependency closes after request. 
    # Correct way: New Session.
    
    from database import engine
    with Session(engine) as bg_session:
        txn = bg_session.get(Transaction, transaction_id)
        if txn:
            processed_txn = await MockGateway.process_payment(txn, bg_session)
            processed_txn.updated_at = datetime.utcnow()
            bg_session.add(processed_txn)
            bg_session.commit()
            
            # Send Webhook
            await WebhookService.send_webhook(processed_txn, merchant)

@router.get("/pay/status/{transaction_id}", response_model=TransactionRead)
def get_payment_status(transaction_id: int, session: Session = Depends(get_session)):
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

# --- Dashboard APIs ---

@router.get("/dashboard/stats")
def get_dashboard_stats(api_key: str, session: Session = Depends(get_session)):
    merchant = get_current_merchant(api_key, session)
    
    # Query for Stats
    total_txns = session.exec(select(func.count(Transaction.id)).where(Transaction.merchant_id == merchant.id)).one()
    success_txns = session.exec(select(func.count(Transaction.id)).where(Transaction.merchant_id == merchant.id, Transaction.status == PaymentStatus.SUCCESS)).one()
    
    success_rate = (success_txns / total_txns * 100) if total_txns > 0 else 0
    
    return {
        "total_volume": total_txns, # Simplified, should be sum(amount)
        "success_rate": round(success_rate, 2),
        "active_alerts": 0
    }

@router.get("/dashboard/transactions")
def list_transactions(api_key: str, limit: int = 50, session: Session = Depends(get_session)):
    merchant = get_current_merchant(api_key, session)
    statement = select(Transaction).where(Transaction.merchant_id == merchant.id).order_by(Transaction.created_at.desc()).limit(limit)
    return session.exec(statement).all()
