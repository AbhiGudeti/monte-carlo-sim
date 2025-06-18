from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import json
import time
from monte_carlo_option_pricer import MonteCarloOptionPricer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store simulation results for streaming
simulation_cache = {}

@app.route('/api/simulate', methods=['POST'])
def simulate():
    try:
        data = request.json
        
        # Extract parameters
        params = {
            'S0': float(data.get('S0', 100)),
            'K': float(data.get('K', 100)),
            'T': float(data.get('T', 1)),
            'r': float(data.get('r', 0.05)),
            'sigma': float(data.get('sigma', 0.2)),
            'num_simulations': int(data.get('num_simulations', 10000)),
            'num_steps': int(data.get('num_steps', 252))
        }
        
        option_type = data.get('option_type', 'European')
        
        # Create pricer instance
        pricer = MonteCarloOptionPricer(**params)
        
        # Run simulation
        if option_type == 'European':
            option_price = pricer.price_european_call()
        else:
            option_price = pricer.price_american_call()
        
        # Get simulation paths for visualization
        paths = pricer.simulate_paths()
        
        # Sample some paths for visualization (limit to avoid large payloads)
        sample_size = min(20, params['num_simulations'])
        sample_indices = np.random.choice(params['num_simulations'], sample_size, replace=False)
        sampled_paths = paths[sample_indices]
        
        # Create time array
        time_array = np.linspace(0, params['T'], params['num_steps'] + 1)
        
        # Format paths for frontend
        paths_data = []
        for i, path in enumerate(sampled_paths):
            path_data = [{'time': float(t), 'price': float(p)} for t, p in zip(time_array, path)]
            paths_data.append({'id': i, 'data': path_data})
        
        # Calculate final prices for histogram
        final_prices = paths[:, -1]
        payoffs = np.maximum(final_prices - params['K'], 0)
        
        # Create histogram data
        hist, bin_edges = np.histogram(final_prices, bins=50)
        histogram_data = [
            {'price': float((bin_edges[i] + bin_edges[i+1]) / 2), 'count': int(hist[i])}
            for i in range(len(hist))
        ]
        
        payoff_hist, payoff_bin_edges = np.histogram(payoffs, bins=50)
        payoff_histogram_data = [
            {'payoff': float((payoff_bin_edges[i] + payoff_bin_edges[i+1]) / 2), 'count': int(payoff_hist[i])}
            for i in range(len(payoff_hist))
        ]
        
        # Calculate statistics
        stats = {
            'option_price': float(option_price),
            'mean_final_price': float(np.mean(final_prices)),
            'std_final_price': float(np.std(final_prices)),
            'mean_payoff': float(np.mean(payoffs)),
            'max_final_price': float(np.max(final_prices)),
            'min_final_price': float(np.min(final_prices)),
            'in_the_money_percentage': float(np.mean(payoffs > 0) * 100)
        }
        
        result = {
            'option_price': option_price,
            'option_type': option_type,
            'parameters': params,
            'paths': paths_data,
            'histogram': histogram_data,
            'payoff_histogram': payoff_histogram_data,
            'statistics': stats,
            'timestamp': time.time()
        }
        
        # Cache result for potential streaming
        simulation_id = str(int(time.time()))
        simulation_cache[simulation_id] = result
        result['simulation_id'] = simulation_id
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/export/csv/<simulation_id>', methods=['GET'])
def export_csv(simulation_id):
    try:
        if simulation_id not in simulation_cache:
            return jsonify({'error': 'Simulation not found'}), 404
        
        result = simulation_cache[simulation_id]
        
        # Create CSV data with proper formatting
        csv_lines = []
        
        # Parameters section
        csv_lines.append("SIMULATION PARAMETERS")
        csv_lines.append("Parameter,Value")
        for param, value in result['parameters'].items():
            csv_lines.append(f"{param},{value}")
        
        csv_lines.append("")  # Empty line
        
        # Results section
        csv_lines.append("SIMULATION RESULTS")
        csv_lines.append("Metric,Value")
        csv_lines.append(f"Option Price,{result['option_price']}")
        csv_lines.append(f"Option Type,{result['option_type']}")
        
        # Statistics section
        csv_lines.append("")
        csv_lines.append("STATISTICS")
        csv_lines.append("Statistic,Value")
        for stat, value in result['statistics'].items():
            csv_lines.append(f"{stat},{value}")
        
        # Price paths data (sample)
        csv_lines.append("")
        csv_lines.append("SAMPLE PRICE PATHS")
        if result['paths']:
            # Header with path names
            header = ["Time"] + [f"Path_{i+1}" for i in range(len(result['paths']))]
            csv_lines.append(",".join(header))
            
            # Data rows
            max_length = max(len(path['data']) for path in result['paths'])
            for i in range(max_length):
                row = []
                # Time
                time_val = result['paths'][0]['data'][i]['time'] if i < len(result['paths'][0]['data']) else ""
                row.append(str(time_val))
                
                # Prices for each path
                for path in result['paths']:
                    if i < len(path['data']):
                        row.append(str(path['data'][i]['price']))
                    else:
                        row.append("")
                
                csv_lines.append(",".join(row))
        
        csv_content = "\n".join(csv_lines)
        
        from flask import Response
        return Response(
            csv_content,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=monte_carlo_results_{simulation_id}.csv'}
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': time.time()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 