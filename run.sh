#!/bin/bash
echo "==========================================="
echo " Starting Urban Flood Nowcast Prototype"
echo "==========================================="

echo "1. Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "2. Installing dependencies..."
pip install -r backend/requirements.txt

echo "3. Generating synthetic dataset..."
cd data
python generate_dataset.py
cd ..

echo "3b. Training Machine Learning Model..."
cd backend
python train_model.py
cd ..

echo "4. Starting FastAPI backend server..."
cd backend
# Kill any existing uvicorn processes on port 8000 to prevent port conflicts
lsof -ti:8000 | xargs kill -9 2>/dev/null
uvicorn main:app --reload &
cd ..

echo "5. Waiting for server to initialize..."
sleep 3

echo "6. Launching Frontend Map Dashboard..."
open frontend/index.html

echo "==========================================="
echo " Ready! The backend is running in the background."
echo " Press Ctrl+C in this terminal to stop the backend."
echo "==========================================="
wait
