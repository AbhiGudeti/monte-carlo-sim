# monte-carlo-sim
## Overview
The Monte Carlo Option Pricing Simulator is a Python application that allows users to estimate the price of a European call option using the Monte Carlo simulation method. The application is built with a graphical user interface (GUI) using Tkinter, enabling users to input parameters and visualize the results.

## Features
Input Parameters: Users can enter key financial parameters such as initial stock price, strike price, time to maturity, risk-free rate, volatility, number of simulations, and number of steps.
<br/>Simulation: The application performs a Monte Carlo simulation to estimate the price of a European call option.
<br/>Visualization: Users can visualize simulated stock price paths over time.
<br/>Results: The estimated option price is displayed after running the simulation.

## Usage
Launch the Application: Run the option_pricer_ui.py script to open the simulator.
<br/>Enter Parameters:
<br/>Initial Stock Price (S0): Enter the initial price of the stock.
<br/>Strike Price (K): Enter the strike price of the option.
<br/>Time to Maturity (T): Enter the time to maturity in years.
<br/>Risk-free Rate (r): Enter the risk-free interest rate.
<br/>Volatility (sigma): Enter the volatility of the stock price.
<br/>Number of Simulations: Enter the number of Monte Carlo simulations to run.
<br/>Number of Steps: Enter the number of time steps for each simulation.
<br/>Run the Simulation: Click the "Run Simulation" button. The estimated European call option price will be displayed in the "Results" section.
<br/>View Simulation Paths: The simulated stock price paths will be plotted in the "Simulated Price Paths" section.
## Code Structure
monte_carlo_option_pricer.py: Contains the MonteCarloOptionPricer class, which implements the logic for simulating stock price paths and pricing the European call option.
<br/>option_pricer_ui.py: Contains the OptionPricerUI class, which handles the GUI and interacts with the Monte Carlo pricer to display results and plots.
<br/><br/>Example
<br/>To price a European call option with the following parameters:
<br/>Initial Stock Price: 100
<br/>Strike Price: 100
<br/>Time to Maturity: 1 year
<br/>Risk-free Rate: 5%
<br/>Volatility: 20%
<br/>Number of Simulations: 10,000
<br/>Number of Steps: 252
<br/>Enter the values into the corresponding fields and click "Run Simulation". The application will display the estimated option price and plot several simulated stock price paths.

## Acknowledgements
This project uses the Monte Carlo method for option pricing, a fundamental technique in quantitative finance.

## Contact
For any inquiries or questions, please reach out via email at abhigudeti@gmail.com.

Thank you for using the Monte Carlo Option Pricing Simulator! Happy simulating!
