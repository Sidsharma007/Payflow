# PayFlow Setup Instructions

## Prerequisites
- Python 3.9+
- Node.js 16+

## Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   Server will run on `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

## Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Client will run on `http://localhost:5173`.

## Usage
1. Open Frontend (`http://localhost:5173`).
2. Go to **Simulator** tab.
3. Initiate a Payment (Card or UPI).
4. Watch the status update in real-time.
5. Go to **Dashboard** to see the transaction in the stats.
