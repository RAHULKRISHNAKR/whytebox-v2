"""MobileNetV2 architecture (3,504,872 params)."""

from typing import Any, Dict, List

from .base import _L, _avgpool, _bn, _build, _conv, _dropout, _linear


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

# Made with Bob
