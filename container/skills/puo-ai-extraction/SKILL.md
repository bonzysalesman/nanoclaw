---
name: puo-ai-extraction
description: Automated historical dictionary OCR and extraction for Sesotho-English sources. Use for processing historical PDFs (Mabille, Casalis, Paroz) into structured JSON lexicon entries.
---

# PUO-AI Extraction Skill

Automates extraction of historical Sesotho dictionary entries from PDF sources into `lexicon.json`.

## Project Root

All scripts and data live under:
```
/workspace/project/knowledge-work-plugins/linguistics/PUO-AI/
```

Referred to as `$PUO` below.

## Workflow

1. **Split PDF** — convert PDF pages into high-quality left/right column images
2. **Vision Extraction** — parse column images using a Vision-LLM
3. **Stage Data** — normalize raw vision JSON into the `lexicon.json` schema

## Quick Start

```bash
PUO=/workspace/project/knowledge-work-plugins/linguistics/PUO-AI

# 1. Split pages (adjust --start-page / --end-page per batch)
python3 $PUO/pipeline/ocr/ocr_split_pages_refined.py \
  --pdf $PUO/sources/pdfs/TARGET.pdf \
  --output-dir $PUO/historical/output/images \
  --start-page 20 --end-page 25

# 2. Vision extraction (runs vision model against column images)
python3 $PUO/pipeline/ocr/vision_model_extractor.py \
  --img-dir $PUO/historical/output/images \
  --out-file $PUO/historical/output/raw.json

# 3. Stage into lexicon schema
python3 $PUO/pipeline/staging/stage_mabille.py \
  $PUO/historical/output/raw.json
```

## Available Staging Scripts

Use the appropriate staging script for the source:

| Source | Script |
|---|---|
| Mabille (generic) | `pipeline/staging/stage_mabille.py` |
| Mabille Batch 3–7 | `pipeline/staging/stage_mabille_batch_{3-7}.py` |
| Casalis | `pipeline/staging/stage_a_entries.py` / `stage_f_entries.py` |
| Paroz | `pipeline/staging/stage_paroz.py` |
| Jacottet | `pipeline/staging/stage_jacottet.py` |

## Validate After Injection

```bash
cd $PUO && make validate-all
```

## Current State

- Mabille extraction in progress — last completed: Batch 6 (through "Butsoèla")
- Lexicon: ~5,948 entries as of 2026-05-13
- Next: Mabille Batch 7+
