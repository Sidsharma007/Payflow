from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_db_and_tables, get_session, engine
from sqlmodel import Session, select
from models import Merchant
from routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed Data
    with Session(engine) as session:
        merchant = session.exec(select(Merchant).where(Merchant.name == "Demo Merchant")).first()
        if not merchant:
            print("Seeding Demo Merchant...")
            merchant = Merchant(name="Demo Merchant", api_key="sk_test_12345", webhook_url="http://localhost:3000/webhook-sink")
            session.add(merchant)
            session.commit()
    yield

app = FastAPI(title="PayFlow API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "PayFlow API is runnning"}
