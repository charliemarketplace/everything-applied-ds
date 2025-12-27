# Pricing Models & Frameworks Tutorial Site

> 🎮 **Interactive learning platform for sports betting pricing models**

A comprehensive SvelteKit tutorial site covering 70+ pricing models and frameworks with interactive demos, synthetic data simulations, and hands-on calculators.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 📚 What's Included

- **70+ Topics** organized into 13 categories
- **Interactive Demos** with real-time parameter adjustment
- **Synthetic Data** generators for all model types
- **Progress Tracking** to monitor your learning
- **Notes System** to capture insights
- **R Code Examples** for each concept

## 🗂️ Project Structure

```
src/
├── routes/              # Page routes
│   ├── models/          # Core statistical models
│   ├── pricing/         # Pricing frameworks
│   ├── risk/            # Risk management
│   ├── sports/          # Sports-specific models
│   └── ...
├── lib/
│   ├── components/      # Reusable UI components
│   ├── data/            # Navigation & config
│   └── utils/           # Synthetic data utilities
docs/
├── PROGRESS.md          # Development progress
├── CHECKPOINTS.md       # Milestone tracking
└── CONTENT_GUIDE.md     # Content creation guide
```

## 📖 Learning Path

1. **Foundations** - Expected Value, Implied Probability
2. **Core Models** - Bayesian, Monte Carlo, Regression
3. **Pricing** - Kelly Criterion, Market Making
4. **Risk** - Correlation, VaR, Stress Testing
5. **Advanced** - ML, Game Theory, Optimization

## 🛠️ Tech Stack

- **SvelteKit 2** with TypeScript
- **Tailwind CSS** for styling
- **Chart.js** for visualizations
- **Custom Synthetic Data** generators

---

# Reference: Study Guide Content

## Comprehensive Pricing Models & Frameworks Study Guide

---

## CORE STATISTICAL/PROBABILISTIC MODELS

### 1. **Bayesian Updating Models**
Prior beliefs updated with new data. Used for: real-time line adjustments as information arrives (injury news, weather, sharp money).

### 2. **Monte Carlo Simulation**
Random sampling to model uncertainty and estimate probability distributions. Used for: stress testing pricing under different scenarios, estimating win rate distributions.

### 3. **Regression Models (Linear, Logistic, Poisson)**
- **Linear:** Continuous outcomes (total points scored)
- **Logistic:** Binary outcomes (over/under hit rate)
- **Poisson:** Count data (goals, touchdowns, strikeouts)

### 4. **Time Series Models (ARIMA, Exponential Smoothing)**
Forecasting based on temporal patterns. Used for: player performance trends, seasonal adjustments, recent form weighting.

### 5. **Ensemble Methods (Random Forest, XGBoost, Gradient Boosting)**
Combining multiple models for better predictions. Used for: player projection models that blend multiple data sources.

### 6. **Neural Networks / Deep Learning**
Complex pattern recognition. Used for: advanced player projections, image recognition (injury assessment from video), NLP on news/social.

### 7. **Survival Analysis / Duration Models**
Time-until-event modeling. Used for: injury return timelines, player career arcs, customer lifetime value.

### 8. **Markov Chain Models**
State transition probabilities. Used for: game flow simulation, possession-based modeling, player state transitions.

---

## PRICING-SPECIFIC FRAMEWORKS

### 9. **Expected Value (EV) Pricing**
```
EV = (Probability of Win × Payout) - (Probability of Loss × Stake)
```
Fundamental to all betting pricing. Users should have negative EV; house has positive EV.

### 10. **Kelly Criterion**
Optimal bet sizing formula: `f = (bp - q) / b` where b=odds, p=win prob, q=loss prob
Used for: bankroll management, exposure limits, optimal pricing margins.

### 11. **Vig/Juice/Hold Optimization**
The house edge built into pricing. Balance between:
- Too high → users leave for competitors
- Too low → insufficient profitability
Used for: payout multiplier calibration.

### 12. **Market-Making Models (Bid-Ask Spread)**
Maintaining balanced book by adjusting prices based on flow. Used for: dynamic line movement.

### 13. **No-Arbitrage Pricing**
Ensuring no combination of picks guarantees profit. Used for: correlated pick validation, parlay pricing consistency.

### 14. **Implied Probability Conversion**
Converting multipliers/odds to probabilities:
```
Implied Prob = 1 / Decimal Odds
```
For 3x payout: Implied prob = 33.3%
But true prob might be 28% (5.3% house edge)

### 15. **Sharp vs. Square Money Detection**
Identifying sophisticated bettors vs. casual users. Used for: line movement triggers, risk flags.

---

## RISK MANAGEMENT FRAMEWORKS

### 16. **Correlation Matrix Analysis**
Measuring how picks move together (QB + his WR, teammates, same-game picks).
Used for: exposure limits on correlated parlays.

### 17. **Value at Risk (VaR) / Conditional VaR**
Maximum expected loss at confidence level. Used for: daily/weekly exposure limits, worst-case scenario planning.

### 18. **Concentration Risk Models**
Too much exposure to single event/player/outcome. Used for: position limits, hedging requirements.

### 19. **Stress Testing / Scenario Analysis**
"What if LeBron gets injured?" "What if sharp syndicate targets us?" Used for: business continuity, pricing robustness.

### 20. **Liability Management**
Tracking total exposure across all active contests. Real-time monitoring of potential payouts vs. reserves.

---

## SPORTS-SPECIFIC MODELS

### 21. **Elo Rating Systems**
Dynamic skill ratings that update based on performance. Used for: team/player strength estimation.

### 22. **Player Projection Models (DFS-specific)**
- **Usage-based:** Minutes played → opportunity → production
- **Matchup-based:** Opponent defense rating adjustments  
- **Pace-adjusted:** Game speed impacts total stats
- **Vegas totals integration:** Implied game script from betting markets

### 23. **Game Script Modeling**
Predicting game flow (blowout vs. close game) affects player usage/stats. Used for: contextual player pricing.

### 24. **Lineup Optimization (Contest Theory)**
Understanding how users construct entries. Used for: identifying popular vs. contrarian picks, pricing adjustments.

### 25. **Injury Impact Models**
Quantifying teammate stat increases when star player out. Used for: rapid line adjustments.

---

## BEHAVIORAL/PSYCHOLOGICAL FRAMEWORKS

### 26. **Recency Bias Exploitation**
Users overweight recent performance. Used for: identifying mispriced lines when regression to mean expected.

### 27. **Home Team Bias / Fandom Bias**
Users pick favorite teams irrationally. Used for: shade lines on popular teams.

### 28. **Anchoring Effects**
First number seen affects perception. Used for: how you display projections.

### 29. **Prospect Theory (Loss Aversion)**
People feel losses 2x more than equivalent gains. Used for: promotion design, payout structure psychology.

### 30. **Optimal Stopping Problems**
When should users cash out? When should you close lines? Game theory applications.

---

## DYNAMIC PRICING MODELS

### 31. **Surge Pricing / Dynamic Pricing**
Real-time price adjustments based on demand (like Uber). Used for: live contest pricing, high-demand slates.

### 32. **Revenue Management (Yield Optimization)**
Airline/hotel pricing strategy. Used for: contest entry fee optimization, promotional pricing timing.

### 33. **Price Elasticity Models**
How demand changes with price. Used for: finding optimal hold rate that maximizes revenue (not just profit per contest).

### 34. **A/B Testing Frameworks**
Causal inference for pricing experiments. Used for: testing new payout structures, hold rates, features.

### 35. **Multi-Armed Bandit Algorithms**
Exploration vs. exploitation for pricing. Used for: learning optimal pricing in new markets/sports.

---

## OPTIMIZATION FRAMEWORKS

### 36. **Linear Programming / Constrained Optimization**
Maximize profit subject to constraints (liquidity, exposure limits). Used for: optimal pricing across slate.

### 37. **Reinforcement Learning for Pricing**
AI learns optimal pricing policy through trial and error. Used for: adaptive pricing systems.

### 38. **Convex Optimization**
Finding global optima in convex problems. Used for: portfolio construction, risk minimization.

### 39. **Quadratic Programming**
Specific to portfolio optimization (Markowitz). Used for: balancing risk-return in pricing strategy.

---

## ECONOMETRIC MODELS

### 40. **Panel Data Models (Fixed/Random Effects)**
Player-level repeated observations over time. Used for: controlling for individual heterogeneity in projections.

### 41. **Instrumental Variables (IV) / Causal Inference**
Identifying causal effects when experiments impossible. Used for: measuring true pricing impact vs. confounds.

### 42. **Difference-in-Differences**
Measuring treatment effects across groups/time. Used for: evaluating pricing changes, new feature rollouts.

### 43. **Propensity Score Matching**
Creating comparable groups for causal analysis. Used for: user segmentation impact studies.

### 44. **Hierarchical/Multilevel Models**
Players nested in teams, teams in leagues. Used for: borrowing strength across related units.

---

## MACHINE LEARNING FRAMEWORKS

### 45. **Feature Engineering for Sports**
Creating predictive variables: rolling averages, rest days, travel distance, altitude, referee tendencies, etc.

### 46. **Model Ensembling Strategies**
Stacking, blending, averaging multiple models. Used for: combining expert models (one per sport).

### 47. **Cross-Validation (Time Series CV)**
Proper validation for temporal data. Used for: avoiding look-ahead bias in backtesting.

### 48. **Hyperparameter Tuning (Bayesian Optimization)**
Systematically finding best model parameters.

### 49. **Model Calibration (Platt Scaling, Isotonic Regression)**
Ensuring predicted probabilities match observed frequencies. Critical for pricing accuracy.

### 50. **Anomaly Detection**
Identifying unusual betting patterns, data errors, sharp syndicates. Used for: fraud detection, model monitoring.

---

## BUSINESS/PRODUCT FRAMEWORKS

### 51. **Customer Lifetime Value (LTV) Models**
Predicting long-term user value. Used for: balancing acquisition cost vs. hold rate.

### 52. **Churn Prediction Models**
Identifying users likely to leave. Used for: retention-focused pricing/promotions.

### 53. **Cohort Analysis**
Tracking user groups over time. Used for: measuring pricing strategy impact on retention.

### 54. **Unit Economics**
CAC (Customer Acquisition Cost), LTV:CAC ratio, contribution margin. Used for: evaluating pricing profitability.

### 55. **Incrementality Testing**
Measuring true causal lift from promotions/features. Used for: ROI of pricing experiments.

---

## COMPETITIVE/MARKET FRAMEWORKS

### 56. **Competitive Pricing Analysis**
Benchmarking against DraftKings, FanDuel, Underdog. Used for: maintaining competitive payout rates.

### 57. **Market Microstructure**
How information flows through markets, order flow analysis. Used for: understanding sharp money impact.

### 58. **Game Theory (Nash Equilibrium, Prisoner's Dilemma)**
Strategic interaction between competitors. Used for: pricing strategy when competitors react.

### 59. **Winner's Curse / Adverse Selection**
When winning bids/bets signal you mispriced. Used for: identifying when sharp money targets you.

---

## EVALUATION METRICS

### 60. **Log Loss (Cross-Entropy)**
Proper scoring rule for probability predictions. Used for: model evaluation for win/loss outcomes.

### 61. **Brier Score**
Accuracy of probabilistic predictions. Used for: measuring calibration quality.

### 62. **ROC-AUC / Precision-Recall**
Classification model performance. Used for: evaluating binary outcome predictions.

### 63. **Mean Absolute Error (MAE) / RMSE**
Continuous prediction accuracy. Used for: player point total projections.

### 64. **Sharpe Ratio / Information Ratio**
Risk-adjusted returns. Used for: evaluating pricing strategy performance.

### 65. **Closing Line Value (CLV)**
Did your opening line beat the closing line? Used for: measuring pricing quality vs. market.

---

## TOOLS & INFRASTRUCTURE

### 66. **Real-Time Data Pipelines**
Streaming data for live pricing adjustments.

### 67. **Model Deployment & MLOps**
Getting models into production, monitoring, retraining.

### 68. **Simulation Engines**
Fast Monte Carlo for scenario testing.

### 69. **Dashboarding & Monitoring (Looker, Tableau, Streamlit)**
Real-time pricing health monitoring.

### 70. **Version Control for Models (MLflow, DVC)**
Tracking model iterations and performance.
