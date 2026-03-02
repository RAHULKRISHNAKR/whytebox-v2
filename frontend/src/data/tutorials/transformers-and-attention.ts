/**
 * Transformers & Attention Mechanisms Tutorial
 * Deep dive into transformer architecture and attention visualization
 */

import { Tutorial } from '../../types/tutorial';

export const transformersAttentionTutorial: Tutorial = {
  id: 'transformers-and-attention',
  title: 'Transformers & Attention Mechanisms',
  description: 'Understand how transformer models work, explore self-attention and multi-head attention, and use WhyteBox to visualize attention patterns in BERT, GPT-2, and ViT.',
  category: 'architecture',
  difficulty: 'intermediate',
  estimatedTime: 30,
  prerequisites: ['getting-started'],
  tags: ['transformers', 'attention', 'bert', 'gpt-2', 'vit', 'nlp', 'visualization'],
  steps: [
    {
      id: 'intro',
      type: 'info',
      title: 'What Are Transformers?',
      content: `Transformers are a neural network architecture introduced in "Attention Is All You Need" (Vaswani et al., 2017). They have become the dominant architecture for NLP and are increasingly used in computer vision.

**Key innovations:**
• Self-attention: every token can directly attend to every other token
• Parallel processing: no sequential dependency like RNNs
• Scalability: performance improves predictably with more data and parameters

**Models in WhyteBox that use transformers:**
• BERT-base (110M params) — bidirectional encoder for NLP
• GPT-2 (117M params) — autoregressive decoder for text generation
• ViT-B/16 (86M params) — vision transformer for image classification

Let's explore how they work!`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'self-attention-concept',
      type: 'info',
      title: 'Self-Attention: The Core Idea',
      content: `Self-attention allows each token to "look at" all other tokens and decide how much to attend to each one.

**The three vectors:**
• **Query (Q)**: "What am I looking for?"
• **Key (K)**: "What do I contain?"
• **Value (V)**: "What information do I carry?"

**The formula:**
Attention(Q, K, V) = softmax(QK^T / √d_k) × V

**Step by step:**
1. Compute dot product of Q with all K vectors → attention scores
2. Scale by √d_k to prevent vanishing gradients
3. Apply softmax → attention weights (sum to 1)
4. Weighted sum of V vectors → output

**Example:** In "The cat sat on the mat", when processing "sat", the model might attend strongly to "cat" (subject) and "mat" (location).`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'multi-head-attention',
      type: 'info',
      title: 'Multi-Head Attention',
      content: `Instead of running attention once, transformers run it multiple times in parallel — each "head" learns to attend to different aspects.

**Why multiple heads?**
• Head 1 might focus on syntactic relationships (subject-verb)
• Head 2 might focus on coreference (pronouns → nouns)
• Head 3 might focus on positional proximity

**Architecture:**
• BERT-base: 12 attention heads per layer, 12 layers
• GPT-2: 12 attention heads per layer, 12 layers
• ViT-B/16: 12 attention heads per layer, 12 layers

**In WhyteBox:**
Each attention head is visualized as a diamond-shaped node in the 3D architecture view. The attention heatmap panel shows the weight matrix for any selected layer and head.`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'navigate-to-models',
      type: 'action',
      title: 'Load a Transformer Model',
      content: `Let's explore a transformer model in WhyteBox. Navigate to the Models page to see the available transformer models.

You'll find:
• **BERT-base** — great for understanding bidirectional attention
• **GPT-2** — shows causal (left-to-right) attention patterns
• **ViT-B/16** — shows how attention works on image patches

Click on "Models" in the sidebar to continue.`,
      targetElement: '[href="/models"]',
      position: 'right',
      action: { type: 'navigate', target: '/models' },
      completionCriteria: { type: 'action' },
    },
    {
      id: 'select-bert',
      type: 'highlight',
      title: 'Select BERT-base',
      content: `Find the BERT-base model card and click "Visualize" to open it in the 3D architecture viewer.

**BERT-base architecture:**
• 12 transformer encoder layers
• 12 attention heads per layer
• 768 hidden dimensions
• 110M total parameters

BERT is bidirectional — it can attend to tokens both before and after the current position, making it excellent for understanding tasks.`,
      targetElement: '[data-testid="model-card"]',
      position: 'top',
      canSkip: true,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'explore-3d-transformer',
      type: 'action',
      title: 'Explore the 3D Transformer Architecture',
      content: `Navigate to the Visualization page to see the transformer architecture in 3D.

**What you'll see:**
• 🔷 Diamond shapes = Attention head layers
• 🔶 Hexagonal prisms = Feed-forward layers
• 🔵 Spheres = Embedding/dense layers
• 🟦 Boxes = Normalization layers

**Layer colors:**
• Purple = Attention layers
• Teal = Feed-forward layers
• Blue = Embedding layers

Try rotating the view with mouse drag and zooming with the scroll wheel.`,
      targetElement: '[href="/visualization"]',
      position: 'right',
      action: { type: 'navigate', target: '/visualization?model=bert-base' },
      completionCriteria: { type: 'action' },
    },
    {
      id: 'attention-heatmap-intro',
      type: 'info',
      title: 'Reading Attention Heatmaps',
      content: `The Attention Heatmap panel (visible when a transformer model is loaded) shows the attention weight matrix.

**How to read it:**
• Rows = query tokens (the token doing the attending)
• Columns = key tokens (the tokens being attended to)
• Brighter cell = stronger attention weight
• Each row sums to 1.0 (softmax output)

**Interesting patterns to look for:**
• **Diagonal pattern**: tokens attending to themselves (common in early layers)
• **Vertical stripes**: a token that many others attend to (often [CLS] or punctuation)
• **Block patterns**: groups of related tokens attending to each other
• **Sparse patterns**: focused attention on specific tokens

Use the layer and head selectors to explore different attention patterns.`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'bert-vs-gpt',
      type: 'info',
      title: 'BERT vs GPT-2: Different Attention Patterns',
      content: `BERT and GPT-2 have fundamentally different attention patterns due to their training objectives.

**BERT (Bidirectional):**
• Can attend to all tokens in both directions
• Trained with Masked Language Modeling (MLM)
• Attention patterns are symmetric — token 5 can attend to token 10 and vice versa
• Best for: classification, NER, question answering

**GPT-2 (Causal/Autoregressive):**
• Can only attend to previous tokens (causal mask)
• Trained to predict the next token
• Attention matrix is lower-triangular — no future token access
• Best for: text generation, completion

**ViT (Vision Transformer):**
• Attends between image patches (16×16 pixel regions)
• [CLS] token aggregates global image information
• Later layers often show semantic grouping (sky patches attend to each other)`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'positional-encoding',
      type: 'info',
      title: 'Positional Encoding',
      content: `Self-attention is permutation-invariant — without positional information, "cat sat on mat" and "mat on sat cat" would produce identical representations.

**Solution: Positional Encoding**
Added to token embeddings before the transformer encoder.

**Sinusoidal (original Transformer):**
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

**Learned (BERT, GPT-2, ViT):**
Position embeddings are learned parameters, just like token embeddings.

**ViT patch positions:**
Each 16×16 patch gets a 2D positional embedding encoding its row and column in the image grid.`,
      codeSnippet: {
        language: 'python',
        code: `import torch
import math

def sinusoidal_positional_encoding(seq_len: int, d_model: int) -> torch.Tensor:
    """
    Compute sinusoidal positional encodings.
    Returns: (seq_len, d_model) tensor
    """
    pe = torch.zeros(seq_len, d_model)
    position = torch.arange(0, seq_len).unsqueeze(1).float()
    div_term = torch.exp(
        torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
    )
    pe[:, 0::2] = torch.sin(position * div_term)
    pe[:, 1::2] = torch.cos(position * div_term)
    return pe`,
      },
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'quiz',
      type: 'quiz',
      title: 'Knowledge Check',
      content: 'Test what you\'ve learned about transformers!',
      quiz: {
        question: 'In a causal (autoregressive) transformer like GPT-2, which tokens can position 5 attend to?',
        options: [
          'All tokens in the sequence (positions 1–N)',
          'Only tokens at positions 1, 2, 3, 4, and 5 (current and previous)',
          'Only the immediately preceding token (position 4)',
          'Only future tokens (positions 6–N)',
        ],
        correctAnswer: 1,
        explanation: 'GPT-2 uses a causal mask that prevents attending to future tokens. Position 5 can only attend to positions 1 through 5 (itself and all previous tokens). This is what makes it autoregressive — it generates text left-to-right.',
      },
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'manual' },
    },
    {
      id: 'completion',
      type: 'info',
      title: 'Congratulations! 🎉',
      content: `You've completed the Transformers & Attention tutorial!

**What you learned:**
✓ How self-attention works (Q, K, V vectors)
✓ Why multi-head attention captures different relationships
✓ How to read attention heatmaps in WhyteBox
✓ Differences between BERT (bidirectional) and GPT-2 (causal)
✓ How positional encoding gives transformers sequence awareness

**Next steps:**
• Take the "Transformers & Attention" quiz to test your knowledge
• Explore the ViT-B/16 model to see attention on image patches
• Try the "Integrated Gradients" tutorial for another explainability method
• Compare attention patterns across different layers and heads`,
      position: 'center',
      canSkip: false,
      completionCriteria: { type: 'auto' },
    },
  ],
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date('2024-02-01'),
  version: '1.0.0',
  rewards: {
    points: 200,
    badges: ['transformer-explorer', 'attention-master'],
  },
};

// Made with Bob