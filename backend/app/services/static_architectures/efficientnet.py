"""EfficientNet-B0 architecture (5,288,548 params)."""

from typing import Any, Dict, List

from .base import _L, _avgpool, _bn, _build, _conv, _dropout, _linear


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

# Made with Bob
