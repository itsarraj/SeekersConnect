#!/usr/bin/env python3
"""
Test "Resume-Job Matcher LoRA" (PEFT LoRA adapter) on top of BAAI/bge-large-en-v1.5.

References:
- https://huggingface.co/shashu2325/resume-job-matcher-lora
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass


@dataclass(frozen=True)
class ModelSpec:
    base: str = "BAAI/bge-large-en-v1.5"
    adapter: str = "shashu2325/resume-job-matcher-lora"


def _masked_mean_pool(last_hidden_state, attention_mask):
    # last_hidden_state: (B, T, H)
    # attention_mask: (B, T)
    import torch

    mask = attention_mask.unsqueeze(-1).to(last_hidden_state.dtype)  # (B,T,1)
    summed = (last_hidden_state * mask).sum(dim=1)  # (B,H)
    denom = mask.sum(dim=1).clamp(min=1.0)  # (B,1)
    return summed / denom


def embed_texts(model, tokenizer, texts: list[str], max_length: int = 512, device: str | None = None):
    import torch
    import torch.nn.functional as F

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    enc = tokenizer(
        texts,
        return_tensors="pt",
        max_length=max_length,
        padding=True,
        truncation=True,
    )
    enc = {k: v.to(device) for k, v in enc.items()}

    model = model.to(device)
    model.eval()

    with torch.no_grad():
        out = model(**enc)
        emb = _masked_mean_pool(out.last_hidden_state, enc["attention_mask"])
        emb = F.normalize(emb, p=2, dim=1)
    return emb


def cosine_sim(a, b) -> float:
    # a,b: (1,H) tensors
    return float((a * b).sum(dim=1).item())


def sigmoid(x: float) -> float:
    # stable sigmoid
    if x >= 0:
        z = math.exp(-x)
        return 1.0 / (1.0 + z)
    z = math.exp(x)
    return z / (1.0 + z)


def read_text_arg(value: str) -> str:
    # Allows: raw string OR "@path/to/file.txt"
    if value.startswith("@"):
        path = value[1:]
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return value


def main() -> int:
    p = argparse.ArgumentParser(description="Test Resume-Job Matcher LoRA similarity.")
    p.add_argument(
        "--resume",
        required=False,
        default="Software engineer with Python experience",
        help='Resume text, or "@file.txt"',
    )
    p.add_argument(
        "--job",
        required=False,
        default="Looking for Python developer",
        help='Job description text, or "@file.txt"',
    )
    p.add_argument("--max-length", type=int, default=512)
    p.add_argument("--device", default=None, help='e.g. "cpu" or "cuda" (auto if omitted)')
    p.add_argument("--adapter", default=ModelSpec.adapter, help="HF adapter repo id")
    p.add_argument("--base", default=ModelSpec.base, help="HF base model repo id")
    args = p.parse_args()

    resume_text = read_text_arg(args.resume).strip()
    job_text = read_text_arg(args.job).strip()

    if not resume_text or not job_text:
        raise SystemExit("Both resume and job text must be non-empty.")

    from transformers import AutoModel, AutoTokenizer
    from peft import PeftModel

    print(f"Loading base model: {args.base}")
    base_model = AutoModel.from_pretrained(args.base)
    print(f"Loading LoRA adapter: {args.adapter}")
    model = PeftModel.from_pretrained(base_model, args.adapter)
    tokenizer = AutoTokenizer.from_pretrained(args.base)

    resume_emb = embed_texts(model, tokenizer, [resume_text], max_length=args.max_length, device=args.device)
    job_emb = embed_texts(model, tokenizer, [job_text], max_length=args.max_length, device=args.device)

    sim = cosine_sim(resume_emb, job_emb)  # cosine in [-1,1]
    score = sigmoid(sim)  # matches HF snippet pattern (not calibrated)

    print("\n=== Result ===")
    print(f"cosine_similarity: {sim:.6f}")
    print(f"sigmoid_score:     {score:.6f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

