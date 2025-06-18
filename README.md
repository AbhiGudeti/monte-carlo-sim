# Monte Carlo Options Pricer - Full Stack Application

A complete full-stack application for real-time Monte Carlo option pricing simulation. Features a Python Flask backend with Monte Carlo simulation logic and a modern React frontend with interactive visualizations.

## Features

### Backend (Python Flask)
- **Monte Carlo Simulation Engine**: Geometric Brownian motion model for asset price simulation
- **Options Pricing**: Support for both European and American call options
- **RESTful API**: Clean API endpoints for simulation and data export
- **Statistical Analysis**: Comprehensive statistics and risk metrics

### Frontend (React + Vite + Tailwind)
- **Modern UI**: Clean, minimal design with soft colors and rounded corners
- **Real-time Visualization**: Interactive charts showing:
  - Multiple price path simulations
  - Final price distribution histograms
  - Option payoff distributions
- **Parameter Control**: Intuitive form controls for all simulation parameters
- **Export Functionality**: Download results as CSV
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- Modern web browser

### Installation & Setup

1. **Clone or extract the project**:
   ```bash
   cd monte_carlo_sim
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install React dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start both servers** using the convenience script:
   ```bash
   chmod +x start_dev.sh
   ./start_dev.sh
   ```

   **OR start manually** (recommended for development):
   
   **Terminal 1 - Backend:**
   ```bash
   python flask_api.py
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## Project Structure

```
monte_carlo_sim_old/
├── README.md                       # This file
├── requirements.txt                # Python dependencies
├── start_dev.sh                   # Development startup script
├── flask_api.py                   # Flask REST API server
├── monte_carlo_option_pricer.py   # Core Monte Carlo simulation logic
├── OptionPricerUI.py              # Original Tkinter GUI (legacy)
├── Backtest.py                    # Backtesting functionality
└── frontend/                      # React frontend application
    ├── src/
    │   ├── App.jsx                # Main React application
    │   ├── main.jsx               # React entry point
    │   ├── index.css              # Global styles with Tailwind
    │   └── components/
    │       ├── SimulationChart.jsx    # Interactive chart component
    │       ├── ParameterForm.jsx      # Input parameter controls
    │       ├── ResultsPanel.jsx       # Statistics display
    │       └── LoadingSpinner.jsx     # Loading animations
    ├── public/                    # Static assets
    ├── index.html                 # HTML template
    ├── vite.config.js             # Vite + Tailwind configuration
    ├── package.json               # Node.js dependencies
    └── package-lock.json          # Dependency lock file
```

## Application Architecture

### Backend API (Flask)
- **Endpoint**: `http://localhost:5001`
- **Routes**:
  - `POST /api/simulate` - Run Monte Carlo simulation
  - `GET /api/export/csv/{simulation_id}` - Export results as CSV
  - `GET /api/health` - Health check

### Frontend (React)
- **Development Server**: `http://localhost:5173`
- **Production Build**: `npm run build` → `dist/` folder
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts library for interactive visualizations

## Configuration

### Default Simulation Parameters
```javascript
{
  S0: 100,              // Initial stock price ($)
  K: 100,               // Strike price ($)
  T: 1,                 // Time to maturity (years)
  r: 0.05,              // Risk-free rate (5%)
  sigma: 0.2,           // Volatility (20%)
  num_simulations: 10000,  // Number of Monte Carlo paths
  num_steps: 252,       // Time steps per simulation
  option_type: 'European'  // European or American
}
```

### Customization
- **API Port**: Change in `flask_api.py` and `frontend/src/App.jsx`
- **Styling**: Modify Tailwind classes in React components
- **Chart Types**: Extend `SimulationChart.jsx` for additional visualizations
- **Parameters**: Add new fields in `ParameterForm.jsx` and backend API

## Features Deep Dive

### Monte Carlo Simulation
- **Geometric Brownian Motion**: `dS = S(μdt + σdW)`
- **Risk-neutral Valuation**: Uses risk-free rate for drift
- **Antithetic Variance Reduction**: Can be enabled for improved accuracy
- **American Option Pricing**: Backward induction with early exercise

### Interactive Charts
1. **Price Paths**: Shows sample simulation trajectories over time
2. **Final Price Distribution**: Histogram of stock prices at expiration
3. **Payoff Distribution**: Histogram of option payoffs at expiration

### Statistics Calculated
- Option fair value (discounted expected payoffs)
- Mean and standard deviation of final prices
- Mean payoff and in-the-money percentage
- Price range (min/max final prices)

## Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
python flask_api.py  # Start Flask development server
```

### Adding Features
1. **New Chart Types**: Add tabs in `SimulationChart.jsx`
2. **Additional Parameters**: Extend `ParameterForm.jsx` and API
3. **More Option Types**: Modify `monte_carlo_option_pricer.py`
4. **Export Formats**: Add new endpoints in `flask_api.py`

## Production Deployment

### Frontend (Static Hosting)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend (Python Server)
```bash
# Install production WSGI server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 flask_api:app
```

## Troubleshooting

### Common Issues

1. **Port 5000 in use (macOS)**:
   - The app uses port 5001 to avoid conflicts with AirPlay Receiver
   - If still blocked, change port in `flask_api.py` and `App.jsx`

2. **Flask not found**:
   ```bash
   pip install flask flask-cors
   ```

3. **React build fails**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS errors**:
   - Ensure Flask-CORS is installed and configured
   - Check that API URL matches in `App.jsx`

### Performance Tips
- Reduce `num_simulations` for faster development
- Increase `num_simulations` for more accurate pricing
- Use `num_steps=252` (trading days) for realistic modeling

## Design Philosophy

- **Minimal & Clean**: Focus on data visualization and usability
- **Professional**: Suitable for financial applications and presentations
- **Responsive**: Works across all device types and screen sizes
- **Accessible**: High contrast, clear typography, intuitive navigation

## License

This project is for educational and research purposes. Ensure proper risk management practices when using for actual trading or financial decisions.

---

## Get Started Now!

1. Install dependencies: `pip install -r requirements.txt && cd frontend && npm install`
2. Run: `./start_dev.sh` or start servers manually
3. Open: `http://localhost:5173`