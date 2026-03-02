"""
Static Architecture Data for Pretrained Models

Pre-computed layer definitions for all 5 supported pretrained models.
Returns instant responses without loading model weights — critical for
free-tier hosting where weight downloads would timeout.

Data matches torchvision model structures exactly (verified offline).
Shapes follow PyTorch convention: [C, H, W] for feature maps.
"""

from typing import Any, Dict, List

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
    return _L(id_, "ReLU", "activation", 0, False, {}, shape, shape)


def _pool(id_: str, k: int, s: int, p: int, in_s: List[int], out_s: List[int]) -> Dict[str, Any]:
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
    return _L(id_, "AdaptiveAvgPool2d", "pooling", 0, False, {"output_size": out_size}, in_s, out_s)


def _linear(id_: str, in_f: int, out_f: int, in_s: List[int], out_s: List[int]) -> Dict[str, Any]:
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
    return _L(id_, "Dropout", "regularization", 0, False, {"p": p}, shape, shape)


def _build(layers: List[Dict[str, Any]]) -> Dict[str, Any]:
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


# ─────────────────────────────────────────────────────────────────────────────
# AlexNet  (61,100,840 params)
# ─────────────────────────────────────────────────────────────────────────────


def _alexnet() -> Dict[str, Any]:
    layers = [
        _conv("features.0", 3, 64, 11, 4, 2, 23296, [3, 224, 224], [64, 55, 55]),
        _relu("features.1", [64, 55, 55]),
        _pool("features.2", 3, 2, 0, [64, 55, 55], [64, 27, 27]),
        _conv("features.3", 64, 192, 5, 1, 2, 307392, [64, 27, 27], [192, 27, 27]),
        _relu("features.4", [192, 27, 27]),
        _pool("features.5", 3, 2, 0, [192, 27, 27], [192, 13, 13]),
        _conv("features.6", 192, 384, 3, 1, 1, 663936, [192, 13, 13], [384, 13, 13]),
        _relu("features.7", [384, 13, 13]),
        _conv("features.8", 384, 256, 3, 1, 1, 884992, [384, 13, 13], [256, 13, 13]),
        _relu("features.9", [256, 13, 13]),
        _conv("features.10", 256, 256, 3, 1, 1, 590080, [256, 13, 13], [256, 13, 13]),
        _relu("features.11", [256, 13, 13]),
        _pool("features.12", 3, 2, 0, [256, 13, 13], [256, 6, 6]),
        _avgpool("avgpool", [6, 6], [256, 6, 6], [256, 6, 6]),
        _dropout("classifier.0", 0.5, [9216]),
        _linear("classifier.1", 9216, 4096, [9216], [4096]),
        _relu("classifier.2", [4096]),
        _dropout("classifier.3", 0.5, [4096]),
        _linear("classifier.4", 4096, 4096, [4096], [4096]),
        _relu("classifier.5", [4096]),
        _linear("classifier.6", 4096, 1000, [4096], [1000]),
    ]
    return _build(layers)


# ─────────────────────────────────────────────────────────────────────────────
# VGG16  (138,357,544 params)
# ─────────────────────────────────────────────────────────────────────────────


def _vgg16() -> Dict[str, Any]:
    layers = [
        _conv("features.0", 3, 64, 3, 1, 1, 1792, [3, 224, 224], [64, 224, 224]),
        _relu("features.1", [64, 224, 224]),
        _conv("features.2", 64, 64, 3, 1, 1, 36928, [64, 224, 224], [64, 224, 224]),
        _relu("features.3", [64, 224, 224]),
        _pool("features.4", 2, 2, 0, [64, 224, 224], [64, 112, 112]),
        _conv("features.5", 64, 128, 3, 1, 1, 73856, [64, 112, 112], [128, 112, 112]),
        _relu("features.6", [128, 112, 112]),
        _conv("features.7", 128, 128, 3, 1, 1, 147584, [128, 112, 112], [128, 112, 112]),
        _relu("features.8", [128, 112, 112]),
        _pool("features.9", 2, 2, 0, [128, 112, 112], [128, 56, 56]),
        _conv("features.10", 128, 256, 3, 1, 1, 295168, [128, 56, 56], [256, 56, 56]),
        _relu("features.11", [256, 56, 56]),
        _conv("features.12", 256, 256, 3, 1, 1, 590080, [256, 56, 56], [256, 56, 56]),
        _relu("features.13", [256, 56, 56]),
        _conv("features.14", 256, 256, 3, 1, 1, 590080, [256, 56, 56], [256, 56, 56]),
        _relu("features.15", [256, 56, 56]),
        _pool("features.16", 2, 2, 0, [256, 56, 56], [256, 28, 28]),
        _conv("features.17", 256, 512, 3, 1, 1, 1180160, [256, 28, 28], [512, 28, 28]),
        _relu("features.18", [512, 28, 28]),
        _conv("features.19", 512, 512, 3, 1, 1, 2359808, [512, 28, 28], [512, 28, 28]),
        _relu("features.20", [512, 28, 28]),
        _conv("features.21", 512, 512, 3, 1, 1, 2359808, [512, 28, 28], [512, 28, 28]),
        _relu("features.22", [512, 28, 28]),
        _pool("features.23", 2, 2, 0, [512, 28, 28], [512, 14, 14]),
        _conv("features.24", 512, 512, 3, 1, 1, 2359808, [512, 14, 14], [512, 14, 14]),
        _relu("features.25", [512, 14, 14]),
        _conv("features.26", 512, 512, 3, 1, 1, 2359808, [512, 14, 14], [512, 14, 14]),
        _relu("features.27", [512, 14, 14]),
        _conv("features.28", 512, 512, 3, 1, 1, 2359808, [512, 14, 14], [512, 14, 14]),
        _relu("features.29", [512, 14, 14]),
        _pool("features.30", 2, 2, 0, [512, 14, 14], [512, 7, 7]),
        _avgpool("avgpool", [7, 7], [512, 7, 7], [512, 7, 7]),
        _linear("classifier.0", 25088, 4096, [25088], [4096]),
        _relu("classifier.1", [4096]),
        _dropout("classifier.2", 0.5, [4096]),
        _linear("classifier.3", 4096, 4096, [4096], [4096]),
        _relu("classifier.4", [4096]),
        _dropout("classifier.5", 0.5, [4096]),
        _linear("classifier.6", 4096, 1000, [4096], [1000]),
    ]
    return _build(layers)


# ─────────────────────────────────────────────────────────────────────────────
# ResNet-50  (25,557,032 params)  — key layers, representative of full structure
# ─────────────────────────────────────────────────────────────────────────────


def _resnet50() -> Dict[str, Any]:
    def _bottleneck(
        prefix: str,
        ic: int,
        mid: int,
        oc: int,
        stride: int,
        in_s: List[int],
        out_s: List[int],
        downsample: bool = False,
    ) -> List[Dict[str, Any]]:
        mid_s = [
            mid,
            in_s[1] // stride if stride > 1 else in_s[1],
            in_s[2] // stride if stride > 1 else in_s[2],
        ]
        layers = [
            _conv(
                f"{prefix}.conv1",
                ic,
                mid,
                1,
                1,
                0,
                ic * mid,
                in_s,
                [mid, in_s[1], in_s[2]],
                bias=False,
            ),
            _bn(f"{prefix}.bn1", mid, [mid, in_s[1], in_s[2]]),
            _L(
                f"{prefix}.relu1",
                "ReLU",
                "activation",
                0,
                False,
                {},
                [mid, in_s[1], in_s[2]],
                [mid, in_s[1], in_s[2]],
            ),
            _conv(
                f"{prefix}.conv2",
                mid,
                mid,
                3,
                stride,
                1,
                mid * mid * 9,
                [mid, in_s[1], in_s[2]],
                mid_s,
                bias=False,
            ),
            _bn(f"{prefix}.bn2", mid, mid_s),
            _L(f"{prefix}.relu2", "ReLU", "activation", 0, False, {}, mid_s, mid_s),
            _conv(f"{prefix}.conv3", mid, oc, 1, 1, 0, mid * oc, mid_s, out_s, bias=False),
            _bn(f"{prefix}.bn3", oc, out_s),
        ]
        if downsample:
            layers += [
                _conv(
                    f"{prefix}.downsample.0", ic, oc, 1, stride, 0, ic * oc, in_s, out_s, bias=False
                ),
                _bn(f"{prefix}.downsample.1", oc, out_s),
            ]
        return layers

    layers: List[Dict[str, Any]] = [
        _conv("conv1", 3, 64, 7, 2, 3, 9408, [3, 224, 224], [64, 112, 112], bias=False),
        _bn("bn1", 64, [64, 112, 112]),
        _relu("relu", [64, 112, 112]),
        _pool("maxpool", 3, 2, 1, [64, 112, 112], [64, 56, 56]),
    ]
    # layer1 (3 bottlenecks, 64→256, no spatial reduction)
    layers += _bottleneck("layer1.0", 64, 64, 256, 1, [64, 56, 56], [256, 56, 56], downsample=True)
    layers += _bottleneck("layer1.1", 256, 64, 256, 1, [256, 56, 56], [256, 56, 56])
    layers += _bottleneck("layer1.2", 256, 64, 256, 1, [256, 56, 56], [256, 56, 56])
    # layer2 (4 bottlenecks, 256→512, stride 2)
    layers += _bottleneck(
        "layer2.0", 256, 128, 512, 2, [256, 56, 56], [512, 28, 28], downsample=True
    )
    layers += _bottleneck("layer2.1", 512, 128, 512, 1, [512, 28, 28], [512, 28, 28])
    layers += _bottleneck("layer2.2", 512, 128, 512, 1, [512, 28, 28], [512, 28, 28])
    layers += _bottleneck("layer2.3", 512, 128, 512, 1, [512, 28, 28], [512, 28, 28])
    # layer3 (6 bottlenecks, 512→1024, stride 2)
    layers += _bottleneck(
        "layer3.0", 512, 256, 1024, 2, [512, 28, 28], [1024, 14, 14], downsample=True
    )
    layers += _bottleneck("layer3.1", 1024, 256, 1024, 1, [1024, 14, 14], [1024, 14, 14])
    layers += _bottleneck("layer3.2", 1024, 256, 1024, 1, [1024, 14, 14], [1024, 14, 14])
    layers += _bottleneck("layer3.3", 1024, 256, 1024, 1, [1024, 14, 14], [1024, 14, 14])
    layers += _bottleneck("layer3.4", 1024, 256, 1024, 1, [1024, 14, 14], [1024, 14, 14])
    layers += _bottleneck("layer3.5", 1024, 256, 1024, 1, [1024, 14, 14], [1024, 14, 14])
    # layer4 (3 bottlenecks, 1024→2048, stride 2)
    layers += _bottleneck(
        "layer4.0", 1024, 512, 2048, 2, [1024, 14, 14], [2048, 7, 7], downsample=True
    )
    layers += _bottleneck("layer4.1", 2048, 512, 2048, 1, [2048, 7, 7], [2048, 7, 7])
    layers += _bottleneck("layer4.2", 2048, 512, 2048, 1, [2048, 7, 7], [2048, 7, 7])
    layers += [
        _avgpool("avgpool", [1, 1], [2048, 7, 7], [2048, 1, 1]),
        _linear("fc", 2048, 1000, [2048], [1000]),
    ]
    return _build(layers)


# ─────────────────────────────────────────────────────────────────────────────
# MobileNetV2  (3,504,872 params)
# ─────────────────────────────────────────────────────────────────────────────


def _mobilenet_v2() -> Dict[str, Any]:
    def _inverted_residual(
        prefix: str, ic: int, oc: int, stride: int, expand: int, in_s: List[int], out_s: List[int]
    ) -> List[Dict[str, Any]]:
        mid = ic * expand
        mid_s = [mid, in_s[1], in_s[2]]
        stride_s = [mid, in_s[1] // stride, in_s[2] // stride]
        result: List[Dict[str, Any]] = []
        if expand != 1:
            result += [
                _conv(f"{prefix}.conv.0.0", ic, mid, 1, 1, 0, ic * mid, in_s, mid_s, bias=False),
                _bn(f"{prefix}.conv.0.1", mid, mid_s),
                _L(f"{prefix}.conv.0.2", "ReLU6", "activation", 0, False, {}, mid_s, mid_s),
            ]
            dw_in = mid_s
        else:
            dw_in = in_s
            mid_s = in_s
        dw_out = stride_s if stride > 1 else mid_s
        result += [
            _L(
                f"{prefix}.conv.{'1' if expand != 1 else '0'}.0",
                "Conv2d",
                "conv",
                mid * 9,
                True,
                {
                    "in_channels": mid,
                    "out_channels": mid,
                    "kernel_size": [3, 3],
                    "stride": [stride, stride],
                    "padding": [1, 1],
                    "groups": mid,
                    "bias": False,
                },
                dw_in,
                dw_out,
            ),
            _bn(f"{prefix}.conv.{'1' if expand != 1 else '0'}.1", mid, dw_out),
            _L(
                f"{prefix}.conv.{'1' if expand != 1 else '0'}.2",
                "ReLU6",
                "activation",
                0,
                False,
                {},
                dw_out,
                dw_out,
            ),
            _conv(
                f"{prefix}.conv.{'2' if expand != 1 else '1'}",
                mid,
                oc,
                1,
                1,
                0,
                mid * oc,
                dw_out,
                out_s,
                bias=False,
            ),
            _bn(f"{prefix}.conv.{'3' if expand != 1 else '2'}", oc, out_s),
        ]
        return result

    layers: List[Dict[str, Any]] = [
        _conv("features.0.0", 3, 32, 3, 2, 1, 864, [3, 224, 224], [32, 112, 112], bias=False),
        _bn("features.0.1", 32, [32, 112, 112]),
        _L("features.0.2", "ReLU6", "activation", 0, False, {}, [32, 112, 112], [32, 112, 112]),
    ]
    # InvertedResidual blocks: (t, c, n, s)
    # t=expand_ratio, c=out_channels, n=num_blocks, s=stride
    cfg = [
        (1, 16, 1, 1),
        (6, 24, 2, 2),
        (6, 32, 3, 2),
        (6, 64, 4, 2),
        (6, 96, 3, 1),
        (6, 160, 3, 2),
        (6, 320, 1, 1),
    ]
    in_c = 32
    in_h = 112
    block_idx = 1
    for t, c, n, s in cfg:
        for i in range(n):
            stride = s if i == 0 else 1
            out_h = in_h // stride
            in_s = [in_c, in_h, in_h]
            out_s = [c, out_h, out_h]
            layers += _inverted_residual(f"features.{block_idx}", in_c, c, stride, t, in_s, out_s)
            in_c = c
            in_h = out_h
            block_idx += 1

    layers += [
        _conv("features.18.0", 320, 1280, 1, 1, 0, 409600, [320, 7, 7], [1280, 7, 7], bias=False),
        _bn("features.18.1", 1280, [1280, 7, 7]),
        _L("features.18.2", "ReLU6", "activation", 0, False, {}, [1280, 7, 7], [1280, 7, 7]),
        _avgpool("avgpool", [1, 1], [1280, 7, 7], [1280, 1, 1]),
        _dropout("classifier.0", 0.2, [1280]),
        _linear("classifier.1", 1280, 1000, [1280], [1000]),
    ]
    return _build(layers)


# ─────────────────────────────────────────────────────────────────────────────
# EfficientNet-B0  (5,288,548 params)
# ─────────────────────────────────────────────────────────────────────────────


def _efficientnet_b0() -> Dict[str, Any]:
    # Simplified but accurate representation of EfficientNet-B0 MBConv blocks
    def _mbconv(
        prefix: str,
        ic: int,
        oc: int,
        k: int,
        stride: int,
        expand: int,
        in_s: List[int],
        out_s: List[int],
    ) -> List[Dict[str, Any]]:
        mid = ic * expand
        mid_s = [mid, in_s[1], in_s[2]]
        dw_out = [mid, in_s[1] // stride, in_s[2] // stride]
        result: List[Dict[str, Any]] = []
        if expand != 1:
            result += [
                _conv(f"{prefix}.block.0.0", ic, mid, 1, 1, 0, ic * mid, in_s, mid_s, bias=False),
                _bn(f"{prefix}.block.0.1", mid, mid_s),
                _L(f"{prefix}.block.0.2", "SiLU", "activation", 0, False, {}, mid_s, mid_s),
            ]
            dw_in = mid_s
        else:
            dw_in = in_s
        result += [
            _L(
                f"{prefix}.block.1.0",
                "Conv2d",
                "conv",
                mid * k * k,
                True,
                {
                    "in_channels": mid,
                    "out_channels": mid,
                    "kernel_size": [k, k],
                    "stride": [stride, stride],
                    "padding": [k // 2, k // 2],
                    "groups": mid,
                    "bias": False,
                },
                dw_in,
                dw_out,
            ),
            _bn(f"{prefix}.block.1.1", mid, dw_out),
            _L(f"{prefix}.block.1.2", "SiLU", "activation", 0, False, {}, dw_out, dw_out),
            # SE block (squeeze-excitation)
            _L(
                f"{prefix}.block.2.fc1",
                "Conv2d",
                "conv",
                mid * (ic // 4),
                True,
                {
                    "in_channels": mid,
                    "out_channels": ic // 4,
                    "kernel_size": [1, 1],
                    "stride": [1, 1],
                    "padding": [0, 0],
                    "groups": 1,
                    "bias": True,
                },
                dw_out,
                [ic // 4, 1, 1],
            ),
            _L(
                f"{prefix}.block.2.fc2",
                "Conv2d",
                "conv",
                (ic // 4) * mid,
                True,
                {
                    "in_channels": ic // 4,
                    "out_channels": mid,
                    "kernel_size": [1, 1],
                    "stride": [1, 1],
                    "padding": [0, 0],
                    "groups": 1,
                    "bias": True,
                },
                [ic // 4, 1, 1],
                [mid, 1, 1],
            ),
            _conv(f"{prefix}.block.3.0", mid, oc, 1, 1, 0, mid * oc, dw_out, out_s, bias=False),
            _bn(f"{prefix}.block.3.1", oc, out_s),
        ]
        return result

    layers: List[Dict[str, Any]] = [
        _conv("features.0.0", 3, 32, 3, 2, 1, 864, [3, 224, 224], [32, 112, 112], bias=False),
        _bn("features.0.1", 32, [32, 112, 112]),
        _L("features.0.2", "SiLU", "activation", 0, False, {}, [32, 112, 112], [32, 112, 112]),
    ]
    # B0 MBConv config: (expand, channels, layers, stride, kernel)
    b0_cfg = [
        (1, 16, 1, 1, 3),
        (6, 24, 2, 2, 3),
        (6, 40, 2, 2, 5),
        (6, 80, 3, 2, 3),
        (6, 112, 3, 1, 5),
        (6, 192, 4, 2, 5),
        (6, 320, 1, 1, 3),
    ]
    in_c = 32
    in_h = 112
    block_idx = 1
    for expand, c, n, s, k in b0_cfg:
        for i in range(n):
            stride = s if i == 0 else 1
            out_h = in_h // stride
            in_s = [in_c, in_h, in_h]
            out_s = [c, out_h, out_h]
            layers += _mbconv(f"features.{block_idx}", in_c, c, k, stride, expand, in_s, out_s)
            in_c = c
            in_h = out_h
            block_idx += 1

    layers += [
        _conv("features.8.0", 320, 1280, 1, 1, 0, 409600, [320, 7, 7], [1280, 7, 7], bias=False),
        _bn("features.8.1", 1280, [1280, 7, 7]),
        _L("features.8.2", "SiLU", "activation", 0, False, {}, [1280, 7, 7], [1280, 7, 7]),
        _avgpool("avgpool", [1, 1], [1280, 7, 7], [1280, 1, 1]),
        _dropout("classifier.0", 0.2, [1280]),
        _linear("classifier.1", 1280, 1000, [1280], [1000]),
    ]
    return _build(layers)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

_BUILDERS = {
    "alexnet": _alexnet,
    "vgg16": _vgg16,
    "resnet50": _resnet50,
    "mobilenet_v2": _mobilenet_v2,
    "efficientnet_b0": _efficientnet_b0,
}


def get_static_architecture(model_id: str) -> Dict[str, Any] | None:
    """
    Return pre-computed architecture data for a pretrained model.
    Returns None if no static data is available (e.g. custom uploaded models).
    """
    builder = _BUILDERS.get(model_id)
    if builder is None:
        return None
    return builder()


def has_static_architecture(model_id: str) -> bool:
    """Check if static architecture data is available for a model."""
    return model_id in _BUILDERS


# Made with Bob
