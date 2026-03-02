/**
 * Integrated Gradients Deep Dive Tutorial
 * Comprehensive guide to the Integrated Gradients explainability method
 */

import { Tutorial } from '../../types/tutorial';

export const integratedGradientsDeepDiveTutorial: Tutorial = {
  id: 'integrated-gradients-deepdive',
  title: 'Integrated Gradients: A Deep Dive',
  description: 'Master the Integrated Gradients attribution method — understand the theory, the axioms it satisfies, how it compares to Grad-CAM and saliency maps, and how to interpret results in WhyteBox.',
  category: 'explainability',
  difficulty: 'advanced',
  estimatedTime: 35,
  prerequisites: ['understanding-gradcam'],
  tags: ['integrated-gradients', 'explainability', 'attribution', 'axioms', 'advanced', 'pytorch'],
  steps: [
    {
      id: 'intro',
      type: 'info',
      title: 'Why Integrated Gradients?',
      content: `Grad-CAM is powerful but has limitations:
• Produces coarse heatmaps (resolution of last conv layer)
• Only works for CNNs
• Not theoretically grounded in attribution axioms

**Integrated Gradients** (Sundararajan et al., 2017) addresses these:
• Pixel-level attribution (full input resolution)
• Works on any differentiable model (CNNs, transformers, MLPs)
• Satisfies two fundamental axioms: Sensitivity and Implementation Invariance
• Theoretically principled — based on path integrals

**Paper:** "Axiomatic Attribution for Deep Networks" (ICML 2017)

This tutorial will take you from the intuition to the math to practical use in WhyteBox.`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'the-problem-with-gradients',
      type: 'info',
      title: 'The Problem with Plain Gradients',
      content: `The simplest attribution method is the gradient of the output with respect to the input (saliency maps). But plain gradients have a critical flaw:

**Saturation problem:**
Consider ReLU(x). When x >> 0, the output is saturated — the gradient is 1 regardless of how large x is. A pixel with value 255 and a pixel with value 100 both get gradient = 1, even though the larger pixel is clearly more "present".

**Example:**
A model trained to detect cats might have learned that "very orange fur" = cat. But if the input has extremely orange fur, the gradient saturates and the attribution is the same as for mildly orange fur.

**Integrated Gradients solution:**
Instead of the gradient at one point, integrate gradients along the entire path from baseline (no information) to the actual input. This captures the full contribution of each feature.`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'the-baseline',
      type: 'info',
      title: 'Choosing a Baseline',
      content: `The baseline x' represents "absence of information" — the reference point from which we measure feature contributions.

**Common choices:**
• **Black image (all zeros)**: Most common for vision. Represents "no pixel information".
• **Gaussian noise**: Averages out baseline-specific artifacts.
• **Mean training image**: Represents "average" input.
• **Zero embedding**: For NLP models, a zero vector or [PAD] token embedding.

**WhyteBox default:** Black image (all zeros) for vision models.

**Why the choice matters:**
The attribution measures F(x) - F(x'), i.e., how much the prediction changes from baseline to input. If the baseline already has a high prediction score, attributions will be smaller.

**Completeness axiom:**
The sum of all attributions equals F(x) - F(x'). This is a key property — attributions are "complete" in that they fully account for the prediction difference.`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'the-math',
      type: 'info',
      title: 'The Mathematics',
      content: `**Integrated Gradients formula:**

IG_i(x) = (x_i - x'_i) × ∫₀¹ [∂F(x' + α(x - x')) / ∂x_i] dα

Where:
• x = input, x' = baseline
• α ∈ [0, 1] interpolates from baseline to input
• ∂F/∂x_i = gradient of output w.r.t. input feature i
• The integral accumulates gradients along the straight path

**Practical approximation (Riemann sum):**
IG_i(x) ≈ (x_i - x'_i) × (1/m) × Σₖ₌₁ᵐ [∂F(x' + (k/m)(x - x')) / ∂x_i]

Where m = number of interpolation steps (WhyteBox uses m=50 by default).

**Intuition:** We're asking "as we gradually turn on each pixel from 0 to its actual value, how much does the prediction change at each step?" The sum of all those changes is the attribution.`,
      codeSnippet: {
        language: 'python',
        code: `import torch
import torch.nn.functional as F

def integrated_gradients(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,   # (1, C, H, W)
    target_class: int,
    baseline: torch.Tensor = None,
    steps: int = 50,
) -> torch.Tensor:
    """
    Compute Integrated Gradients attribution.
    Returns attribution map of same shape as input_tensor.
    """
    if baseline is None:
        baseline = torch.zeros_like(input_tensor)

    # Generate interpolated inputs: baseline → input
    alphas = torch.linspace(0, 1, steps + 1).to(input_tensor.device)
    interpolated = baseline + alphas.view(-1, 1, 1, 1) * (input_tensor - baseline)
    interpolated.requires_grad_(True)

    # Forward pass for all interpolated inputs
    outputs = model(interpolated)
    scores = outputs[:, target_class]

    # Compute gradients
    grads = torch.autograd.grad(scores.sum(), interpolated)[0]

    # Average gradients and multiply by (input - baseline)
    avg_grads = grads[:-1].mean(dim=0)  # exclude endpoint
    attributions = (input_tensor - baseline) * avg_grads

    return attributions`,
      },
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'the-two-axioms',
      type: 'info',
      title: 'The Two Fundamental Axioms',
      content: `Integrated Gradients is the unique path method satisfying both axioms:

**Axiom 1: Sensitivity**
If the baseline and input differ in exactly one feature, and the predictions differ, that feature must receive non-zero attribution.

*Why plain gradients fail:* A saturated ReLU has gradient = 0 even when the feature clearly matters.

**Axiom 2: Implementation Invariance**
Two networks that compute the same function (same input → same output for all inputs) must have identical attributions.

*Why Guided Backpropagation fails:* It modifies gradients during backprop (clamps negative gradients), so two equivalent networks can produce different attributions. This means Guided Backprop attributions reflect the implementation, not the function.

**Additional property: Completeness**
Σᵢ IG_i(x) = F(x) - F(x')

The attributions sum to the total prediction difference from baseline to input. This makes them interpretable as "how much did each feature contribute to the prediction change?"`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'navigate-explainability',
      type: 'action',
      title: 'Try Integrated Gradients in WhyteBox',
      content: `Let's generate an Integrated Gradients visualization in WhyteBox.

Navigate to the Explainability page to get started.

**Steps you'll follow:**
1. Select a model (e.g., ResNet-50)
2. Upload an image
3. Select "Integrated Gradients" as the method
4. Click "Generate"
5. Compare with Grad-CAM side-by-side`,
      targetElement: '[href="/explainability"]',
      position: 'right',
      action: { type: 'navigate', target: '/explainability' },
      completionCriteria: { type: 'action' },
    },
    {
      id: 'interpreting-results',
      type: 'info',
      title: 'Interpreting Integrated Gradients Results',
      content: `**Reading the attribution map:**

• **Positive attributions (warm colors)**: Pixels that increased the prediction score — evidence FOR the predicted class
• **Negative attributions (cool colors)**: Pixels that decreased the prediction score — evidence AGAINST the predicted class
• **Near-zero (neutral)**: Pixels that had little effect on the prediction

**Key differences from Grad-CAM:**
• IG shows full-resolution pixel-level detail (not upsampled from conv layer)
• IG can show negative attributions (Grad-CAM only shows positive)
• IG attributions are more precise but can be noisier
• Grad-CAM is faster and often more visually interpretable

**When to use each:**
• Use **Grad-CAM** for quick, high-level "where is the model looking?"
• Use **Integrated Gradients** for precise pixel-level attribution and when working with non-CNN models
• Use **Compare** mode in WhyteBox to see both side-by-side`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'compare-methods',
      type: 'action',
      title: 'Compare All Methods Side-by-Side',
      content: `WhyteBox's "Compare" feature runs all three explainability methods simultaneously and displays them side-by-side.

Navigate to the Explainability page and click "Compare Methods" to see:
• Grad-CAM heatmap
• Saliency map (plain gradients)
• Integrated Gradients attribution

This is the best way to understand the trade-offs between methods for your specific model and input.`,
      targetElement: '[data-testid="compare-methods-button"]',
      position: 'bottom',
      action: { type: 'navigate', target: '/explainability' },
      canSkip: true,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'smoothgrad-extension',
      type: 'info',
      title: 'SmoothGrad: Reducing Noise',
      content: `Integrated Gradients can sometimes produce noisy attributions. **SmoothGrad** (Smilkov et al., 2017) addresses this by averaging attributions over multiple noisy copies of the input.

**SmoothGrad + IG:**
1. Add Gaussian noise to the input N times
2. Compute IG for each noisy input
3. Average the attributions

This reduces high-frequency noise and produces smoother, more visually interpretable maps.

**Trade-off:** N× more computation (N is typically 50–200).

**In practice:**
For production use, Integrated Gradients with 50 steps is usually sufficient. SmoothGrad is useful when you need publication-quality visualizations or when the standard IG maps are too noisy for your model.`,
      codeSnippet: {
        language: 'python',
        code: `def smoothgrad_integrated_gradients(
    model, input_tensor, target_class,
    baseline=None, ig_steps=50, sg_samples=50, noise_level=0.1
):
    """SmoothGrad applied to Integrated Gradients."""
    attributions = []
    noise_std = noise_level * (input_tensor.max() - input_tensor.min())

    for _ in range(sg_samples):
        noisy_input = input_tensor + torch.randn_like(input_tensor) * noise_std
        ig = integrated_gradients(model, noisy_input, target_class, baseline, ig_steps)
        attributions.append(ig)

    return torch.stack(attributions).mean(dim=0)`,
      },
      position: 'center',
      canSkip: true,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'quiz',
      type: 'quiz',
      title: 'Knowledge Check',
      content: 'Test your understanding of Integrated Gradients!',
      quiz: {
        question: 'The sum of all Integrated Gradients attributions for an input equals:',
        options: [
          'The model\'s confidence score for the predicted class',
          'The difference in prediction between the input and the baseline',
          'The L2 norm of the input tensor',
          'The number of interpolation steps used',
        ],
        correctAnswer: 1,
        explanation: 'This is the Completeness property: Σᵢ IG_i(x) = F(x) - F(x\'). The attributions sum to exactly the difference in model output between the actual input and the baseline. This makes them interpretable as "how much did each feature contribute to the prediction change from baseline?"',
      },
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'completion',
      type: 'info',
      title: 'Tutorial Complete! 🎉',
      content: `You've mastered Integrated Gradients!

**What you learned:**
✓ Why plain gradients fail (saturation problem)
✓ The role of the baseline in attribution
✓ The IG formula and Riemann sum approximation
✓ Sensitivity and Implementation Invariance axioms
✓ How to interpret positive and negative attributions
✓ When to use IG vs Grad-CAM vs Saliency Maps
✓ SmoothGrad for noise reduction

**Next steps:**
• Take the "Integrated Gradients" quiz to test your knowledge
• Try the "Comparing Methods" tutorial for a side-by-side comparison
• Experiment with different baselines in WhyteBox
• Read the original paper: Sundararajan et al. (2017) "Axiomatic Attribution for Deep Networks"`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'auto' },
    },
  ],
  createdAt: new Date('2024-02-10'),
  updatedAt: new Date('2024-02-10'),
  version: '1.0.0',
  rewards: {
    points: 250,
    badges: ['ig-expert', 'axiom-master', 'explainability-pro'],
  },
};

// Made with Bob