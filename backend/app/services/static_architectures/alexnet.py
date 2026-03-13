"""AlexNet architecture (61,100,840 params)."""

from typing import Any, Dict

from .base import _avgpool, _build, _conv, _dropout, _linear, _pool, _relu


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

# Made with Bob
