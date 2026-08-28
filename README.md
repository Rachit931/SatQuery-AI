# SatQuery AI — Ground-Level Build Guide

## 0. What are we building?

SatQuery AI is a web application where a user uploads one or more satellite images and asks a normal-language question.

Examples:

- "Describe the land cover in this image."
- "Where is the water body?"
- "What changed between these two dates?"
- "Has the built-up area increased?"
- "Use the optical and SAR images together to identify built-up and water-covered regions."

The application decides what kind of remote-sensing analysis the question requires, calls the appropriate specialist AI model(s), combines their evidence, and returns:

- a natural-language answer;
- visual evidence such as boxes, masks, or change maps when available;
- confidence information;
- an execution trace showing which task/model was used.

The key idea is NOT "train one giant SatQuery model."

It is:

    User
      ↓
    Query + satellite image(s)
      ↓
    Validate / preprocess data
      ↓
    Understand the query
      ↓
    Agent selects a workflow
      ↓
    Specialist remote-sensing models
      ↓
    Evidence fusion
      ↓
    Final LLM response
      ↓
    GUI

---

# 1. What problem does SatQuery solve?

Remote-sensing AI normally consists of separate tools:

    VQA model       → answers questions about one image
    Caption model   → describes an image
    Grounding model → finds a requested object/region
    Change model    → compares images from different dates
    SAR/optical model → combines different sensors

A non-expert should not have to know which tool to use.

SatQuery gives the user one interface.

Instead of:

    User → manually choose model → configure model → run model

we want:

    User → ask question → SatQuery chooses workflow → result

The difficult part is that some questions require more than one image.

For example:

    Optical image from 2024
    +
    Optical image from 2026
    +
    Question: "Has urban expansion occurred?"

requires temporal reasoning.

Another example:

    Optical image
    +
    SAR image
    +
    Question: "Where are built-up regions?"

requires cross-modal reasoning.

---

# 2. The two phases

We deliberately build this in two phases.

## Phase 1 — Single-image system

Input:

    ONE optical/multispectral OR SAR image
    +
    natural-language query

Capabilities:

    1. VQA
    2. Captioning OR grounding
    3. Query classification
    4. Agent/tool routing
    5. Evidence output
    6. Confidence
    7. Execution trace

At the end of Phase 1:

    Image + Question
          ↓
       SatQuery
          ↓
    Remote-sensing VLM
          ↓
       Answer

## Phase 2 — Multi-image system

Add:

    A. Bi-temporal imagery
       Image T1 + Image T2
       → change detection / change VQA / localization

    B. Cross-modal imagery
       Optical + SAR
       → joint analysis / multimodal fusion

At the end:

    Images + Question
          ↓
       SatQuery
          ↓
       Agent
          ↓
    ┌─────┴──────────────┐
    ↓                    ↓
  Temporal          Optical + SAR
  specialist          specialist
    ↓                    ↓
    └───────┬────────────┘
            ↓
      Evidence fusion
            ↓
       Final answer

---

# 3. The complete technology stack

## Programming

- Python
- NumPy
- Pandas
- PyTorch
- scikit-learn

## Remote sensing / geospatial

- Rasterio
- GDAL
- GeoPandas
- Shapely
- xarray / rioxarray
- GeoTIFF
- CRS / EPSG
- GeoJSON

## Computer vision

- OpenCV
- TorchVision
- CNNs
- ResNet
- Vision Transformers
- Object detection
- Semantic segmentation
- Bounding boxes
- IoU
- mAP
- Dice / mIoU

## Transformers

- Self-attention
- Multi-head attention
- Cross-attention
- Transformer encoders/decoders
- Vision Transformers

## Vision-language

- CLIP
- Image embeddings
- Text embeddings
- Image-text alignment
- Vision encoder + LLM
- Projection/adaptor layers
- Visual instruction tuning
- VQA
- Captioning
- Visual grounding
- Remote-sensing VLMs such as GeoChat

## Temporal/change

- Image registration
- Co-registration
- Bitemporal learning
- Pixel/feature differencing
- Siamese networks
- Change segmentation
- Change localization
- Change captioning
- Change VQA
- ChangeChat or a comparable specialist

## Multimodal

- Optical encoder
- SAR encoder
- Early fusion
- Late fusion
- Intermediate fusion
- Cross-attention
- Query-conditioned fusion
- Multimodal representation learning

## Fine-tuning

- Hugging Face Transformers
- PEFT
- LoRA
- QLoRA
- bitsandbytes
- Accelerate

## LLM / agent

- LLMs
- Prompting
- Structured output
- JSON schemas
- Function/tool calling
- Task decomposition
- Planning
- Model/tool routing
- Tool registry
- Agent state
- Workflow graphs
- LangGraph (optional implementation framework)

## Evidence / reliability

- Evidence objects
- Score fusion
- Confidence estimation
- Probability calibration
- Temperature scaling
- Uncertainty
- Sensor disagreement
- Grounded generation
- Hallucination control

## Application

- FastAPI
- Pydantic
- Streamlit for a prototype OR React/Next.js for a polished GUI
- Leaflet/MapLibre for maps

## Deployment

- Docker
- NVIDIA CUDA
- GPU inference
- Mixed precision
- Quantization

## Experiment tracking

- Git/GitHub
- MLflow or Weights & Biases
- DVC if dataset versioning is needed

---

# 4. What you actually build vs what you reuse

This distinction prevents the project from becoming impossible.

## Reuse pretrained models

Do NOT try to build these from scratch:

- a giant LLM;
- CLIP;
- a huge vision foundation model;
- GeoChat-scale VLM;
- ChangeChat-scale VLM.

Use pretrained models and adapt/fine-tune where required.

## Build ourselves

The project-specific engineering includes:

- input validation;
- geospatial preprocessing;
- image registration;
- task classifier;
- model registry;
- agent planner;
- tool execution;
- optical-SAR fusion;
- evidence engine;
- confidence/calibration;
- execution trace;
- GUI;
- API.

---

# 5. Dataset plan

The exact benchmark files/splits should follow the competition-provided instructions. Do not assume a random online split is the official evaluation split.

The practical dataset plan is:

## Dataset A — BigEarthNet.txt

Primary adaptation/training resource for remote-sensing image-text and multisensor understanding.

Use it for:

- remote-sensing VLM adaptation;
- image-text alignment;
- VQA/grounding-related training where the released annotations support it;
- optical/SAR understanding.

Do NOT treat it as merely "the test dataset."

Its main role in this project is adaptation/training.

## Dataset B — VRSBench

Use the prescribed benchmark split for evaluation of the relevant single-image tasks, according to the project statement.

Use it for:

- single-image captioning;
- grounding;
- related remote-sensing vision-language evaluation.

## Dataset C — RSVQA

Use the prescribed benchmark split for:

- single-image visual question answering.

## Dataset D — CDVQA

Use the prescribed benchmark split for:

- bitemporal/change-based visual question answering.

## Dataset E — ISRO/SAC evaluation set

This is the important final external evaluation.

According to the project statement, it contains pre-georeferenced and co-registered Cartosat-2S optical and RISAT SAR image pairs with task-specific reference answers, labels, boxes, or masks as applicable.

Do NOT train on the hidden evaluation annotations.

Use the released/prepared inputs exactly as required and keep evaluation annotations separate.

---

# 6. Data directory

Create this before doing ML:

    satquery-ai/
    └── data/
        ├── raw/
        │   ├── bigearthnet/
        │   ├── vrsbench/
        │   ├── rsvqa/
        │   ├── cdvqa/
        │   └── isro_sac/
        │
        ├── processed/
        │   ├── bigearthnet/
        │   ├── vrsbench/
        │   ├── rsvqa/
        │   ├── cdvqa/
        │   └── isro_sac/
        │
        └── metadata/

Never mix:

    raw data
    processed data
    model outputs
    evaluation annotations

---

# 7. Phase 1 — Build it from zero

## Step 1 — Create the Python environment

Start with:

    Python
    PyTorch
    NumPy
    Pandas
    scikit-learn
    OpenCV
    Rasterio
    GDAL
    GeoPandas
    Shapely
    Hugging Face Transformers
    PEFT
    FastAPI
    Pydantic

Do not install every possible library on day one.

Start small and add dependencies as each module is implemented.

---

# 8. Step 2 — Download and inspect BigEarthNet.txt

Download the official BigEarthNet.txt release and put it under:

    data/raw/bigearthnet/

Before training anything, inspect:

- image format;
- number of bands;
- text annotations;
- VQA/referring-expression annotations if included in the release;
- optical/SAR pairing;
- metadata;
- train/validation/test organization.

Create a notebook:

    notebooks/01_bigearthnet_exploration.ipynb

Your first goal is simply:

    load one sample
       ↓
    display optical image
       ↓
    inspect SAR image
       ↓
    print text annotation
       ↓
    understand the sample structure

Do not fine-tune a VLM before you understand the dataset.

---

# 9. Step 3 — Build a unified dataset format

Different datasets will have different schemas.

Create your own normalized internal representation.

For example:

    Sample:
        image
        image_2
        modality
        timestamp
        question
        answer
        caption
        grounding
        mask
        metadata

Not every field must exist for every dataset.

Example single-image VQA sample:

    {
        image: optical_image,
        question: "...",
        answer: "..."
    }

Example grounding sample:

    {
        image: optical_image,
        query: "water body",
        bbox: [...]
    }

Example temporal sample:

    {
        image_t1: ...,
        image_t2: ...,
        question: "...",
        answer: ...
    }

This abstraction makes the rest of the system dataset-independent.

---

# 10. Step 4 — Build the geospatial loader

Implement:

    src/data/geotiff.py

with functions such as:

    load_geotiff()
    read_metadata()
    get_crs()
    get_transform()
    get_bounds()

For each image, capture:

    width
    height
    number_of_bands
    dtype
    CRS
    transform
    bounds

Why?

Because SatQuery is not just ordinary image classification.

The location and geometry of pixels matter.

---

# 11. Step 5 — Build preprocessing

Implement:

    src/preprocessing/

    normalize.py
    resize.py
    tiling.py
    transforms.py

Basic pipeline:

    raw image
       ↓
    read bands
       ↓
    convert to expected representation
       ↓
    normalize
       ↓
    resize/tile if required
       ↓
    tensor
       ↓
    model

For huge satellite scenes:

    large image
       ↓
    tiles
       ↓
    model inference per tile
       ↓
    merge outputs

---

# 12. Step 6 — Learn what a ViT is doing here

Do not build a new ViT.

Understand:

    image
      ↓
    patches
      ↓
    patch embeddings
      ↓
    transformer
      ↓
    visual tokens/features

This matters because a VLM receives visual features rather than "an image in the human sense."

---

# 13. Step 7 — Understand CLIP

CLIP gives you the basic image-text alignment idea:

    image → image embedding
    text  → text embedding

Correct pair:

    similarity(image, text) → high

Incorrect pair:

    similarity(image, text) → low

Study:

- cosine similarity;
- positive/negative pairs;
- temperature;
- contrastive learning;
- InfoNCE/CLIP-style objectives.

You do not need to reproduce CLIP from scratch for SatQuery.

---

# 14. Step 8 — Run a pretrained remote-sensing VLM

Use a remote-sensing VLM candidate such as GeoChat for Phase 1.

Conceptually:

    satellite image
          ↓
    vision encoder
          ↓
    visual representation
          ↓
    adaptor/projector
          ↓
    LLM
          ↓
    text answer

First run inference on a single sample.

Before any fine-tuning, prove:

    Python script
       ↓
    image
       +
    question
       ↓
    model
       ↓
    answer

Only after this works should you wrap it in the application.

---

# 15. Step 9 — Implement VQA

Create:

    src/tasks/vqa.py

Function:

    answer_vqa(image, question)

Input:

    image
    question

Output:

    answer
    confidence (if the model provides a meaningful score; otherwise keep confidence separate)

Test examples:

    "What land-cover types are visible?"
    "Is there water?"
    "Are there buildings?"

This is the mandatory Phase 1 task.

---

# 16. Step 10 — Implement captioning

Create:

    src/tasks/captioning.py

Function:

    generate_caption(image)

Output:

    caption

Example:

    "An urban area containing roads, buildings,
     vegetation and water."

This satisfies the second single-image capability if you choose captioning.

You can choose grounding instead; implementing both is better if time allows.

---

# 17. Step 11 — Implement grounding

Create:

    src/tasks/grounding.py

Function:

    ground(image, query)

Example:

    query = "water body"

Output:

    {
        "bbox": [...],
        "label": "water body"
    }

If the selected model cannot directly provide the required grounding output, add a compatible grounding specialist rather than pretending text-only VQA is grounding.

---

# 18. Step 12 — Create one interface for all specialists

Every specialist should look similar to the rest of the application.

For example:

    TaskResult:
        task
        answer
        spatial_evidence
        confidence
        metadata

Then:

    VQA
       ↓
    TaskResult

    Captioning
       ↓
    TaskResult

    Grounding
       ↓
    TaskResult

Later:

    Change
       ↓
    TaskResult

    Optical-SAR
       ↓
    TaskResult

This is important because the agent should not care about every model's internal implementation.

---

# 19. Step 13 — Create the model registry

Create:

    src/agent/registry.py

Conceptually:

    MODEL_REGISTRY = {
        "vqa": GeoChatVQA,
        "captioning": GeoChatCaptioning,
        "grounding": GroundingModel,
        "change": ChangeModel,
        "optical_sar": OpticalSARModel
    }

The registry answers:

    What tools exist?
    What inputs do they need?
    What outputs do they return?

---

# 20. Step 14 — Build query classification

Start simple.

Input:

    "Where is the water body?"

Output:

    grounding

Input:

    "Describe the image."

Output:

    captioning

Input:

    "What objects are visible?"

Output:

    vqa

Initially use rules or a small classifier.

Later let an LLM handle ambiguous/complex requests.

Do not make the LLM responsible for everything from the beginning.

---

# 21. Step 15 — Introduce the LLM

Now bring in the AI/agent layer.

The LLM's main Phase 1 responsibility is:

    understand query
       ↓
    select tool
       ↓
    produce structured tool call

For example:

    {
        "tool": "grounding",
        "arguments": {
            "query": "water body"
        }
    }

Your Python backend then executes the actual model.

Important:

The LLM is NOT the remote-sensing vision model.

It is controlling the workflow.

---

# 22. Step 16 — Implement tool calling

The execution loop is:

    User query
       ↓
    LLM
       ↓
    tool call
       ↓
    Python executor
       ↓
    specialist model
       ↓
    structured result
       ↓
    LLM
       ↓
    final response

This is the first genuinely agentic part.

---

# 23. Step 17 — Add evidence objects

Do not let every model return arbitrary prose.

Use a common structure:

    Evidence:
        source_model
        task
        claim
        confidence
        bbox
        mask
        metadata

Example:

    {
        "source_model": "GeoChat",
        "task": "grounding",
        "claim": "water body identified",
        "confidence": 0.91,
        "bbox": [...]
    }

This makes later evidence fusion possible.

---

# 24. Step 18 — Add a final answer generator

Now the architecture becomes:

    image + query
          ↓
        agent
          ↓
      specialist
          ↓
       evidence
          ↓
      answer LLM
          ↓
       response

The final LLM should phrase the evidence, not invent unsupported visual facts.

---

# 25. Step 19 — Add execution traces

For every query store:

    selected task
    selected model
    parameters
    output
    confidence
    execution time

Example:

    Query:
    "Where is the water body?"

    Workflow:
    Query classifier
        ↓
    grounding
        ↓
    GeoChat / grounding model
        ↓
    evidence
        ↓
    final answer

This is required for the project's auditable execution concept.

---

# 26. Step 20 — Build Phase 1 API

Create:

    api/main.py
    api/routes.py
    api/schemas.py

Basic endpoint:

    POST /analyze

Request:

    image
    query

Response:

    answer
    evidence
    confidence
    execution_trace

FastAPI sits between the GUI and the ML system.

---

# 27. Step 21 — Build Phase 1 GUI

For the first working prototype use Streamlit.

GUI:

    ┌─────────────────────────────────┐
    │ Upload satellite image          │
    │                                 │
    │ [ image ]                       │
    │                                 │
    │ Question:                       │
    │ [ Where is the water body? ]    │
    │                                 │
    │          [ ANALYZE ]            │
    └─────────────────────────────────┘

Then:

    Answer
    Evidence
    Confidence
    Image with box/mask
    Execution trace

At this point Phase 1 is a real application.

---

# 28. Step 22 — Evaluate Phase 1

Use the prescribed benchmark test splits.

VQA:

    accuracy / task-appropriate metric

Captioning:

    BLEU / ROUGE / METEOR / CIDEr as appropriate

Grounding:

    IoU / grounding-specific metric

Also measure:

    routing accuracy
    tool execution success
    latency
    hallucination/error rate

Do NOT tune on the official test set.

---

# 29. Phase 1 milestone

You are finished with Phase 1 when this works:

    User
      ↓
    uploads one satellite image
      ↓
    asks a natural-language question
      ↓
    SatQuery understands the task
      ↓
    selects a specialist
      ↓
    runs it
      ↓
    obtains evidence
      ↓
    returns answer + visual evidence + trace

---

# 30. Phase 2 — Add temporal reasoning

Now we change the input from:

    image

to:

    image_t1 + image_t2

Example:

    2024 image
    2026 image

Question:

    "What changed?"

---

# 31. Phase 2 Step 1 — Add pair validation

Check:

    same geographic region?
    compatible CRS?
    compatible resolution?
    acquisition dates?
    dimensions?
    registration status?

If not aligned:

    registration
        ↓
    aligned pair

---

# 32. Phase 2 Step 2 — Implement image registration

Create:

    src/preprocessing/registration.py

The objective is:

    T1
      \
       → aligned pair
      /
    T2

Why?

Because:

    spatial misalignment
          ↓
    false change

Registration is therefore part of the ML pipeline, not an optional cosmetic step.

---

# 33. Phase 2 Step 3 — Build a simple change baseline

Before using a sophisticated VLM, implement something understandable.

For example:

    T1
     ↓
    features_1

    T2
     ↓
    features_2

    difference(features_1, features_2)
              ↓
          change map

You can begin with pixel/feature differencing.

The purpose is to understand the actual change-detection problem.

---

# 34. Phase 2 Step 4 — Build a Siamese baseline

Architecture:

    T1 → shared encoder → F1
                          \
                           difference → change head
                          /
    T2 → shared encoder → F2

The shared encoder forces both dates into a comparable feature space.

Then train:

    F1 - F2
       ↓
    change prediction

This gives you a proper ML baseline.

---

# 35. Phase 2 Step 5 — Integrate a change specialist

Use a model such as ChangeChat as a specialist candidate.

Input:

    image_t1
    image_t2
    question

Possible outputs:

    change description
    change answer
    change localization
    change quantification

The agent can call this model when the query requires temporal reasoning.

---

# 36. Phase 2 Step 6 — Add change localization

Return:

    text description
    +
    change mask / region

Example:

    "Built-up expansion occurred in the eastern
     region."

    [highlighted change region]

---

# 37. Phase 2 Step 7 — Add change quantification

If the change mask and geospatial metadata permit it:

    changed pixels
        ↓
    pixel area
        ↓
    total changed area

Example:

    2024 built-up area = 12.4 km²
    2026 built-up area = 15.1 km²

    increase = 2.7 km²

This is where geospatial raster calculations become important.

---

# 38. Phase 2 Step 8 — Add optical + SAR

Now accept:

    optical image
    +
    SAR image

The system should not simply concatenate raw pixels.

First create separate representations:

    Optical
       ↓
    optical encoder
       ↓
    optical features

    SAR
       ↓
    SAR encoder
       ↓
    SAR features

---

# 39. Phase 2 Step 9 — Align optical and SAR

Check:

    CRS
    geographic coverage
    spatial resolution
    pixel grid
    registration

Then:

    optical
       +
    SAR
       ↓
    aligned pair

This is especially important because optical and SAR have different sensing mechanisms.

---

# 40. Phase 2 Step 10 — Build the simplest fusion baseline

Start with late fusion:

    optical features ─┐
                      ├→ concatenate → MLP → prediction
    SAR features ─────┘

This is your baseline.

Do not jump directly into cross-attention before you can show that a simple fusion system works.

---

# 41. Phase 2 Step 11 — Implement cross-attention fusion

Upgrade to:

    optical tokens
          ↕
    cross-attention
          ↕
       SAR tokens

The model learns interactions between the two modalities.

---

# 42. Phase 2 Step 12 — Make fusion query-conditioned

Now include the user's question.

Example:

    Query:
    "Where are water bodies?"

The system can use:

    optical information
    +
    SAR information
    +
    question

to produce a query-specific fused representation.

Conceptually:

    Question
       ↓
    text representation
       ↓
    cross-attention
       ↙       ↘
    Optical    SAR
       ↘       ↙
       fused representation
              ↓
           answer

This is a strong custom ML component for the project.

---

# 43. Phase 2 Step 13 — Build evidence fusion

Now several models can provide evidence.

Example:

    Change model
        → temporal evidence

    Optical model
        → visual evidence

    SAR model
        → structural evidence

    Grounding model
        → spatial evidence

Combine:

    all evidence
         ↓
    evidence engine
         ↓
    supported conclusion

---

# 44. Phase 2 Step 14 — Add disagreement handling

Suppose:

    Optical → strong change evidence
    SAR     → weak change evidence

Do not pretend they agree.

Return:

    Optical evidence: strong
    SAR evidence: moderate
    Agreement: partial
    Overall confidence: moderate/high depending on calibration

This is more trustworthy than blindly averaging scores.

---

# 45. Phase 2 Step 15 — Calibrate confidence

Raw neural-network scores are not automatically trustworthy probabilities.

Use validation data to study:

    temperature scaling
    reliability diagrams
    expected calibration error (ECE)

Then expose a meaningful confidence estimate to the user.

---

# 46. Phase 2 Step 16 — Upgrade the agent to multi-step workflows

Phase 1:

    query
      ↓
    one tool
      ↓
    result

Phase 2:

    query
      ↓
    planner
      ↓
    tool 1
      ↓
    tool 2
      ↓
    tool 3
      ↓
    evidence fusion
      ↓
    answer

Example:

    "Has urban expansion occurred and does SAR support it?"

Agent plan:

    1. Validate temporal pair
    2. Run change analysis
    3. Localize changed region
    4. Identify built-up regions
    5. Analyze SAR
    6. Compare evidence
    7. Generate final answer

That is the full agentic workflow.

---

# 47. Phase 2 Step 17 — Final GUI

The final GUI should support:

    ┌─────────────────────────────────────────┐
    │ Upload                                  │
    │                                         │
    │ [Optical 2024] [Optical 2026] [SAR]   │
    │                                         │
    │ Query                                   │
    │ [ Has urban expansion occurred? ]       │
    │                                         │
    │              [ ANALYZE ]                │
    └─────────────────────────────────────────┘

Output:

    Answer
    ─────────────────────────
    Built-up area increased...

    Change Map
    ─────────────────────────
    [visualized mask]

    Evidence
    ─────────────────────────
    Optical: strong
    SAR: moderate

    Confidence
    ─────────────────────────
    87%

    Execution
    ─────────────────────────
    Change model
       ↓
    Grounding
       ↓
    Optical-SAR fusion
       ↓
    Evidence fusion

---

# 48. Final architecture

The final system looks like:

    ┌────────────────────────────────────────────┐
    │                  USER / GUI                │
    │                                            │
    │ Images + natural-language question        │
    └─────────────────────┬──────────────────────┘
                          ↓
    ┌────────────────────────────────────────────┐
    │              INPUT VALIDATOR                │
    │                                            │
    │ format / modality / CRS / dimensions      │
    │ temporal relationship / registration       │
    └─────────────────────┬──────────────────────┘
                          ↓
    ┌────────────────────────────────────────────┐
    │               PREPROCESSING                 │
    │                                            │
    │ Rasterio / GDAL / normalization / tiling  │
    │ registration / resampling                 │
    └─────────────────────┬──────────────────────┘
                          ↓
    ┌────────────────────────────────────────────┐
    │             QUERY UNDERSTANDING             │
    │                                            │
    │ task / modality / temporal requirements   │
    └─────────────────────┬──────────────────────┘
                          ↓
    ┌────────────────────────────────────────────┐
    │                LLM AGENT                    │
    │                                            │
    │ planning / routing / tool calling          │
    └─────────────────────┬──────────────────────┘
                          ↓
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
       SINGLE          TEMPORAL         OPTICAL-SAR
       IMAGE             CHANGE            FUSION
          │               │                │
          ↓               ↓                ↓
       GeoChat         ChangeChat       Optical encoder
       / VLM                            SAR encoder
          │                                │
     ┌────┼────┐                       cross-attention
     ↓    ↓    ↓                            │
    VQA Caption Grounding              fused features
          │                                │
          └──────────────┬─────────────────┘
                         ↓
                ┌─────────────────┐
                │ EVIDENCE ENGINE │
                │                 │
                │ fusion          │
                │ agreement       │
                │ confidence      │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │   ANSWER LLM    │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │      GUI        │
                │                 │
                │ answer          │
                │ map/mask/box    │
                │ confidence      │
                │ execution trace │
                └─────────────────┘

---

# 49. The complete implementation order

If you are a rookie, follow this exact order.

## Foundation

    1. Python
    2. NumPy
    3. PyTorch
    4. Basic CNN/ViT understanding
    5. Transformers
    6. Attention/cross-attention
    7. LLM basics
    8. Tool calling/structured outputs
    9. Agent basics

## Remote sensing

    10. Optical imagery
    11. Multispectral bands
    12. SAR basics
    13. GeoTIFF
    14. CRS/EPSG
    15. Rasterio/GDAL
    16. Image registration
    17. Tiling/resampling

## VLM

    18. CLIP
    19. Contrastive learning
    20. VLM architecture
    21. VQA
    22. Captioning
    23. Visual grounding
    24. Remote-sensing VLMs
    25. GeoChat inference
    26. Remote-sensing fine-tuning/LoRA

## Phase 1 implementation

    27. BigEarthNet.txt inspection
    28. Dataset normalization
    29. Image loader
    30. Preprocessing
    31. GeoChat inference
    32. VQA
    33. Captioning/grounding
    34. Task classifier
    35. Model registry
    36. LLM tool calling
    37. Agent
    38. Evidence objects
    39. Confidence
    40. FastAPI
    41. Streamlit
    42. Phase 1 evaluation

## Phase 2 implementation

    43. VRSBench/RSVQA evaluation integration
    44. CDVQA integration
    45. Bitemporal preprocessing
    46. Registration
    47. Change baseline
    48. Siamese change model
    49. Change specialist
    50. Change localization
    51. Change quantification
    52. Optical-SAR alignment
    53. Optical encoder
    54. SAR encoder
    55. Late-fusion baseline
    56. Cross-attention
    57. Query-conditioned fusion
    58. Evidence fusion
    59. Confidence calibration
    60. Multi-step agent
    61. Final GUI
    62. Final evaluation
    63. Docker/deployment

---

# 50. What the ML models are actually doing

This is the most important conceptual summary.

## VQA

    image + question
           ↓
        VLM
           ↓
        answer

## Grounding

    image + text
           ↓
      grounding model
           ↓
       box / region

## Captioning

    image
      ↓
     VLM
      ↓
   caption

## Change detection

    image T1 + image T2
             ↓
       change model
             ↓
         change map

## Change VQA

    image T1 + image T2 + question
                    ↓
               change VLM
                    ↓
                 answer

## Optical-SAR

    optical → optical encoder ─┐
                               ├→ fusion → answer
    SAR → SAR encoder ─────────┘

## Agent

    question
       ↓
    LLM
       ↓
    choose tools
       ↓
    execute tools
       ↓
    combine results
       ↓
    final response

---

# 51. The most important distinction

Do not confuse the LLM with the vision models.

### Specialist ML models answer:

    "What is in the image?"
    "Where is it?"
    "What changed?"
    "What does SAR show?"

### The LLM/agent answers:

    "What is the user asking?"
    "Which model should I use?"
    "Do I need more than one model?"
    "What should I do next?"
    "How do I turn the evidence into an answer?"

### The application layer answers:

    "How do I upload images?"
    "How do I display a map?"
    "How do I return the result?"

That separation is the architecture.

---

# 52. Final mental model

SatQuery is essentially:

    REMOTE-SENSING AI MODELS
                +
       MULTIMODAL FUSION
                +
          LLM AGENT
                +
        EVIDENCE SYSTEM
                +
           WEB APP

The two phases are:

    PHASE 1
    One image
       ↓
    VQA / captioning / grounding
       ↓
    Agentic routing
       ↓
    Answer

    PHASE 2
    Two+ images
       ↓
    Temporal change analysis
       +
    Optical-SAR fusion
       ↓
    Multi-step agent
       ↓
    Evidence fusion
       ↓
    Answer

The goal is NOT to create one magical model.

The goal is to create a reliable system in which:

    specialized models do specialized visual work

and:

    the LLM agent decides how those models should be used.

---

# 53. Practical rule while building

At every stage, follow:

    UNDERSTAND
       ↓
    BUILD SIMPLE BASELINE
       ↓
    TEST
       ↓
    USE PRETRAINED SPECIALIST
       ↓
    INTEGRATE
       ↓
    ONLY THEN ADD COMPLEXITY

Do not begin with:

    "Let's build the agent."

Begin with:

    "Can I load one satellite image?"

Then:

    "Can I run a VLM?"

Then:

    "Can I answer one question?"

Then:

    "Can I select the right model?"

Then:

    "Can I compare two images?"

Then:

    "Can I combine optical and SAR?"

Then:

    "Can an agent coordinate everything?"

That is how the project should be built from the ground up.
