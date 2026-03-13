"""ResNet-50 architecture (25,557,032 params)."""

from typing import Any, Dict, List

from .base import _L, _avgpool, _bn, _build, _conv, _linear, _pool, _relu


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

# Made with Bob
