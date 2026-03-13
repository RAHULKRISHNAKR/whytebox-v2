"""Transformer architectures (BERT-base: 110M params, GPT-2: 117M params)."""

from typing import Any, Dict

from .base import _L, _build


def _bert_base() -> Dict[str, Any]:
    """
    Return static architecture for BERT-base (110M parameters).

    Architecture:
    - Token + Position Embeddings (768-dim)
    - 12 Encoder Layers, each with:
      - Multi-Head Self-Attention (12 heads, 64-dim each)
      - Add & Norm
      - Feed-Forward Network (768 → 3072 → 768)
      - Add & Norm
    - Pooler (dense layer for [CLS] token)

    No model weights loaded — instant response for visualization.
    """
    layers = []

    # Embedding layer
    layers.append(_L(
        "embeddings",
        "Embedding",
        "dense",
        23_835_648,  # word + position + token_type embeddings
        True,
        {"vocab_size": 30522, "hidden_size": 768, "max_position_embeddings": 512},
        [512],  # sequence length
        [512, 768],  # [seq_len, hidden_size]
    ))

    # 12 Encoder layers
    for layer_idx in range(12):
        prefix = f"encoder.layer.{layer_idx}"

        # Multi-Head Self-Attention
        layers.append(_L(
            f"{prefix}.attention.self",
            "MultiHeadAttention",
            "dense",
            2_359_296,  # Q, K, V projections
            True,
            {"num_heads": 12, "head_dim": 64, "hidden_size": 768},
            [512, 768],
            [512, 768],
        ))

        # Attention output projection
        layers.append(_L(
            f"{prefix}.attention.output.dense",
            "Linear",
            "dense",
            590_592,
            True,
            {"in_features": 768, "out_features": 768, "bias": True},
            [512, 768],
            [512, 768],
        ))

        # Layer Norm 1
        layers.append(_L(
            f"{prefix}.attention.output.LayerNorm",
            "LayerNorm",
            "normalization",
            1_536,
            True,
            {"normalized_shape": 768, "eps": 1e-12},
            [512, 768],
            [512, 768],
        ))

        # Feed-Forward Network - Intermediate (768 → 3072)
        layers.append(_L(
            f"{prefix}.intermediate.dense",
            "Linear",
            "dense",
            2_362_368,
            True,
            {"in_features": 768, "out_features": 3072, "bias": True},
            [512, 768],
            [512, 3072],
        ))

        # GELU activation
        layers.append(_L(
            f"{prefix}.intermediate.gelu",
            "GELU",
            "activation",
            0,
            False,
            {},
            [512, 3072],
            [512, 3072],
        ))

        # Feed-Forward Network - Output (3072 → 768)
        layers.append(_L(
            f"{prefix}.output.dense",
            "Linear",
            "dense",
            2_360_064,
            True,
            {"in_features": 3072, "out_features": 768, "bias": True},
            [512, 3072],
            [512, 768],
        ))

        # Layer Norm 2
        layers.append(_L(
            f"{prefix}.output.LayerNorm",
            "LayerNorm",
            "normalization",
            1_536,
            True,
            {"normalized_shape": 768, "eps": 1e-12},
            [512, 768],
            [512, 768],
        ))

    # Pooler (for [CLS] token)
    layers.append(_L(
        "pooler.dense",
        "Linear",
        "dense",
        590_592,
        True,
        {"in_features": 768, "out_features": 768, "bias": True},
        [768],
        [768],
    ))

    layers.append(_L(
        "pooler.activation",
        "Tanh",
        "activation",
        0,
        False,
        {},
        [768],
        [768],
    ))

    result = _build(layers)
    # Add transformer-specific metadata
    result["visualization_hints"]["architecture_type"] = "transformer_encoder"
    result["visualization_hints"]["num_layers"] = 12
    result["visualization_hints"]["num_heads"] = 12
    result["visualization_hints"]["d_model"] = 768
    result["visualization_hints"]["d_ff"] = 3072
    return result


def _gpt2() -> Dict[str, Any]:
    """
    Return static architecture for GPT-2 (117M parameters).

    Architecture:
    - Token + Position Embeddings (768-dim)
    - 12 Decoder Layers, each with:
      - Masked Multi-Head Self-Attention (12 heads, 64-dim each)
      - Add & Norm
      - Feed-Forward Network (768 → 3072 → 768)
      - Add & Norm
    - Language Model Head (768 → 50257 vocab)

    No model weights loaded — instant response for visualization.
    """
    layers = []

    # Embedding layer (token + position)
    layers.append(_L(
        "wte",  # word token embeddings
        "Embedding",
        "dense",
        38_597_376,  # 50257 vocab * 768 dim
        True,
        {"vocab_size": 50257, "embedding_dim": 768},
        [1024],  # max sequence length
        [1024, 768],
    ))

    layers.append(_L(
        "wpe",  # word position embeddings
        "Embedding",
        "dense",
        786_432,  # 1024 positions * 768 dim
        True,
        {"num_positions": 1024, "embedding_dim": 768},
        [1024],
        [1024, 768],
    ))

    # 12 Decoder layers
    for layer_idx in range(12):
        prefix = f"h.{layer_idx}"

        # Layer Norm 1 (pre-attention)
        layers.append(_L(
            f"{prefix}.ln_1",
            "LayerNorm",
            "normalization",
            1_536,
            True,
            {"normalized_shape": 768, "eps": 1e-05},
            [1024, 768],
            [1024, 768],
        ))

        # Masked Multi-Head Self-Attention
        layers.append(_L(
            f"{prefix}.attn",
            "MultiHeadAttention",
            "dense",
            2_359_296,  # Q, K, V projections + output
            True,
            {"num_heads": 12, "head_dim": 64, "hidden_size": 768, "masked": True},
            [1024, 768],
            [1024, 768],
        ))

        # Layer Norm 2 (pre-FFN)
        layers.append(_L(
            f"{prefix}.ln_2",
            "LayerNorm",
            "normalization",
            1_536,
            True,
            {"normalized_shape": 768, "eps": 1e-05},
            [1024, 768],
            [1024, 768],
        ))

        # Feed-Forward Network - Expand (768 → 3072)
        layers.append(_L(
            f"{prefix}.mlp.c_fc",
            "Linear",
            "dense",
            2_362_368,
            True,
            {"in_features": 768, "out_features": 3072, "bias": True},
            [1024, 768],
            [1024, 3072],
        ))

        # GELU activation
        layers.append(_L(
            f"{prefix}.mlp.gelu",
            "GELU",
            "activation",
            0,
            False,
            {},
            [1024, 3072],
            [1024, 3072],
        ))

        # Feed-Forward Network - Project (3072 → 768)
        layers.append(_L(
            f"{prefix}.mlp.c_proj",
            "Linear",
            "dense",
            2_360_064,
            True,
            {"in_features": 3072, "out_features": 768, "bias": True},
            [1024, 3072],
            [1024, 768],
        ))

    # Final Layer Norm
    layers.append(_L(
        "ln_f",
        "LayerNorm",
        "normalization",
        1_536,
        True,
        {"normalized_shape": 768, "eps": 1e-05},
        [1024, 768],
        [1024, 768],
    ))

    # Language Model Head (tied with input embeddings in real GPT-2, but shown separately)
    layers.append(_L(
        "lm_head",
        "Linear",
        "output",
        38_597_376,
        True,
        {"in_features": 768, "out_features": 50257, "bias": False},
        [1024, 768],
        [1024, 50257],
    ))

    result = _build(layers)
    # Add transformer-specific metadata
    result["visualization_hints"]["architecture_type"] = "transformer_decoder"
    result["visualization_hints"]["num_layers"] = 12
    result["visualization_hints"]["num_heads"] = 12
    result["visualization_hints"]["d_model"] = 768
    result["visualization_hints"]["d_ff"] = 3072
    return result

# Made with Bob
