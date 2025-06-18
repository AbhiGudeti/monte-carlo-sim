import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.metrics import mean_absolute_error, mean_squared_error
from monte_carlo_option_pricer import MonteCarloOptionPricer

def fetch_option_data(ticker, expiration_date=None):
    """
    Fetch option data for a given stock ticker and expiration date.
    If no expiration date is provided, it uses the nearest expiration date.
    """
    # Create a Ticker object
    stock = yf.Ticker(ticker)

    # If no expiration date is provided, get the nearest one
    if expiration_date is None:
        expiration_dates = stock.options
        if len(expiration_dates) > 0:
            expiration_date = expiration_dates[0]
        else:
            raise ValueError(f"No option data available for {ticker}")

    # Fetch option chain
    opt = stock.option_chain(expiration_date)

    # Combine call and put data
    calls = opt.calls
    puts = opt.puts
    calls['Option Type'] = 'Call'
    puts['Option Type'] = 'Put'
    options_data = pd.concat([calls, puts])

    # Add underlying stock price and other relevant information
    current_price = stock.history(period="1d")['Close'].iloc[-1]
    options_data['Underlying Price'] = current_price
    options_data['Ticker'] = ticker
    options_data['Expiration Date'] = expiration_date

    # Calculate time to maturity in years
    today = datetime.now().date()
    expiry = datetime.strptime(expiration_date, '%Y-%m-%d').date()
    options_data['Time to Maturity'] = (expiry - today).days / 365.0

    # Map the column names to our expected names
    column_mapping = {
        'strike': 'Strike',
        'lastPrice': 'Last Price',
        'bid': 'Bid',
        'ask': 'Ask',
        'volume': 'Volume',
        'openInterest': 'Open Interest',
        'impliedVolatility': 'Implied Volatility'
    }

    # Rename columns if they exist
    options_data = options_data.rename(
        columns={old: new for old, new in column_mapping.items() if old in options_data.columns})

    # List of desired columns
    desired_columns = ['Ticker', 'Option Type', 'Strike', 'Expiration Date', 'Time to Maturity',
                       'Underlying Price', 'Last Price', 'Bid', 'Ask', 'Volume', 'Open Interest',
                       'Implied Volatility']

    # Select only the columns that exist in the dataframe
    existing_columns = [col for col in desired_columns if col in options_data.columns]

    return options_data[existing_columns]
def get_risk_free_rate():
    """
        Fetch the current risk-free rate (using 13-week Treasury Bill rate as a proxy)
        """
    try:
        treasury = yf.Ticker("^IRX")
        return treasury.info['regularMarketPrice'] / 100
    except:
        print("Warning: Unable to fetch current risk-free rate. Using 2% as a default.")
        return 0.02
def price_options(options_data, risk_free_rate, num_simulations=10000, num_steps=252):
    results = []

    for _, option in options_data.iterrows():
        pricer = MonteCarloOptionPricer(
            S0=option['Underlying Price'],
            K=option['Strike'],
            T=option['Time to Maturity'],
            r=risk_free_rate,
            sigma=option['Implied Volatility'],
            num_simulations=num_simulations,
            num_steps=num_steps
        )

        if option['Option Type'] == 'Call':
            simulated_price = pricer.price_european_call()
        else:  # Put option
            # Assuming you have a put option pricing method
            simulated_price = pricer.price_european_put()

        results.append({
            'Ticker': option['Ticker'],
            'Option Type': option['Option Type'],
            'Strike': option['Strike'],
            'Expiration Date': option['Expiration Date'],
            'Market Price': option['Last Price'],
            'Simulated Price': simulated_price,
            'Implied Volatility': option['Implied Volatility'],
            'Volume': option['Volume'],
            'Open Interest': option['Open Interest']
        })

    return pd.DataFrame(results)


def calculate_metrics(results):
    mae = mean_absolute_error(results['Market Price'], results['Simulated Price'])
    rmse = np.sqrt(mean_squared_error(results['Market Price'], results['Simulated Price']))
    r_squared = np.corrcoef(results['Market Price'], results['Simulated Price'])[0, 1] ** 2

    return {
        'MAE': mae,
        'RMSE': rmse,
        'R-squared': r_squared
    }


def main():
    # Set the stock ticker
    ticker = "AAPL"  # You can change this to any stock ticker

    # Fetch option data
    options_data = fetch_option_data(ticker)

    # Get the risk-free rate
    risk_free_rate = get_risk_free_rate()
    print(f"Current risk-free rate: {risk_free_rate:.2%}")

    # Price options using Monte Carlo simulation
    results = price_options(options_data, risk_free_rate)

    # Calculate metrics
    metrics = calculate_metrics(results)

    # Print results
    print("\nMonte Carlo Option Pricing Results:")
    print(f"Mean Absolute Error: {metrics['MAE']:.4f}")
    print(f"Root Mean Square Error: {metrics['RMSE']:.4f}")
    print(f"R-squared: {metrics['R-squared']:.4f}")

    # Save results to CSV
    filename = f"{ticker}_monte_carlo_results_{datetime.now().strftime('%Y%m%d')}.csv"
    results.to_csv(filename, index=False)
    print(f"\nDetailed results saved to {filename}")

    # Display the first few rows of the results
    print("\nSample of pricing results:")
    print(results.head())


if __name__ == "__main__":
    main()