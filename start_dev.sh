#!/bin/bash

# Start the development environment for Monte Carlo Options Pricer

echo "🚀 Starting Monte Carlo Options Pricer Development Environment"
echo ""

# Check if Flask is installed
if ! python -c "import flask" 2>/dev/null; then
    echo "Installing Flask dependencies..."
    pip install flask flask-cors
fi

# Start Flask backend in background
echo "Starting Flask API server on http://localhost:5001..."
python flask_api.py &
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 2

# Start React frontend
echo "Starting React frontend on http://localhost:5173..."
cd frontend
npm run dev &
REACT_PID=$!

echo ""
echo "✅ Development servers started!"
echo "   - Backend API: http://localhost:5001"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $FLASK_PID $REACT_PID 2>/dev/null; exit" INT

# Keep script running
wait 