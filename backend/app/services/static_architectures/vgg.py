"""VGG16 architecture (138,357,544 params)."""

from typing import Any, Dict

from .base import _avgpool, _build, _conv, _dropout, _linear, _pool, _relu


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

# Made with Bob
