<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Model quality
  let modelSeparation = $state(1.5);
  let threshold = $state(0.5);
  let numSamples = $state(200);

  // Generate predictions
  const generatePredictions = $derived(() => {
    const rng = createRNG(42);
    const predictions: Array<{ prob: number, actual: number }> = [];
    
    for (let i = 0; i < numSamples; i++) {
      const actual = rng() < 0.5 ? 0 : 1;
      
      // Generate score based on true class
      let score: number;
      if (actual === 1) {
        score = normalRandom(rng, 0.5 + modelSeparation * 0.15, 0.2);
      } else {
        score = normalRandom(rng, 0.5 - modelSeparation * 0.15, 0.2);
      }
      score = Math.max(0.01, Math.min(0.99, score));
      
      predictions.push({ prob: score, actual });
    }
    
    return predictions;
  });

  // Calculate confusion matrix at threshold
  const confusionMatrix = $derived(() => {
    const preds = generatePredictions();
    let tp = 0, fp = 0, tn = 0, fn = 0;
    
    for (const p of preds) {
      const predicted = p.prob >= threshold ? 1 : 0;
      if (p.actual === 1 && predicted === 1) tp++;
      if (p.actual === 0 && predicted === 1) fp++;
      if (p.actual === 0 && predicted === 0) tn++;
      if (p.actual === 1 && predicted === 0) fn++;
    }
    
    const tpr = tp / (tp + fn) || 0; // Sensitivity
    const fpr = fp / (fp + tn) || 0; // 1 - Specificity
    const precision = tp / (tp + fp) || 0;
    const accuracy = (tp + tn) / preds.length;
    
    return { tp, fp, tn, fn, tpr, fpr, precision, accuracy };
  });

  // Generate ROC curve
  const rocCurve = $derived(() => {
    const preds = generatePredictions();
    const thresholds = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const points: Array<{ fpr: number, tpr: number }> = [];
    
    for (const t of thresholds) {
      let tp = 0, fp = 0, tn = 0, fn = 0;
      
      for (const p of preds) {
        const predicted = p.prob >= t ? 1 : 0;
        if (p.actual === 1 && predicted === 1) tp++;
        if (p.actual === 0 && predicted === 1) fp++;
        if (p.actual === 0 && predicted === 0) tn++;
        if (p.actual === 1 && predicted === 0) fn++;
      }
      
      const tpr = tp / (tp + fn) || 0;
      const fpr = fp / (fp + tn) || 0;
      points.push({ fpr, tpr });
    }
    
    return points.sort((a, b) => a.fpr - b.fpr);
  });

  // Calculate AUC (trapezoidal)
  const auc = $derived(() => {
    const curve = rocCurve();
    let area = 0;
    
    for (let i = 1; i < curve.length; i++) {
      const width = curve[i].fpr - curve[i-1].fpr;
      const height = (curve[i].tpr + curve[i-1].tpr) / 2;
      area += width * height;
    }
    
    return Math.abs(area);
  });

  function getAucClass(auc: number): string {
    if (auc >= 0.9) return 'text-jade-400';
    if (auc >= 0.8) return 'text-jade-400/70';
    if (auc >= 0.7) return 'text-amber-350';
    if (auc >= 0.6) return 'text-amber-350/70';
    return 'text-crimson-400';
  }

  function getAucLabel(auc: number): string {
    if (auc >= 0.9) return 'Excellent';
    if (auc >= 0.8) return 'Good';
    if (auc >= 0.7) return 'Fair';
    if (auc >= 0.6) return 'Poor';
    return 'Fail';
  }
</script>

<svelte:head>
  <title>ROC-AUC | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">ROC-AUC</h1>
    <p class="section-subtitle max-w-3xl">
      Measure classifier performance across all thresholds. AUC = probability 
      that model ranks a random positive higher than a random negative.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 ROC Curve Basics</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-amber-350 font-semibold mb-2">What It Measures</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-jade-400">TPR (True Positive Rate)</span> = TP / (TP + FN)</li>
          <li class="text-xs text-obsidian-400 ml-4">a.k.a. Sensitivity, Recall</li>
          <li><span class="text-crimson-400">FPR (False Positive Rate)</span> = FP / (FP + TN)</li>
          <li class="text-xs text-obsidian-400 ml-4">a.k.a. 1 - Specificity</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">AUC Interpretation</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• <span class="text-jade-400">1.0</span> = Perfect classifier</li>
          <li>• <span class="text-jade-400">0.9+</span> = Excellent</li>
          <li>• <span class="text-amber-350">0.7-0.9</span> = Good to Fair</li>
          <li>• <span class="text-crimson-400">0.5</span> = Random guessing</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Model Quality</h3>
        <div class="space-y-4">
          <Slider bind:value={modelSeparation} min={0} max={3} step={0.1} label="Class Separation" />
          <Slider bind:value={threshold} min={0.1} max={0.9} step={0.05} label="Decision Threshold" />
        </div>
        <p class="text-xs text-obsidian-400 mt-3">
          Higher separation = better model can distinguish classes
        </p>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 AUC Score</h3>
        <div class="text-center">
          <div class="font-mono text-5xl {getAucClass(auc())}">
            {auc().toFixed(3)}
          </div>
          <div class="text-sm text-obsidian-400 mt-2">{getAucLabel(auc())}</div>
        </div>
        <div class="mt-4 h-3 bg-obsidian-800 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-300 {getAucClass(auc()).replace('text-', 'bg-')}"
            style="width: {auc() * 100}%"
          ></div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">At Threshold {threshold.toFixed(2)}</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">TPR (Recall)</span>
            <span class="font-mono text-jade-400">{(confusionMatrix().tpr * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">FPR</span>
            <span class="font-mono text-crimson-400">{(confusionMatrix().fpr * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Precision</span>
            <span class="font-mono text-amber-350">{(confusionMatrix().precision * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Accuracy</span>
            <span class="font-mono text-obsidian-200">{(confusionMatrix().accuracy * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- ROC Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">ROC Curve</h3>
        <div class="h-64">
          <LineChart 
            labels={rocCurve().map(p => (p.fpr * 100).toFixed(0) + '%')}
            datasets={[
              {
                label: 'ROC Curve',
                data: rocCurve().map(p => p.tpr * 100),
                borderColor: '#f5c542',
                fill: true,
                backgroundColor: 'rgba(245, 197, 66, 0.1)'
              },
              {
                label: 'Random (AUC=0.5)',
                data: rocCurve().map(p => p.fpr * 100),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="False Positive Rate"
            yAxisLabel="True Positive Rate"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Curve above diagonal = better than random. Area under curve = AUC.
        </p>
      </div>

      <!-- Confusion Matrix -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Confusion Matrix</h3>
        <div class="grid grid-cols-3 gap-2 max-w-md mx-auto">
          <div></div>
          <div class="text-center text-xs text-obsidian-400">Pred: Pos</div>
          <div class="text-center text-xs text-obsidian-400">Pred: Neg</div>
          
          <div class="text-xs text-obsidian-400 flex items-center">Actual: Pos</div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-jade-400">{confusionMatrix().tp}</div>
            <div class="text-xs text-obsidian-400">TP</div>
          </div>
          <div class="p-4 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-crimson-400">{confusionMatrix().fn}</div>
            <div class="text-xs text-obsidian-400">FN</div>
          </div>
          
          <div class="text-xs text-obsidian-400 flex items-center">Actual: Neg</div>
          <div class="p-4 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-crimson-400">{confusionMatrix().fp}</div>
            <div class="text-xs text-obsidian-400">FP</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-jade-400">{confusionMatrix().tn}</div>
            <div class="text-xs text-obsidian-400">TN</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- When to Use -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 When to Use ROC-AUC</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-3">✓ Good For</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Comparing models across all thresholds</li>
          <li>• Balanced class problems</li>
          <li>• When threshold is flexible</li>
          <li>• Ranking quality (who's more likely?)</li>
        </ul>
      </div>
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-3">✗ Limitations</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Imbalanced classes (use PR-AUC instead)</li>
          <li>• When you need specific threshold</li>
          <li>• Doesn't measure calibration</li>
          <li>• Can mislead with rare events</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate ROC-AUC
library(pROC)

# From predictions and actual
roc_obj &lt;- roc(actual, predicted_prob)
auc_value &lt;- auc(roc_obj)
cat(sprintf("AUC: %.3f\n", auc_value))

# Plot ROC curve
plot(roc_obj, main = "ROC Curve", 
     col = "#f5c542", lwd = 2)
abline(a = 0, b = 1, col = "gray", lty = 2)

# Confusion matrix at threshold
threshold &lt;- {threshold}
predicted_class &lt;- ifelse(predicted_prob &gt;= threshold, 1, 0)
table(Actual = actual, Predicted = predicted_class)

# Calculate metrics
library(caret)
confusionMatrix(factor(predicted_class), factor(actual))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• ROC plots TPR vs FPR at all thresholds</li>
        <li>• AUC = area under curve (higher = better)</li>
        <li>• 0.5 = random, 1.0 = perfect</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Threshold-independent metric</li>
        <li>• Use PR-AUC for imbalanced classes</li>
        <li>• Measures ranking, not calibration</li>
      </ul>
    </div>
  </div>
</div>

