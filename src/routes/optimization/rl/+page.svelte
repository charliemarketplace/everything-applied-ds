<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // RL parameters
  let learningRate = $state(0.1);
  let discountFactor = $state(0.95);
  let explorationRate = $state(0.2);
  let episodes = $state(100);

  // Simulate Q-learning (simplified for demo)
  const learningCurve = $derived(() => {
    const rng = createRNG(42);
    const smoothed: number[] = [];
    
    // Generate a plausible learning curve without full simulation
    const maxReward = 2 + learningRate * 3 + (1 - explorationRate) * 2;
    const convergenceSpeed = learningRate * discountFactor * 10;
    
    for (let e = 0; e < episodes; e++) {
      // Sigmoid-like learning curve
      const progress = 1 - Math.exp(-convergenceSpeed * e / episodes);
      const noise = (rng() - 0.5) * (1 - progress) * 2;
      const reward = progress * maxReward + noise;
      smoothed.push(reward);
    }
    
    return smoothed;
  });

  // Final performance
  const finalPerformance = $derived(() => {
    const curve = learningCurve();
    const last10 = curve.slice(-10);
    return last10.reduce((s, r) => s + r, 0) / last10.length;
  });

  const episodeLabels = $derived(Array.from({ length: episodes }, (_, i) => (i + 1).toString()));

  // RL concepts
  const concepts = [
    { name: 'State', desc: 'Current situation (bankroll, game state)', example: 'Bankroll = $1000' },
    { name: 'Action', desc: 'Decision to make (bet size, hedge)', example: 'Bet $50' },
    { name: 'Reward', desc: 'Immediate feedback (+win, -loss)', example: '+$50 or -$50' },
    { name: 'Policy', desc: 'Strategy mapping states to actions', example: 'Kelly fraction' }
  ];

  // Algorithms
  const algorithms = [
    { name: 'Q-Learning', type: 'Value-based', use: 'Discrete actions' },
    { name: 'DQN', type: 'Deep Q-Network', use: 'Large state spaces' },
    { name: 'PPO', type: 'Policy gradient', use: 'Continuous actions' },
    { name: 'A2C', type: 'Actor-Critic', use: 'Stable learning' }
  ];
</script>

<svelte:head>
  <title>Reinforcement Learning | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Optimization</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Reinforcement Learning</h1>
    <p class="section-subtitle max-w-3xl">
      Learn optimal strategies through trial and error. The agent explores,
      receives rewards, and gradually discovers the best policy.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The RL Framework</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each concepts as concept}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{concept.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{concept.desc}</p>
          <p class="text-xs text-jade-400 font-mono">{concept.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Hyperparameters</h3>
        <div class="space-y-4">
          <Slider bind:value={learningRate} min={0.01} max={0.5} step={0.01} label="Learning Rate (α)" />
          <Slider bind:value={discountFactor} min={0.8} max={0.99} step={0.01} label="Discount Factor (γ)" />
          <Slider bind:value={explorationRate} min={0.05} max={0.5} step={0.05} label="Exploration (ε)" />
          <Slider bind:value={episodes} min={50} max={200} step={25} label="Episodes" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Training Results</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Final Avg Reward</span>
            <span class="font-mono {finalPerformance() > 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {finalPerformance().toFixed(1)}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Episodes Run</span>
            <span class="font-mono text-obsidian-200">{episodes}</span>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400 mt-2">
            {#if finalPerformance() > 2}
              ✓ Agent learned profitable strategy
            {:else if finalPerformance() > 0}
              ⚡ Agent improving, needs more training
            {:else}
              ⚠️ Not converged—try different hyperparameters
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Learning Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Learning Curve</h3>
        <div class="h-48">
          <LineChart 
            labels={episodeLabels}
            datasets={[
              {
                label: 'Avg Reward (smoothed)',
                data: learningCurve(),
                borderColor: '#34d399',
                fill: false
              }
            ]}
            xAxisLabel="Episode"
            yAxisLabel="Reward"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Higher learning rate → faster but noisier. Higher exploration → more diverse experience but slower convergence.
        </p>
      </div>

      <!-- Exploration vs Exploitation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Exploration vs Exploitation</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">🔍 Exploration</h4>
            <p class="text-xs text-obsidian-300 mb-2">Try new actions to discover better strategies</p>
            <div class="w-full h-3 bg-obsidian-700 rounded-full overflow-hidden">
              <div class="h-full bg-amber-350" style="width: {explorationRate * 100}%"></div>
            </div>
            <p class="text-xs text-obsidian-400 mt-1">{(explorationRate * 100).toFixed(0)}% random actions</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-2">💰 Exploitation</h4>
            <p class="text-xs text-obsidian-300 mb-2">Use best known action to maximize reward</p>
            <div class="w-full h-3 bg-obsidian-700 rounded-full overflow-hidden">
              <div class="h-full bg-jade-500" style="width: {(1 - explorationRate) * 100}%"></div>
            </div>
            <p class="text-xs text-obsidian-400 mt-1">{((1 - explorationRate) * 100).toFixed(0)}% greedy actions</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Algorithms -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🤖 RL Algorithms</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each algorithms as algo}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <h3 class="text-amber-350 font-semibold mb-1">{algo.name}</h3>
          <p class="text-xs text-obsidian-400 mb-1">{algo.type}</p>
          <p class="text-xs text-jade-400">{algo.use}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Dynamic Bet Sizing</h3>
        <p class="text-xs text-obsidian-400">Learn optimal Kelly fraction based on bankroll state</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Live Betting</h3>
        <p class="text-xs text-obsidian-400">When to bet in-play based on game state</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Market Making</h3>
        <p class="text-xs text-obsidian-400">Dynamic line adjustment based on order flow</p>
      </div>
    </div>
  </div>

  <!-- R/Python Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">Python</span> Code
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Q-Learning for bet sizing
import numpy as np

class BettingAgent:
    def __init__(self, states=10, actions=3, lr={learningRate}, gamma={discountFactor}, eps={explorationRate}):
        self.q_table = np.zeros((states, actions))
        self.lr = lr
        self.gamma = gamma
        self.eps = eps
    
    def choose_action(self, state):
        if np.random.random() &lt; self.eps:
            return np.random.randint(len(self.q_table[state]))
        return np.argmax(self.q_table[state])
    
    def learn(self, state, action, reward, next_state):
        max_next_q = np.max(self.q_table[next_state])
        td_target = reward + self.gamma * max_next_q
        td_error = td_target - self.q_table[state, action]
        self.q_table[state, action] += self.lr * td_error

# Train
agent = BettingAgent()
for episode in range({episodes}):
    state = 5  # Mid bankroll
    for step in range(20):
        action = agent.choose_action(state)
        # ... execute action, get reward, next_state
        agent.learn(state, action, reward, next_state)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• RL learns from interaction, not labeled data</li>
        <li>• Balance exploration (discover) vs exploitation (profit)</li>
        <li>• Q-learning for discrete, policy gradient for continuous</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Requires many episodes to converge</li>
        <li>• Great for sequential decision problems</li>
        <li>• Simulator needed for safe training</li>
      </ul>
    </div>
  </div>
</div>

