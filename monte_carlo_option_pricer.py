import numpy as np

class MonteCarloOptionPricer:
    def __init__(self, S0, K, T, r, sigma, num_simulations, num_steps):
        self.S0 = S0  # Initial stock price
        self.K = K  # Strike price
        self.T = T  # Time to maturity
        self.r = r  # Risk-free rate
        self.sigma = sigma  # Volatility
        self.num_simulations = num_simulations
        self.num_steps = num_steps

    def simulate_paths(self):
        dt = self.T / self.num_steps
        nudt = (self.r - 0.5 * self.sigma ** 2) * dt
        sigdt = self.sigma * np.sqrt(dt)

        S = np.zeros((self.num_simulations, self.num_steps + 1))
        S[:, 0] = self.S0

        for t in range(1, self.num_steps + 1):
            z = np.random.standard_normal(self.num_simulations)
            S[:, t] = S[:, t - 1] * np.exp(nudt + sigdt * z)

        return S

    def price_european_call(self):
        S = self.simulate_paths()
        payoffs = np.maximum(S[:, -1] - self.K, 0)
        option_price = np.exp(-self.r * self.T) * np.mean(payoffs)

        return option_price

    def price_american_call(self):
        S = self.simulate_paths()
        payoffs = np.zeros_like(S)

        for t in range(self.num_steps, -1, -1):
            payoffs[:, t] = np.maximum(S[:, t] - self.K, 0)
            if t  <self.num_steps:
                payoffs[:, t] = np.maximum(payoffs[: , t], np.exp(-self.r * (self.T / self.num_steps)) * payoffs[:, t + 1])

        option_price = np.exp(-self.r * self.T) * np.mean(payoffs[:, 0])

        return option_price
