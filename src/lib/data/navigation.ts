export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Overview', path: '/', icon: '🏠' },
      { label: 'Quick Start', path: '/quickstart', icon: '🚀' },
      { label: 'Playground', path: '/playground', icon: '🎮', badge: 'New' }
    ]
  },
  {
    title: 'Core Statistical Models',
    items: [
      { label: 'Bayesian Updating', path: '/models/bayesian', icon: '📊' },
      { label: 'Monte Carlo Simulation', path: '/models/monte-carlo', icon: '🎲' },
      { label: 'Regression Models', path: '/models/regression', icon: '📈' },
      { label: 'Time Series', path: '/models/time-series', icon: '⏱️' },
      { label: 'Ensemble Methods', path: '/models/ensemble', icon: '🌲' },
      { label: 'Neural Networks', path: '/models/neural', icon: '🧠' },
      { label: 'Survival Analysis', path: '/models/survival', icon: '⏳' },
      { label: 'Markov Chains', path: '/models/markov', icon: '🔗' }
    ]
  },
  {
    title: 'Pricing Frameworks',
    items: [
      { label: 'Expected Value', path: '/pricing/expected-value', icon: '💰' },
      { label: 'Kelly Criterion', path: '/pricing/kelly', icon: '📐' },
      { label: 'Vig/Juice/Hold', path: '/pricing/vig', icon: '🎯' },
      { label: 'Market Making', path: '/pricing/market-making', icon: '⚖️' },
      { label: 'Implied Probability', path: '/pricing/implied-prob', icon: '🔮' },
      { label: 'Sharp vs Square', path: '/pricing/sharp-square', icon: '🎩' }
    ]
  },
  {
    title: 'Risk Management',
    items: [
      { label: 'Correlation Analysis', path: '/risk/correlation', icon: '🔄' },
      { label: 'Value at Risk', path: '/risk/var', icon: '📉' },
      { label: 'Concentration Risk', path: '/risk/concentration', icon: '🎯' },
      { label: 'Stress Testing', path: '/risk/stress-testing', icon: '💪' },
      { label: 'Liability Mgmt', path: '/risk/liability', icon: '⚠️' }
    ]
  },
  {
    title: 'Sports Models',
    items: [
      { label: 'Elo Ratings', path: '/sports/elo', icon: '🏆' },
      { label: 'Player Projections', path: '/sports/projections', icon: '⭐' },
      { label: 'Game Script', path: '/sports/game-script', icon: '📜' },
      { label: 'Lineup Optimization', path: '/sports/lineup', icon: '🧩' },
      { label: 'Injury Impact', path: '/sports/injury', icon: '🩹' }
    ]
  },
  {
    title: 'Behavioral Models',
    items: [
      { label: 'Recency Bias', path: '/behavioral/recency', icon: '🕐' },
      { label: 'Home/Fandom Bias', path: '/behavioral/fandom', icon: '❤️' },
      { label: 'Anchoring Effects', path: '/behavioral/anchoring', icon: '⚓' },
      { label: 'Prospect Theory', path: '/behavioral/prospect', icon: '🎭' },
      { label: 'Optimal Stopping', path: '/behavioral/stopping', icon: '🛑' }
    ]
  },
  {
    title: 'Dynamic Pricing',
    items: [
      { label: 'Surge Pricing', path: '/dynamic/surge', icon: '⚡' },
      { label: 'Revenue Mgmt', path: '/dynamic/revenue', icon: '💵' },
      { label: 'Price Elasticity', path: '/dynamic/elasticity', icon: '🎢' },
      { label: 'A/B Testing', path: '/dynamic/ab-testing', icon: '🔬' },
      { label: 'Multi-Armed Bandit', path: '/dynamic/bandit', icon: '🎰' }
    ]
  },
  {
    title: 'Optimization',
    items: [
      { label: 'Linear Programming', path: '/optimization/linear', icon: '📏' },
      { label: 'Reinforcement Learning', path: '/optimization/rl', icon: '🤖' },
      { label: 'Convex Optimization', path: '/optimization/convex', icon: '⛰️' },
      { label: 'Quadratic Programming', path: '/optimization/quadratic', icon: '📐' }
    ]
  },
  {
    title: 'Econometrics',
    items: [
      { label: 'Panel Data', path: '/econometrics/panel', icon: '📋' },
      { label: 'IV / Causal Inference', path: '/econometrics/iv', icon: '🔍' },
      { label: 'Diff-in-Diff', path: '/econometrics/did', icon: '➗' },
      { label: 'Propensity Matching', path: '/econometrics/propensity', icon: '🎯' },
      { label: 'Hierarchical Models', path: '/econometrics/hierarchical', icon: '🏛️' }
    ]
  },
  {
    title: 'Machine Learning',
    items: [
      { label: 'Feature Engineering', path: '/ml/features', icon: '🔧' },
      { label: 'Model Ensembling', path: '/ml/ensembling', icon: '🎼' },
      { label: 'Cross-Validation', path: '/ml/cv', icon: '✅' },
      { label: 'Hyperparameter Tuning', path: '/ml/hyperparameter', icon: '🎛️' },
      { label: 'Model Calibration', path: '/ml/calibration', icon: '🎯' },
      { label: 'Anomaly Detection', path: '/ml/anomaly', icon: '🚨' }
    ]
  },
  {
    title: 'Business Frameworks',
    items: [
      { label: 'Customer LTV', path: '/business/ltv', icon: '👤' },
      { label: 'Churn Prediction', path: '/business/churn', icon: '📤' },
      { label: 'Cohort Analysis', path: '/business/cohort', icon: '👥' },
      { label: 'Unit Economics', path: '/business/unit-economics', icon: '💼' },
      { label: 'Incrementality', path: '/business/incrementality', icon: '📊' }
    ]
  },
  {
    title: 'Market Analysis',
    items: [
      { label: 'Competitive Pricing', path: '/market/competitive', icon: '🏁' },
      { label: 'Market Microstructure', path: '/market/microstructure', icon: '🔬' },
      { label: 'Game Theory', path: '/market/game-theory', icon: '♟️' },
      { label: 'Adverse Selection', path: '/market/adverse-selection', icon: '⚠️' }
    ]
  },
  {
    title: 'Metrics & Evaluation',
    items: [
      { label: 'Log Loss', path: '/metrics/logloss', icon: '📊' },
      { label: 'Brier Score', path: '/metrics/brier', icon: '🎯' },
      { label: 'ROC-AUC', path: '/metrics/roc', icon: '📈' },
      { label: 'MAE/RMSE', path: '/metrics/mae-rmse', icon: '📏' },
      { label: 'Sharpe Ratio', path: '/metrics/sharpe', icon: '📐' },
      { label: 'Closing Line Value', path: '/metrics/clv', icon: '📉' }
    ]
  },
  {
    title: 'Infrastructure',
    items: [
      { label: 'Data Pipelines', path: '/infra/pipelines', icon: '🔀' },
      { label: 'MLOps', path: '/infra/mlops', icon: '⚙️' },
      { label: 'Simulation Engines', path: '/infra/simulation', icon: '🖥️' },
      { label: 'Dashboards', path: '/infra/dashboards', icon: '📺' },
      { label: 'Model Versioning', path: '/infra/versioning', icon: '📂' }
    ]
  }
];

// Export flat list for search
export const allTopics = navigation.flatMap(section => 
  section.items.map(item => ({
    ...item,
    section: section.title
  }))
);

