"""
Base helper functions for building static architecture data.

Provides layer builder utilities used by all model architecture definitions.
"""

from typing import Any, Dict, List

# Layer category color mapping for visualization
_COLORS: Dict[str, str] = {
    "conv": "#4A90D9",
    "dense": "#7B68EE",
    "activation": "#50C878",
    "pooling": "#FF8C00",
    "normalization": "#FFD700",
    "regularization": "#FF6B6B",
    "reshape": "#A0A0A0",
    "output": "#FF4500",
    "unknown": "#808080",
}


def _L(
    id_: str,
    type_: str,
    cat: str,
    params: int,
    trainable: bool,
    cfg: Dict[str, Any],
    in_s: List[int],
    out_s: List[int],
) -> Dict[str, Any]:
    """Generic layer builder."""
    return {
        "id": id_,
        "name": id_,
        "type": type_,
        "category": cat,
        "color": _COLORS.get(cat, "#808080"),
        "parameters": params,
        "trainable": trainable,
        "config": cfg,
        "input_shape": in_s,
        "output_shape": out_s,
    }


def _conv(
    id_: str,
    ic: int,
    oc: int,
    k: int,
    s: int,
    p: int,
    params: int,
    in_s: List[int],
    out_s: List[int],
    bias: bool = True,
) -> Dict[str, Any]:
    """Conv2d layer builder."""
    return _L(
        id_,
        "Conv2d",
        "conv",
        params,
        True,
        {
            "in_channels": ic,
            "out_channels": oc,
            "kernel_size": [k, k],
            "stride": [s, s],
            "padding": [p, p],
            "groups": 1,
            "bias": bias,
        },
        in_s,
        out_s,
    )


def _bn(id_: str, features: int, shape: List[int]) -> Dict[str, Any]:
    """BatchNorm2d layer builder."""
    return _L(
        id_,
        "BatchNorm2d",
        "normalization",
        features * 2,
        True,
        {"num_features": features, "eps": 1e-05, "momentum": 0.1, "affine": True},
        shape,
        shape,
    )


def _relu(id_: str, shape: List[int]) -> Dict[str, Any]:
    """ReLU activation builder."""
    return _L(id_, "ReLU", "activation", 0, False, {}, shape, shape)


def _pool(id_: str, k: int, s: int, p: int, in_s: List[int], out_s: List[int]) -> Dict[str, Any]:
    """MaxPool2d layer builder."""
    return _L(
        id_,
        "MaxPool2d",
        "pooling",
        0,
        False,
        {"kernel_size": k, "stride": s, "padding": p},
        in_s,
        out_s,
    )


def _avgpool(id_: str, out_size: List[int], in_s: List[int], out_s: List[int]) -> Dict[str, Any]:
    """AdaptiveAvgPool2d layer builder."""
    return _L(id_, "AdaptiveAvgPool2d", "pooling", 0, False, {"output_size": out_size}, in_s, out_s)


def _linear(id_: str, in_f: int, out_f: int, in_s: List[int], out_s: List[int]) -> Dict[str, Any]:
    """Linear/Dense layer builder."""
    params = in_f * out_f + out_f
    return _L(
        id_,
        "Linear",
        "dense",
        params,
        True,
        {"in_features": in_f, "out_features": out_f, "bias": True},
        in_s,
        out_s,
    )


def _dropout(id_: str, p: float, shape: List[int]) -> Dict[str, Any]:
    """Dropout layer builder."""
    return _L(id_, "Dropout", "regularization", 0, False, {"p": p}, shape, shape)


def _build(layers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Assemble architecture data from layer list.

    Creates connections, computes statistics, and generates visualization hints.
    """
    connections = [
        {"from": layers[i]["id"], "to": layers[i + 1]["id"], "weight": 1.0}
        for i in range(len(layers) - 1)
    ]
    total = sum(l["parameters"] for l in layers)
    trainable = sum(l["parameters"] for l in layers if l["trainable"])
    type_counts: Dict[str, int] = {}
    for l in layers:
        type_counts[l["type"]] = type_counts.get(l["type"], 0) + 1

    n = len(layers)
    # Build visualization blocks
    blocks: List[Dict[str, Any]] = []
    cur_cat = None
    cur_block: List[int] = []
    for i, layer in enumerate(layers):
        cat = layer["category"]
        if cat != cur_cat:
            if cur_block:
                blocks.append(
                    {"category": cur_cat, "layer_indices": cur_block, "count": len(cur_block)}
                )
            cur_block = [i]
            cur_cat = cat
        else:
            cur_block.append(i)
    if cur_block:
        blocks.append({"category": cur_cat, "layer_indices": cur_block, "count": len(cur_block)})

    return {
        "layers": layers,
        "connections": connections,
        "stats": {
            "total_layers": n,
            "total_params": total,
            "trainable_params": trainable,
            "non_trainable_params": total - trainable,
            "layer_type_counts": type_counts,
        },
        "visualization_hints": {
            "total_depth": n,
            "blocks": blocks,
            "suggested_spacing": 3.0 if n <= 20 else 2.0 if n <= 60 else 1.5,
            "suggested_scale": max(0.5, min(2.0, 20.0 / n)),
        },
    }

# Made with Bob
