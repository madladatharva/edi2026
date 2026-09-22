@echo off
echo ===========================================
echo  Starting Urban Flood Nowcast Prototype
echo ===========================================

echo 1. Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo 2. Installing dependencies...
pip install -r backend\requirements.txt

echo 3. Generating synthetic dataset...
cd data
python generate_dataset.py
cd ..

echo 3b. Training Machine Learning Model...
cd backend
python train_model.py
cd ..

echo 4. Starting FastAPI backend server...
cd backend
start /b uvicorn main:app --reload
cd ..

echo 5. Waiting for server to initialize...
timeout /t 3 /nobreak >nul

echo 6. Launching Frontend Map Dashboard...
start frontend\index.html

echo ===========================================
echo  Ready! The backend is running in the background.
echo  Close this window to stop the backend.
echo ===========================================
pause
