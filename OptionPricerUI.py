import tkinter as tk
from tkinter import ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
from monte_carlo_option_pricer import MonteCarloOptionPricer


class OptionPricerUI:
    def __init__(self, master):
        self.master = master
        master.title("Monte Carlo Options Pricing Simulator")
        master.geometry("800x600")

        self.create_input_frame()
        self.create_output_frame()
        self.create_plot_frame()

    def create_input_frame(self):
        input_frame = ttk.LabelFrame(self.master, text="Input Parameters")
        input_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")

        parameters = [
            ("Initial Stock Price (S0):", "100", "s0"),
            ("Strike Price (K):", "100", "k"),
            ("Time to Maturity (T, in years):", "1", "t"),
            ("Risk-free Rate (r):", "0.05", "r"),
            ("Volatility (sigma):", "0.2", "sigma"),
            ("Number of Simulations:", "10000", "num_simulations"),
            ("Number of Steps:", "252", "num_steps")
        ]

        self.entries = {}
        for i, (label, default, key) in enumerate(parameters):
            ttk.Label(input_frame, text=label).grid(row=i, column=0, sticky="e", padx=5, pady=2)
            entry = ttk.Entry(input_frame)
            entry.insert(0, default)
            entry.grid(row=i, column=1, sticky="w", padx=5, pady=2)
            self.entries[key] = entry

        self.option_type = tk.StringVar(value="European")
        ttk.Radiobutton(input_frame, text="European Call", variable=self.option_type, value="European").grid(
            row=len(parameters), column=0, sticky="w", padx=5, pady=2)
        ttk.Radiobutton(input_frame, text="American Call", variable=self.option_type, value="American").grid(
            row=len(parameters) + 1, column=0, sticky="w", padx=5, pady=2)

        ttk.Button(input_frame, text="Run Simulation", command=self.run_simulation).grid(row=len(parameters) + 2,
                                                                                         column=0, columnspan=2,
                                                                                         pady=10)

    def create_output_frame(self):
        output_frame = ttk.LabelFrame(self.master, text="Results")
        output_frame.grid(row=0, column=1, padx=10, pady=10, sticky="nsew")

        self.result_label = ttk.Label(output_frame, text="")
        self.result_label.pack(padx=10, pady=10)

    def create_plot_frame(self):
        plot_frame = ttk.LabelFrame(self.master, text="Simulated Price Paths")
        plot_frame.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky="nsew")

        self.figure, self.ax = plt.subplots(figsize=(8, 4))
        self.canvas = FigureCanvasTkAgg(self.figure, master=plot_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=1)

    def run_simulation(self):
        params = {key: float(entry.get()) for key, entry in self.entries.items()}

        pricer = MonteCarloOptionPricer(
            S0=params['s0'],
            K=params['k'],
            T=params['t'],
            r=params['r'],
            sigma=params['sigma'],
            num_simulations=int(params['num_simulations']),
            num_steps=int(params['num_steps'])
        )

        if self.option_type.get() == "European":
            option_price = pricer.price_european_call()
        else:
            option_price = pricer.price_american_call()

        self.result_label.config(text=f"Estimated {self.option_type.get()} Call Option Price: {option_price:.4f}")

        self.plot_paths(pricer)

    def plot_paths(self, pricer):
        self.ax.clear()
        S = pricer.simulate_paths()
        time = np.linspace(0, pricer.T, pricer.num_steps + 1)

        for i in range(min(10, pricer.num_simulations)):
            self.ax.plot(time, S[i])

        self.ax.set_title('Simulated Stock Price Paths')
        self.ax.set_xlabel('Time')
        self.ax.set_ylabel('Stock Price')
        self.canvas.draw()

    def on_closing(self):
        plt.close('all')
        self.master.quit()
        self.master.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = OptionPricerUI(root)
    root.mainloop()
