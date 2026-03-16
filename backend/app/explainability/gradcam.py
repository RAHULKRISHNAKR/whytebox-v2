"""
Grad-CAM (Gradient-weighted Class Activation Mapping) implementation.

Provides visual explanations for CNN decisions by highlighting important regions.
Reference: Selvaraju et al. "Grad-CAM: Visual Explanations from Deep Networks
via Gradient-based Localization" (2017)
"""

import time
from typing import Any, Dict, Optional, Union

import numpy as np

from .base_explainer import BaseExplainer, ExplainabilityResult


class GradCAM(BaseExplainer):
    """
    Grad-CAM explainability method.

    Generates class activation maps by computing gradients of the target class
    with respect to feature maps of a convolutional layer.
    """

    def __init__(
        self,
        model: Any,
        target_layer: str,
        device: str = "cpu",
        class_names: Optional[list] = None,
        framework: str = "pytorch",
    ):
        """
        Initialize Grad-CAM explainer.

        Args:
            model: The model to explain
            target_layer: Name of the target convolutional layer
            device: Device to run computations on
            class_names: Optional list of class names
            framework: Framework ('pytorch' or 'tensorflow')
        """
        super().__init__(model, device, class_names)
        self.target_layer = target_layer
        self.framework = framework.lower()

        # Storage for activations and gradients
        self.activations = None
        self.gradients = None

        # Storage for all layer gradients (for contribution scores)
        self.all_layer_gradients = {}

        # Register hooks
        self._register_hooks()

    def _register_hooks(self) -> None:
        """Register forward and backward hooks for target layer."""
        if self.framework == "pytorch":
            self._register_pytorch_hooks()
        elif self.framework == "tensorflow":
            self._register_tensorflow_hooks()
        else:
            raise ValueError(f"Unsupported framework: {self.framework}")

    def _register_pytorch_hooks(self) -> None:
        """Register PyTorch hooks."""
        import torch
        import torch.nn as nn

        # Get target layer
        target_module = None
        for name, module in self.model.named_modules():
            if name == self.target_layer:
                target_module = module
                break

        if target_module is None:
            raise ValueError(f"Layer {self.target_layer} not found in model")

        # Forward hook to capture activations (target layer only)
        def forward_hook(module, input, output):
            self.activations = output.detach()

        # Backward hook to capture gradients (target layer only)
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        # Register hooks for target layer
        target_module.register_forward_hook(forward_hook)
        target_module.register_full_backward_hook(backward_hook)

        # Register backward hooks on ALL conv/linear layers for contribution scores
        for name, module in self.model.named_modules():
            if isinstance(module, (nn.Conv2d, nn.Conv1d, nn.Linear)):
                def make_grad_hook(layer_name):
                    def grad_hook(module, grad_input, grad_output):
                        if grad_output[0] is not None:
                            self.all_layer_gradients[layer_name] = grad_output[0].detach()
                    return grad_hook

                module.register_full_backward_hook(make_grad_hook(name))

    def _register_tensorflow_hooks(self) -> None:
        """Register TensorFlow hooks (using GradientTape)."""
        # TensorFlow uses GradientTape, so we don't need to register hooks here
        pass

    def explain(
        self, input_data: np.ndarray, target_class: Optional[int] = None, **kwargs
    ) -> ExplainabilityResult:
        """
        Generate Grad-CAM explanation.

        Args:
            input_data: Input data to explain (C, H, W) or (H, W, C)
            target_class: Target class to explain (None for predicted class)
            **kwargs: Additional arguments

        Returns:
            ExplainabilityResult object
        """
        start_time = time.time()

        if self.framework == "pytorch":
            result = self._explain_pytorch(input_data, target_class, **kwargs)
        elif self.framework == "tensorflow":
            result = self._explain_tensorflow(input_data, target_class, **kwargs)
        else:
            raise ValueError(f"Unsupported framework: {self.framework}")

        result.computation_time = time.time() - start_time
        result.method = "Grad-CAM"
        result.target_layer = self.target_layer

        return result

    def _compute_layer_contributions(self) -> Dict[str, float]:
        """
        Compute normalized contribution scores from captured gradients.

        Returns:
            Dictionary of layer_name -> contribution score (0.0-1.0)
        """
        import torch

        if not self.all_layer_gradients:
            return {}

        contributions = {}

        # Compute mean absolute gradient magnitude per layer
        for layer_name, grad_tensor in self.all_layer_gradients.items():
            # Compute mean absolute gradient across all dimensions
            mean_abs_grad = torch.mean(torch.abs(grad_tensor)).item()
            contributions[layer_name] = mean_abs_grad

        # Normalize to 0.0-1.0 range
        if contributions:
            max_contrib = max(contributions.values())
            if max_contrib > 0:
                contributions = {
                    name: score / max_contrib
                    for name, score in contributions.items()
                }

        return contributions

    def _explain_pytorch(
        self, input_data: np.ndarray, target_class: Optional[int] = None, **kwargs
    ) -> ExplainabilityResult:
        """Generate Grad-CAM explanation for PyTorch model."""
        import torch

        # Clear previous gradients
        self.all_layer_gradients.clear()

        # Prepare input
        input_tensor = torch.from_numpy(input_data).float().to(self.device)
        if input_tensor.ndim == 3:
            input_tensor = input_tensor.unsqueeze(0)

        input_tensor.requires_grad = True

        # Forward pass
        self.model.eval()
        output = self.model(input_tensor)

        # Get predicted class if not specified
        if target_class is None:
            target_class = output.argmax(dim=1).item()

        # Get confidence
        probs = torch.softmax(output, dim=1)
        confidence = probs[0, target_class].item()

        # Backward pass
        self.model.zero_grad()
        output[0, target_class].backward()

        # Compute Grad-CAM
        gradients = self.gradients[0]  # (C, H, W)
        activations = self.activations[0]  # (C, H, W)

        # Global average pooling of gradients
        weights = torch.mean(gradients, dim=(1, 2))  # (C,)

        # Weighted combination of activation maps
        cam = torch.zeros(activations.shape[1:], device=self.device)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        # Apply ReLU
        cam = torch.relu(cam)

        # Convert to numpy
        cam_np = cam.cpu().numpy()

        # Normalize
        heatmap = self.normalize_heatmap(cam_np)

        # Resize to input size
        input_size = input_data.shape[-2:]  # (H, W)
        heatmap_resized = self.resize_heatmap(heatmap, input_size)

        # Prepare original image for visualization
        original_image = input_data
        if original_image.shape[0] == 3:  # (C, H, W)
            original_image = np.transpose(original_image, (1, 2, 0))  # (H, W, C)

        # Compute layer contributions from captured gradients
        layer_contributions = self._compute_layer_contributions()

        return ExplainabilityResult(
            attribution_map=cam_np,
            heatmap=heatmap_resized,
            original_image=original_image,
            predicted_class=target_class,
            predicted_class_name=self.get_class_name(target_class),
            confidence=confidence,
            layer_contributions=layer_contributions,
        )

    def _explain_tensorflow(
        self, input_data: np.ndarray, target_class: Optional[int] = None, **kwargs
    ) -> ExplainabilityResult:
        """Generate Grad-CAM explanation for TensorFlow model."""
        import tensorflow as tf

        # Prepare input
        input_tensor = tf.convert_to_tensor(input_data, dtype=tf.float32)
        if input_tensor.ndim == 3:
            input_tensor = tf.expand_dims(input_tensor, 0)

        # Get target layer
        target_layer_model = None
        for layer in self.model.layers:
            if layer.name == self.target_layer:
                target_layer_model = tf.keras.Model(
                    inputs=self.model.input, outputs=[layer.output, self.model.output]
                )
                break

        if target_layer_model is None:
            raise ValueError(f"Layer {self.target_layer} not found in model")

        # Forward pass with gradient tape
        with tf.GradientTape() as tape:
            tape.watch(input_tensor)
            activations, predictions = target_layer_model(input_tensor)

            # Get predicted class if not specified
            if target_class is None:
                target_class = tf.argmax(predictions[0]).numpy()

            # Get target class output
            target_output = predictions[:, target_class]

        # Compute gradients
        gradients = tape.gradient(target_output, activations)

        # Get confidence
        probs = tf.nn.softmax(predictions)
        confidence = probs[0, target_class].numpy()

        # Compute Grad-CAM
        # Global average pooling of gradients
        weights = tf.reduce_mean(gradients, axis=(1, 2))  # (B, C)

        # Weighted combination of activation maps
        activations_np = activations[0].numpy()  # (H, W, C)
        weights_np = weights[0].numpy()  # (C,)

        cam = np.zeros(activations_np.shape[:2])  # (H, W)
        for i, w in enumerate(weights_np):
            cam += w * activations_np[:, :, i]

        # Apply ReLU
        cam = np.maximum(cam, 0)

        # Normalize
        heatmap = self.normalize_heatmap(cam)

        # Resize to input size
        input_size = input_data.shape[:2]  # (H, W)
        heatmap_resized = self.resize_heatmap(heatmap, input_size)

        # Prepare original image
        original_image = input_data

        return ExplainabilityResult(
            attribution_map=cam,
            heatmap=heatmap_resized,
            original_image=original_image,
            predicted_class=int(target_class),
            predicted_class_name=self.get_class_name(int(target_class)),
            confidence=float(confidence),
        )

    def explain_batch(
        self, input_batch: np.ndarray, target_classes: Optional[list] = None, **kwargs
    ) -> list:
        """
        Generate Grad-CAM explanations for a batch of inputs.

        Args:
            input_batch: Batch of input data (B, C, H, W) or (B, H, W, C)
            target_classes: List of target classes (None for predicted classes)
            **kwargs: Additional arguments

        Returns:
            List of ExplainabilityResult objects
        """
        results = []

        for i in range(len(input_batch)):
            target_class = target_classes[i] if target_classes else None
            result = self.explain(input_batch[i], target_class, **kwargs)
            results.append(result)

        return results

    def get_layer_names(self) -> list:
        """
        Get list of available layer names.

        Returns:
            List of layer names
        """
        if self.framework == "pytorch":
            return [name for name, _ in self.model.named_modules()]
        elif self.framework == "tensorflow":
            return [layer.name for layer in self.model.layers]
        else:
            return []


# Made with Bob
