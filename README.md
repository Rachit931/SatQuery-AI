# SatQuery AI — Simplified Architecture README

## 1. What We Are Building

SatQuery AI is a web-based remote-sensing assistant.

A user provides satellite image(s) and asks a natural-language question.

The system:

1. checks the input;
2. understands what kind of analysis is needed;
3. selects the appropriate specialist AI model(s);
4. executes them;
5. combines their evidence;
6. returns an answer, visual evidence, confidence, and an execution trace.

The basic idea is:

User → Images + Query → SatQuery → Specialist Model(s) → Evidence → Answer

---

# 2. The Two Phases

## Phase 1 — Single-Image Intelligence

Phase 1 focuses on ONE remote-sensing image.

Supported capabilities:

- Visual Question Answering (VQA)
- Image/scene captioning
- Visual grounding
- Precise object detection when needed
- Natural-language interaction
- Evidence and confidence
- Web interface

Main flow:

Image + Query
→ input processing
→ LLM controller
→ GeoChat / Grounding DINO
→ evidence
→ answer

### Main Phase-1 model

**GeoChat**

GeoChat is the main remote-sensing VLM for single-image understanding.

It can handle:

- VQA
- captioning
- grounded/region-level interaction

These are tasks/capabilities of GeoChat, not three separate models.

### Grounding / detection specialist

**Grounding DINO**

Used when the query needs precise object detection, multiple-object localization, counting, or structured bounding boxes.

Example:

"Find all ships."

Image + "ships"
→ Grounding DINO
→ bounding boxes + scores

---

## Phase 2 — Multi-Image and Multi-Sensor Intelligence

Phase 2 extends Phase 1.

### A. Bi-temporal analysis

Input:

Image T1 + Image T2 + Query

Example:

"What changed between 2024 and 2026?"

→ registration/alignment
→ ChangeChat / DeltaVLM
→ change description / localization / quantification

### B. Optical + SAR analysis

Input:

Optical image + SAR image + Query

→ optical encoder
→ SAR encoder
→ fusion
→ cross-attention
→ query-conditioned fusion
→ result

This is the main custom ML component of Phase 2.

---

# 3. Core Model Stack

We keep FOUR core specialist models/components.

## 1. GeoChat

**Type:** Remote-sensing Vision-Language Model

**Purpose:** Single-image understanding.

**Inputs:**
- image
- natural-language query

**Outputs:**
- answer
- caption
- grounded result where supported

**Training/adaptation:**
- start from pretrained GeoChat
- adapt/fine-tune using BigEarthNet.txt
- use LoRA/PEFT where compatible

---

## 2. Grounding DINO

**Type:** Open-set language-guided object detector

**Purpose:** Precise object detection/localization.

**Inputs:**
- image
- text/object prompt

**Outputs:**
- bounding boxes
- labels
- confidence scores

**Why it exists:**

GeoChat can ground objects, but a dedicated detector gives a cleaner structured tool for:

- multiple objects
- counting
- precise boxes
- detection verification

**Possible remote-sensing data:**
- VRSBench object references where permitted
- xView or another suitable overhead detection dataset for an expanded detector branch

---

## 3. ChangeChat / DeltaVLM

**Type:** Bitemporal remote-sensing Vision-Language Model

**Purpose:** Understand changes between images acquired at different times.

**Inputs:**
- image T1
- image T2
- query

**Outputs:**
- change description
- change answer
- localization/quantification where supported

**Training/adaptation data:**
- ChangeChat-87k
- or the later ChangeChat-105k / DeltaVLM data, depending on the final model choice, weights, code, license, and competition rules

**Evaluation:**
- CDVQA

---

## 4. Optical-SAR Fusion Model

**Type:** Custom multimodal fusion model

**Purpose:** Jointly reason over optical/multispectral and SAR imagery.

Architecture:

Optical
→ optical encoder
→ optical features

SAR
→ SAR encoder
→ SAR features

Optical features + SAR features
→ fusion
→ joint representation
→ prediction

Development stages:

### Baseline
Late fusion:

Optical features + SAR features
→ concatenate
→ MLP/head

### Advanced
Cross-attention:

Optical tokens ↔ SAR tokens

### Final
Query-conditioned fusion:

Query + optical + SAR
→ attention/fusion
→ query-specific joint representation
→ result

---

# 4. Optional Support Model

## SAM 2

SAM 2 is NOT a fifth core reasoning specialist.

It is an optional spatial-mask refinement tool.

Flow:

GeoChat / Grounding DINO
→ bounding box / point
→ SAM 2
→ precise pixel mask

Use it only when a precise segmentation mask is useful or required.

---

# 5. Dataset → Model Mapping

## BigEarthNet.txt

**Primary role: adaptation/training**

Use for:

- GeoChat remote-sensing adaptation
- multisensor image-text learning
- optical-SAR fusion experiments

It contains co-registered Sentinel-1 SAR and Sentinel-2 multispectral imagery plus large-scale text annotations.

Pipeline:

BigEarthNet.txt
→ preprocessing
→ training examples
→ LoRA/PEFT adaptation
→ adapted GeoChat

It can also support optical-SAR fusion training because it contains aligned SAR + multispectral data.

---

## VRSBench

**Primary role: single-image benchmark**

Use for:

- VQA evaluation
- caption/grounding evaluation
- object-reference/grounding data where permitted

---

## RSVQA

**Primary role: single-image VQA evaluation**

Use it to measure how well the adapted remote-sensing VLM answers remote-sensing questions.

---

## CDVQA

**Primary role: temporal/change evaluation**

Use:

Image T1 + Image T2 + question
→ Change specialist
→ CDVQA evaluation

---

## ChangeChat-87k / ChangeChat-105k

**Primary role: training/adaptation for the temporal specialist**, where permitted.

Use only after selecting the actual change model and verifying its available weights/code.

---

## xView / other appropriate overhead-detection data

**Primary role: optional detector specialization**

Use if the dedicated Grounding DINO branch needs further remote-sensing object-detection adaptation.

---

## ISRO/SAC Evaluation Set

**Primary role: final external evaluation**

Keep it separate from training.

Do not train using hidden evaluation annotations.

---

# 6. Data Processing Pipeline

Every uploaded image goes through:

Upload
→ file validation
→ image-count check
→ modality check
→ metadata check
→ CRS check
→ geospatial preprocessing
→ normalization/resampling
→ tiling if needed
→ registration if needed
→ model-ready input

Main tools:

- Rasterio
- GDAL
- NumPy
- OpenCV
- GeoPandas
- Shapely

Important concepts:

- GeoTIFF
- raster
- bands
- CRS
- EPSG
- georeferencing
- reprojection
- resampling
- co-registration

---

# 7. LLM Agent

The LLM is the controller.

It is NOT the main satellite-image specialist.

It receives:

- the user's query;
- image count;
- modality;
- timestamps;
- metadata;
- the list of available tools.

It decides which tool(s) should be used.

Examples:

"Describe this image."
→ GeoChat

"Where are the ships?"
→ Grounding DINO

"What changed between these dates?"
→ ChangeChat

"Use optical and SAR together."
→ Optical-SAR Fusion

Complex request:

"What new construction occurred and does SAR support it?"

→ ChangeChat
→ Grounding DINO / GeoChat
→ Optical-SAR Fusion
→ evidence fusion

The LLM does not execute the models itself.

It returns a structured tool call.

Python executes the selected model.

---

# 8. Evidence Layer

Every model should return a common result format.

Example:

{
    "task": "...",
    "model": "...",
    "claim": "...",
    "confidence": 0.91,
    "bbox": [...],
    "mask": "...",
    "metadata": {...}
}

This allows outputs from different specialists to be combined.

The evidence engine can:

- combine results;
- check agreement;
- detect disagreement;
- calculate confidence;
- preserve spatial evidence.

---

# 9. Phase 1 — Exact Build Order

1. Get a small BigEarthNet.txt sample.
2. Inspect one sample.
3. Build GeoTIFF/raster loading.
4. Build preprocessing.
5. Run pretrained GeoChat.
6. Verify image + question → answer.
7. Test GeoChat VQA.
8. Test captioning.
9. Test grounding.
10. Adapt GeoChat using permitted BigEarthNet.txt training data.
11. Evaluate the adapted GeoChat.
12. Integrate Grounding DINO where precise detection is needed.
13. Create a common result/evidence schema.
14. Create a model/tool registry.
15. Add the LLM controller.
16. Implement structured tool calling.
17. Build the execution layer.
18. Add confidence/evidence handling.
19. Build FastAPI.
20. Build the GUI.
21. Add execution tracing.
22. Evaluate the complete Phase-1 workflow.

At this point Phase 1 is complete.

---

# 10. Phase 2 — Exact Build Order

23. Add two-image input.
24. Validate temporal metadata.
25. Add registration/co-registration.
26. Build a simple change baseline.
27. Integrate ChangeChat / DeltaVLM.
28. Add change localization/quantification where supported.
29. Add optical + SAR input.
30. Preprocess optical data.
31. Preprocess SAR data.
32. Build optical encoder branch.
33. Build SAR encoder branch.
34. Build a late-fusion baseline.
35. Upgrade to cross-attention.
36. Add query-conditioned fusion.
37. Upgrade the LLM agent to multi-step workflows.
38. Add multi-model evidence fusion.
39. Add confidence calibration.
40. Add disagreement handling.
41. Add SAM 2 when precise masks are required.
42. Evaluate on CDVQA.
43. Evaluate on the prescribed ISRO/SAC evaluation set.
44. Finalize the GUI and deployment.

At this point Phase 2 is complete.

---

# 11. Final Architecture

                         USER
                           │
                   images + query
                           │
                           ▼
                    WEB GUI / API
                           │
                           ▼
                  INPUT VALIDATION
                           │
                           ▼
               GEOSPATIAL PROCESSING
                           │
                           ▼
                  QUERY + INPUT ANALYSIS
                           │
                           ▼
                     LLM AGENT
                           │
              ┌────────────┼─────────────┐
              │            │             │
              ▼            ▼             ▼
           GeoChat     Grounding DINO  ChangeChat
              │            │             │
       VQA/Caption/    boxes/counts   temporal change
        Grounding
              │            │             │
              └────────────┼─────────────┘
                           │
                           ▼
                   OPTICAL-SAR FUSION
                   (when required)
                           │
                           ▼
                        SAM 2
                   (optional masks)
                           │
                           ▼
                    EVIDENCE ENGINE
                           │
                           ▼
                 CONFIDENCE / AGREEMENT
                           │
                           ▼
                      ANSWER LLM
                           │
                           ▼
                         GUI

---

# 12. Final Mental Model

SatQuery is not one huge model.

It is:

**GeoChat**
→ understands a single remote-sensing image.

**Grounding DINO**
→ precisely finds/counts objects when needed.

**ChangeChat / DeltaVLM**
→ understands change between dates.

**Optical-SAR Fusion**
→ jointly reasons over optical + SAR.

**SAM 2 (optional)**
→ turns a region/box/point into a precise mask.

**LLM Agent**
→ decides which specialist(s) to use and in what order.

**Evidence Engine**
→ combines their outputs and produces a trustworthy result.

The overall system is:

User
→ query + image(s)
→ validation/preprocessing
→ LLM agent
→ specialist model(s)
→ evidence
→ confidence
→ final answer + visual evidence
→ GUI
