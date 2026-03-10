/**
 * Transformer 3D Scene
 *
 * BabylonJS-based 3D visualization of the transformer pipeline.
 * Renders tokens, embeddings, attention heads, FFN, and residual connections
 * as interactive 3D meshes.
 *
 * Architecture ported from legacy TransformerBlockVisualizer.js,
 * EmbeddingVisualizer.js, AttentionLayerVisualizer.js, and TransformerLayout.js.
 */

import { useEffect, useRef, useCallback } from 'react'
import { Box } from '@mui/material'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  Mesh,
  Curve3,
  HighlightLayer,
  ActionManager,
  ExecuteCodeAction,
} from '@babylonjs/core'
import type { TransformerState } from '../types'
import { TransformerStage } from '../types'
import { COLORS, LAYOUT } from '../constants'
import { viridisRGB, hslToRGB, hexToRGBNormalized } from '../utils/colormap'

interface TransformerSceneProps {
  transformerState: TransformerState | null
  currentStage: TransformerStage
  selectedLayer: number
  selectedHead: number
  width?: string | number
  height?: string | number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function hexToColor3(hex: string): Color3 {
  const [r, g, b] = hexToRGBNormalized(hex)
  return new Color3(r, g, b)
}

function createLabel(
  scene: Scene,
  text: string,
  position: Vector3,
  color = '#FFFFFF',
  size = 128,
): Mesh {
  const plane = MeshBuilder.CreatePlane(`label_${text}`, { width: 1.2, height: 0.3 }, scene)
  plane.position = position
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL

  const tex = new DynamicTexture(`label_tex_${text}`, { width: size * 4, height: size }, scene, false)
  tex.hasAlpha = true
  const ctx = tex.getContext() as CanvasRenderingContext2D
  ctx.clearRect(0, 0, size * 4, size)
  ctx.font = `bold ${Math.floor(size * 0.5)}px monospace`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, size * 2, size / 2)
  tex.update()

  const mat = new StandardMaterial(`label_mat_${text}`, scene)
  mat.diffuseTexture = tex
  mat.emissiveColor = hexToColor3(color).scale(0.5)
  mat.useAlphaFromDiffuseTexture = true
  mat.backFaceCulling = false
  mat.disableLighting = true
  plane.material = mat

  return plane
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TransformerScene({
  transformerState,
  currentStage,
  selectedLayer,
  selectedHead,
  width = '100%',
  height = '500px',
}: TransformerSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const engineRef = useRef<Engine | null>(null)
  const meshesRef = useRef<Mesh[]>([])
  const highlightRef = useRef<HighlightLayer | null>(null)

  // ── Cleanup meshes ──────────────────────────────────────────────────────
  const clearMeshes = useCallback(() => {
    for (const mesh of meshesRef.current) {
      if (!mesh.isDisposed()) mesh.dispose()
    }
    meshesRef.current = []
  }, [])

  // ── Scene initialization ────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })
    engineRef.current = engine

    const scene = new Scene(engine)
    sceneRef.current = scene
    scene.clearColor = new Color4(0.08, 0.08, 0.12, 1.0)

    // Camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3.5,
      25,
      Vector3.Zero(),
      scene,
    )
    camera.attachControl(canvasRef.current, true)
    camera.wheelPrecision = 15
    camera.minZ = 0.1
    camera.lowerRadiusLimit = 5
    camera.upperRadiusLimit = 100
    camera.panningSensibility = 30

    // Lighting
    const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene)
    hemiLight.intensity = 0.7
    hemiLight.groundColor = new Color3(0.15, 0.15, 0.25)

    const dirLight = new HemisphericLight('dir', new Vector3(1, 0.5, 1), scene)
    dirLight.intensity = 0.4

    // Highlight layer for hover
    highlightRef.current = new HighlightLayer('highlight', scene)

    engine.runRenderLoop(() => scene.render())
    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearMeshes()
      scene.dispose()
      engine.dispose()
    }
  }, [clearMeshes])

  // ── Build scene based on stage ──────────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !transformerState) return

    clearMeshes()
    const meshes: Mesh[] = []

    const addMesh = (mesh: Mesh) => {
      meshes.push(mesh)
    }

    const addHover = (mesh: Mesh) => {
      mesh.actionManager = new ActionManager(scene)
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          highlightRef.current?.addMesh(mesh, Color3.White())
        }),
      )
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          highlightRef.current?.removeMesh(mesh)
        }),
      )
    }

    const { tokens, layers, config } = transformerState

    // ── Render tokens as a row ────────────────────────────────────────────
    if (currentStage >= TransformerStage.TOKENIZATION) {
      const totalWidth = tokens.length * LAYOUT.tokenSpacing
      tokens.forEach((token, idx) => {
        const x = -totalWidth / 2 + idx * LAYOUT.tokenSpacing
        const box = MeshBuilder.CreateBox(
          `token_${idx}`,
          { width: 0.5, height: 0.25, depth: 0.15 },
          scene,
        )
        box.position = new Vector3(x, 0, 0)

        const mat = new StandardMaterial(`token_mat_${idx}`, scene)
        mat.diffuseColor = hexToColor3(COLORS.token)
        mat.alpha = 0.9
        box.material = mat
        box.metadata = { type: 'token', token: token.text, index: idx }
        addHover(box)
        addMesh(box)

        // Token label
        const label = createLabel(scene, token.text, new Vector3(x, 0.35, 0), COLORS.text, 96)
        addMesh(label)
      })
    }

    // ── Embedding layer ───────────────────────────────────────────────────
    if (currentStage >= TransformerStage.EMBEDDING) {
      const embY = -LAYOUT.stageSpacing
      const totalWidth = tokens.length * LAYOUT.tokenSpacing

      tokens.forEach((token, idx) => {
        const x = -totalWidth / 2 + idx * LAYOUT.tokenSpacing
        const embBox = MeshBuilder.CreateBox(
          `emb_${idx}`,
          { width: 0.45, height: 0.6, depth: 0.15 },
          scene,
        )
        embBox.position = new Vector3(x, embY, 0)

        const mat = new StandardMaterial(`emb_mat_${idx}`, scene)
        mat.diffuseColor = hexToColor3(COLORS.embedding)
        mat.alpha = 0.85
        embBox.material = mat
        embBox.metadata = {
          type: 'embedding',
          token: token.text,
          embedding: token.embedding.slice(0, 8),
        }
        addHover(embBox)
        addMesh(embBox)
      })

      // Stage label
      const stageLabel = createLabel(
        scene,
        'Token Embeddings',
        new Vector3(0, embY + 0.7, 0),
        COLORS.embedding,
      )
      addMesh(stageLabel)
    }

    // ── Positional encoding ───────────────────────────────────────────────
    if (currentStage >= TransformerStage.POSITIONAL_ENCODING) {
      const peY = -LAYOUT.stageSpacing * 2
      const totalWidth = tokens.length * LAYOUT.tokenSpacing

      // Positional encoding visualization — wave texture on a plane
      const peWidth = totalWidth + 0.5
      const pePlane = MeshBuilder.CreatePlane(
        'pe_plane',
        { width: peWidth, height: 0.8 },
        scene,
      )
      pePlane.position = new Vector3(0, peY, -0.1)

      const texSize = 512
      const tex = new DynamicTexture('pe_tex', { width: texSize, height: 128 }, scene, false)
      const ctx = tex.getContext() as CanvasRenderingContext2D

      // Draw sine/cosine waves
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, texSize, 128)

      const frequencies = [1, 2, 4, 8]
      const waveColors = ['#E74C3C', '#F39C12', '#2ECC71', '#3498DB']
      frequencies.forEach((freq, fi) => {
        ctx.beginPath()
        ctx.strokeStyle = waveColors[fi]!
        ctx.lineWidth = 2
        for (let px = 0; px < texSize; px++) {
          const y = 64 + Math.sin((px / texSize) * Math.PI * 2 * freq) * 25
          if (px === 0) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      })
      tex.update()

      const peMat = new StandardMaterial('pe_mat', scene)
      peMat.diffuseTexture = tex
      peMat.emissiveColor = hexToColor3(COLORS.positionalEncoding).scale(0.2)
      peMat.backFaceCulling = false
      pePlane.material = peMat
      addMesh(pePlane)

      const peLabel = createLabel(
        scene,
        'Positional Encoding',
        new Vector3(0, peY + 0.7, 0),
        COLORS.positionalEncoding,
      )
      addMesh(peLabel)
    }

    // ── Self-Attention / Multi-Head Attention ─────────────────────────────
    if (currentStage >= TransformerStage.SELF_ATTENTION && layers.length > 0) {
      const layer = layers[selectedLayer]
      if (layer) {
        const attY = -LAYOUT.stageSpacing * 3
        const { selfAttention } = layer
        const numHeads = selfAttention.numHeads

        // Container box for multi-head attention
        const containerWidth = Math.min(numHeads, LAYOUT.maxHeadsPerRow) * 1.2 + 0.5
        const containerRows = Math.ceil(numHeads / LAYOUT.maxHeadsPerRow)
        const containerHeight = containerRows * 1.2 + 0.5
        const container = MeshBuilder.CreateBox(
          'mha_container',
          { width: containerWidth, height: containerHeight, depth: 0.3 },
          scene,
        )
        container.position = new Vector3(0, attY, 0)
        const containerMat = new StandardMaterial('mha_container_mat', scene)
        containerMat.diffuseColor = hexToColor3(COLORS.attention)
        containerMat.alpha = 0.15
        containerMat.wireframe = false
        container.material = containerMat
        addMesh(container)

        // Individual attention heads
        for (let h = 0; h < numHeads; h++) {
          const col = h % LAYOUT.maxHeadsPerRow
          const row = Math.floor(h / LAYOUT.maxHeadsPerRow)
          const headX =
            -((Math.min(numHeads, LAYOUT.maxHeadsPerRow) - 1) * 1.1) / 2 + col * 1.1
          const headY = attY + ((containerRows - 1) * 1.1) / 2 - row * 1.1

          const headBox = MeshBuilder.CreateBox(
            `head_${h}`,
            { width: 0.9, height: 0.9, depth: 0.2 },
            scene,
          )
          headBox.position = new Vector3(headX, headY, 0.1)

          // Color gradient per head
          const hue = (h / numHeads) * 0.8
          const [hr, hg, hb] = hslToRGB(hue, 0.7, 0.5)
          const headMat = new StandardMaterial(`head_mat_${h}`, scene)
          headMat.diffuseColor = new Color3(hr / 255, hg / 255, hb / 255)
          headMat.alpha = h === selectedHead ? 1.0 : 0.6
          headBox.material = headMat
          headBox.metadata = {
            type: 'attention_head',
            headIndex: h,
            isSelected: h === selectedHead,
          }
          addHover(headBox)
          addMesh(headBox)

          // Head label
          const headLabel = createLabel(
            scene,
            `H${h + 1}`,
            new Vector3(headX, headY - 0.6, 0.1),
            '#FFFFFF',
            64,
          )
          addMesh(headLabel)
        }

        // Q/K/V labels
        if (currentStage >= TransformerStage.SELF_ATTENTION) {
          const qkvY = attY + containerHeight / 2 + 0.5
          ;['Q', 'K', 'V'].forEach((label, i) => {
            const qkvBox = MeshBuilder.CreateBox(
              `qkv_${label}`,
              { width: 0.5, height: 0.35, depth: 0.1 },
              scene,
            )
            const qkvColors = [COLORS.query, COLORS.key, COLORS.value]
            qkvBox.position = new Vector3(-1.2 + i * 1.2, qkvY, 0)
            const qkvMat = new StandardMaterial(`qkv_mat_${label}`, scene)
            qkvMat.diffuseColor = hexToColor3(qkvColors[i]!)
            qkvMat.emissiveColor = hexToColor3(qkvColors[i]!).scale(0.3)
            qkvBox.material = qkvMat
            addMesh(qkvBox)

            const qkvLabel = createLabel(
              scene,
              label,
              new Vector3(-1.2 + i * 1.2, qkvY + 0.35, 0),
              qkvColors[i],
              64,
            )
            addMesh(qkvLabel)
          })
        }

        // Stage label
        const attLabel = createLabel(
          scene,
          currentStage >= TransformerStage.MULTI_HEAD_ATTENTION
            ? 'Multi-Head Attention'
            : 'Self-Attention',
          new Vector3(0, attY + containerHeight / 2 + 1.2, 0),
          COLORS.attention,
        )
        addMesh(attLabel)
      }
    }

    // ── Residual Connection + LayerNorm ────────────────────────────────────
    if (currentStage >= TransformerStage.RESIDUAL_ADD_NORM_1 && layers.length > 0) {
      const resY = -LAYOUT.stageSpacing * 4
      const normBlock = MeshBuilder.CreateBox(
        'add_norm_1',
        { width: 2.5, height: 0.4, depth: 0.3 },
        scene,
      )
      normBlock.position = new Vector3(0, resY, 0)
      const normMat = new StandardMaterial('norm_mat_1', scene)
      normMat.diffuseColor = hexToColor3(COLORS.layerNorm)
      normMat.alpha = 0.7
      normBlock.material = normMat
      addMesh(normBlock)

      // Residual arc (skip connection)
      const arcStart = new Vector3(-2, -LAYOUT.stageSpacing * 2, 0)
      const arcEnd = new Vector3(-2, resY, 0)
      const arcMid = new Vector3(-3.5, (arcStart.y + arcEnd.y) / 2, 0)

      const arcPath = Curve3.CreateCatmullRomSpline(
        [arcStart, arcMid, arcEnd],
        LAYOUT.residualCurveSegments,
        false,
      )
      const arcTube = MeshBuilder.CreateTube(
        'residual_arc_1',
        { path: arcPath.getPoints(), radius: 0.04, tessellation: 8 },
        scene,
      )
      const arcMat = new StandardMaterial('arc_mat_1', scene)
      arcMat.diffuseColor = hexToColor3(COLORS.residual)
      arcMat.emissiveColor = hexToColor3(COLORS.residual).scale(0.4)
      arcTube.material = arcMat
      addMesh(arcTube)

      const normLabel = createLabel(
        scene,
        'Add & LayerNorm',
        new Vector3(0, resY + 0.5, 0),
        COLORS.layerNorm,
      )
      addMesh(normLabel)
    }

    // ── Feed-Forward Network ──────────────────────────────────────────────
    if (currentStage >= TransformerStage.FEED_FORWARD && layers.length > 0) {
      const ffnY = -LAYOUT.stageSpacing * 5
      const layer = layers[selectedLayer]

      if (layer) {
        // Input layer (dModel)
        const ffnInput = MeshBuilder.CreateBox(
          'ffn_input',
          { width: 1.0, height: 0.5, depth: 0.2 },
          scene,
        )
        ffnInput.position = new Vector3(-1.5, ffnY, 0)
        const ffnInMat = new StandardMaterial('ffn_in_mat', scene)
        ffnInMat.diffuseColor = hexToColor3(COLORS.feedForward)
        ffnInMat.alpha = 0.7
        ffnInput.material = ffnInMat
        addMesh(ffnInput)

        // Hidden layer (dFF — expanded)
        const hiddenScale = Math.log2(config.dFF / config.dModel + 1) * 0.8
        const ffnHidden = MeshBuilder.CreateBox(
          'ffn_hidden',
          { width: 1.0 + hiddenScale, height: 0.7, depth: 0.2 },
          scene,
        )
        ffnHidden.position = new Vector3(0, ffnY, 0)
        const ffnHidMat = new StandardMaterial('ffn_hid_mat', scene)
        ffnHidMat.diffuseColor = hexToColor3(COLORS.feedForward)
        ffnHidMat.emissiveColor = hexToColor3(COLORS.feedForward).scale(0.2)
        ffnHidden.material = ffnHidMat
        addMesh(ffnHidden)

        // ReLU label
        const reluLabel = createLabel(
          scene,
          'ReLU',
          new Vector3(0, ffnY + 0.55, 0),
          '#FF6B6B',
          64,
        )
        addMesh(reluLabel)

        // Output layer (dModel)
        const ffnOutput = MeshBuilder.CreateBox(
          'ffn_output',
          { width: 1.0, height: 0.5, depth: 0.2 },
          scene,
        )
        ffnOutput.position = new Vector3(1.5, ffnY, 0)
        const ffnOutMat = new StandardMaterial('ffn_out_mat', scene)
        ffnOutMat.diffuseColor = hexToColor3(COLORS.feedForward)
        ffnOutMat.alpha = 0.7
        ffnOutput.material = ffnOutMat
        addMesh(ffnOutput)

        // Connection arrows
        const connPoints = [
          [new Vector3(-0.9, ffnY, 0), new Vector3(-0.6, ffnY, 0)],
          [new Vector3(0.6, ffnY, 0), new Vector3(0.9, ffnY, 0)],
        ]
        connPoints.forEach(([from, to], ci) => {
          const line = MeshBuilder.CreateTube(
            `ffn_conn_${ci}`,
            {
              path: [from!, to!],
              radius: 0.03,
              tessellation: 6,
            },
            scene,
          )
          const lineMat = new StandardMaterial(`ffn_conn_mat_${ci}`, scene)
          lineMat.diffuseColor = new Color3(0.5, 0.5, 0.5)
          line.material = lineMat
          addMesh(line)
        })

        const ffnLabel = createLabel(
          scene,
          'Feed-Forward Network',
          new Vector3(0, ffnY + 1.0, 0),
          COLORS.feedForward,
        )
        addMesh(ffnLabel)
      }
    }

    // ── Second Residual + LayerNorm ────────────────────────────────────────
    if (currentStage >= TransformerStage.RESIDUAL_ADD_NORM_2 && layers.length > 0) {
      const res2Y = -LAYOUT.stageSpacing * 6
      const norm2 = MeshBuilder.CreateBox(
        'add_norm_2',
        { width: 2.5, height: 0.4, depth: 0.3 },
        scene,
      )
      norm2.position = new Vector3(0, res2Y, 0)
      const norm2Mat = new StandardMaterial('norm_mat_2', scene)
      norm2Mat.diffuseColor = hexToColor3(COLORS.layerNorm)
      norm2Mat.alpha = 0.7
      norm2.material = norm2Mat
      addMesh(norm2)

      // Residual arc
      const arc2Start = new Vector3(2, -LAYOUT.stageSpacing * 4, 0)
      const arc2End = new Vector3(2, res2Y, 0)
      const arc2Mid = new Vector3(3.5, (arc2Start.y + arc2End.y) / 2, 0)

      const arc2Path = Curve3.CreateCatmullRomSpline(
        [arc2Start, arc2Mid, arc2End],
        LAYOUT.residualCurveSegments,
        false,
      )
      const arc2Tube = MeshBuilder.CreateTube(
        'residual_arc_2',
        { path: arc2Path.getPoints(), radius: 0.04, tessellation: 8 },
        scene,
      )
      const arc2Mat = new StandardMaterial('arc_mat_2', scene)
      arc2Mat.diffuseColor = hexToColor3(COLORS.residual)
      arc2Mat.emissiveColor = hexToColor3(COLORS.residual).scale(0.4)
      arc2Tube.material = arc2Mat
      addMesh(arc2Tube)

      const norm2Label = createLabel(
        scene,
        'Add & LayerNorm',
        new Vector3(0, res2Y + 0.5, 0),
        COLORS.layerNorm,
      )
      addMesh(norm2Label)
    }

    // ── Layer output ──────────────────────────────────────────────────────
    if (currentStage >= TransformerStage.LAYER_OUTPUT && layers.length > 0) {
      const outY = -LAYOUT.stageSpacing * 7

      // Layer boundary box
      const layerBox = MeshBuilder.CreateBox(
        'layer_output',
        { width: 3.0, height: 0.5, depth: 0.3 },
        scene,
      )
      layerBox.position = new Vector3(0, outY, 0)
      const layerMat = new StandardMaterial('layer_out_mat', scene)
      layerMat.diffuseColor = hexToColor3(COLORS.encoder)
      layerMat.alpha = 0.5
      layerBox.material = layerMat
      addMesh(layerBox)

      const layerLabel = createLabel(
        scene,
        `Layer ${selectedLayer + 1} Output`,
        new Vector3(0, outY + 0.5, 0),
        COLORS.encoder,
      )
      addMesh(layerLabel)
    }

    // ── Final output ──────────────────────────────────────────────────────
    if (currentStage >= TransformerStage.FINAL_OUTPUT) {
      const finalY = -LAYOUT.stageSpacing * 8
      const totalWidth = tokens.length * LAYOUT.tokenSpacing

      tokens.forEach((token, idx) => {
        const x = -totalWidth / 2 + idx * LAYOUT.tokenSpacing
        const outBox = MeshBuilder.CreateBox(
          `final_${idx}`,
          { width: 0.45, height: 0.4, depth: 0.15 },
          scene,
        )
        outBox.position = new Vector3(x, finalY, 0)

        const outMat = new StandardMaterial(`final_mat_${idx}`, scene)
        outMat.diffuseColor = hexToColor3(COLORS.output)
        outMat.emissiveColor = hexToColor3(COLORS.output).scale(0.3)
        outBox.material = outMat
        addMesh(outBox)
      })

      const finalLabel = createLabel(
        scene,
        'Transformed Output',
        new Vector3(0, finalY + 0.6, 0),
        COLORS.output,
      )
      addMesh(finalLabel)
    }

    // ── Vertical flow connections ─────────────────────────────────────────
    if (currentStage >= TransformerStage.EMBEDDING) {
      const stages = [0, -LAYOUT.stageSpacing]
      if (currentStage >= TransformerStage.POSITIONAL_ENCODING)
        stages.push(-LAYOUT.stageSpacing * 2)
      if (currentStage >= TransformerStage.SELF_ATTENTION)
        stages.push(-LAYOUT.stageSpacing * 3)
      if (currentStage >= TransformerStage.RESIDUAL_ADD_NORM_1)
        stages.push(-LAYOUT.stageSpacing * 4)
      if (currentStage >= TransformerStage.FEED_FORWARD)
        stages.push(-LAYOUT.stageSpacing * 5)
      if (currentStage >= TransformerStage.RESIDUAL_ADD_NORM_2)
        stages.push(-LAYOUT.stageSpacing * 6)
      if (currentStage >= TransformerStage.LAYER_OUTPUT)
        stages.push(-LAYOUT.stageSpacing * 7)
      if (currentStage >= TransformerStage.FINAL_OUTPUT)
        stages.push(-LAYOUT.stageSpacing * 8)

      for (let i = 0; i < stages.length - 1; i++) {
        const from = new Vector3(0, stages[i]! - 0.3, 0)
        const to = new Vector3(0, stages[i + 1]! + 0.4, 0)
        const tube = MeshBuilder.CreateTube(
          `flow_${i}`,
          { path: [from, to], radius: 0.025, tessellation: 6 },
          scene,
        )
        const tubeMat = new StandardMaterial(`flow_mat_${i}`, scene)
        tubeMat.diffuseColor = new Color3(0.4, 0.4, 0.4)
        tubeMat.alpha = 0.5
        tube.material = tubeMat
        addMesh(tube)
      }
    }

    meshesRef.current = meshes

    // Adjust camera to see all content
    if (scene.activeCamera && scene.activeCamera instanceof ArcRotateCamera) {
      const cam = scene.activeCamera
      const bottomY =
        currentStage >= TransformerStage.FINAL_OUTPUT
          ? -LAYOUT.stageSpacing * 8
          : -(currentStage + 1) * LAYOUT.stageSpacing
      cam.target = new Vector3(0, bottomY / 2, 0)
      cam.radius = Math.max(15, Math.abs(bottomY) * 0.8)
    }
  }, [transformerState, currentStage, selectedLayer, selectedHead, clearMeshes])

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        '& canvas': {
          width: '100%',
          height: '100%',
          outline: 'none',
          touchAction: 'none',
        },
      }}
    >
      <canvas ref={canvasRef} />
    </Box>
  )
}
