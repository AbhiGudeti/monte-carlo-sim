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
        master.geometry("900x700")

        # Configure main window grid weights
        master.grid_rowconfigure(0, weight=1)
        master.grid_columnconfigure(0, weight=1)

        # Create main scrollable frame
        self.create_scrollable_frame()
        self.create_input_frame()
        self.create_output_frame()
        self.create_plot_frame()

    def create_scrollable_frame(self):
        # Create canvas and scrollbar for scrolling
        self.canvas = tk.Canvas(self.master)
        self.scrollbar = ttk.Scrollbar(self.master, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)

        # Grid the canvas and scrollbar
        self.canvas.grid(row=0, column=0, sticky="nsew")
        self.scrollbar.grid(row=0, column=1, sticky="ns")

        # Configure scrollable frame grid weights
        self.scrollable_frame.grid_rowconfigure(2, weight=1)  # Plot frame gets most space
        self.scrollable_frame.grid_columnconfigure(0, weight=1)

        # Bind mousewheel to canvas
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")

    def create_input_frame(self):
        input_frame = ttk.LabelFrame(self.scrollable_frame, text="Input Parameters")
        input_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        # Configure input frame grid
        input_frame.grid_columnconfigure(1, weight=1)

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
            entry.grid(row=i, column=1, sticky="ew", padx=5, pady=2)
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
        output_frame = ttk.LabelFrame(self.scrollable_frame, text="Results")
        output_frame.grid(row=1, column=0, padx=10, pady=(0, 5), sticky="ew")

        # Configure output frame to be compact
        output_frame.grid_columnconfigure(0, weight=1)

        self.result_label = ttk.Label(output_frame, text="", font=("TkDefaultFont", 9))
        self.result_label.grid(row=0, column=0, padx=8, pady=8, sticky="ew")

    def create_plot_frame(self):
        plot_frame = ttk.LabelFrame(self.scrollable_frame, text="Simulated Price Paths")
        plot_frame.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="nsew")

        # Configure plot frame grid
        plot_frame.grid_rowconfigure(0, weight=1)
        plot_frame.grid_columnconfigure(0, weight=1)

        # Create figure with better size to prevent axis clipping
        self.figure, self.ax = plt.subplots(figsize=(8.5, 4.5), dpi=80)
        self.figure.tight_layout(pad=2.5)
        
        self.plot_canvas = FigureCanvasTkAgg(self.figure, master=plot_frame)
        self.plot_canvas.draw()
        
        # Configure the canvas widget to be resizable
        canvas_widget = self.plot_canvas.get_tk_widget()
        canvas_widget.grid(row=0, column=0, sticky="nsew", padx=5, pady=5)
        canvas_widget.configure(width=560, height=360)  # Set reasonable minimum size

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
        self.ax.grid(True, alpha=0.3)
        self.figure.tight_layout()
        self.plot_canvas.draw()

    def on_closing(self):
        plt.close('all')
        self.master.quit()
        self.master.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = OptionPricerUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()