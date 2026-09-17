#!/usr/bin/env python3
"""Build and preview AI Pulse without publishing, messaging, or scheduling."""
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib.metadata
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "site" / "public"


def check_dependencies() -> str:
    try:
        version = importlib.metadata.version("Markdown")
    except importlib.metadata.PackageNotFoundError:
        raise RuntimeError("Install dependencies: python3 -m pip install -r requirements.txt")
    if version != "3.10.2":
        raise RuntimeError(f"Expected Markdown 3.10.2, found {version}; install requirements.txt")
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is required to validate JavaScript.")
    print(f"Python {sys.version.split()[0]} / Markdown {version}", flush=True)
    return node


def check_scripts(node: str, directory: Path) -> None:
    for script in sorted(directory.glob("*.js")):
        subprocess.run([node, "--check", str(script)], check=True, cwd=ROOT)


def validate_output(node: str) -> str:
    briefs = sorted((ROOT / "briefs").glob("AI-Daily-????-??-??.md"))
    if not briefs:
        raise RuntimeError("No source briefs found.")
    latest = briefs[-1].stem.removeprefix("AI-Daily-")
    required = ["index.html", "archive.html", "latest.html", "biscuits.html",
                "assets/app.js", "assets/biscuits.js", "assets/styles.css",
                "data/index.json", "data/search.json", "data/biscuits-runtime.json"]
    required += [f"brief/{p.stem.removeprefix('AI-Daily-')}.html" for p in briefs]
    for name in required:
        path = PUBLIC / name
        if not path.is_file() or path.stat().st_size == 0:
            raise RuntimeError(f"Missing or empty generated file: {name}")
    for path in (PUBLIC / "data").glob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))
    redirect = (PUBLIC / "latest.html").read_text(encoding="utf-8")
    if f"brief/{latest}.html" not in redirect:
        raise RuntimeError("Latest page does not point to the newest source brief.")
    for path in PUBLIC.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        if re.search(r'(?:href|src)=[\"\'](?:file:|/Users/|/workspace/)', text):
            raise RuntimeError(f"Machine-specific link in {path.relative_to(PUBLIC)}")
    check_scripts(node, PUBLIC / "assets")
    print(f"VALIDATED: {len(briefs)} briefs; latest={latest}", flush=True)
    return latest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("check", "build", "serve"))
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    node = check_dependencies()
    check_scripts(node, ROOT / "site" / "assets")
    manifest_path = ROOT / "source-manifest.json"
    if manifest_path.is_file():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        print(f"Source status: {manifest['status']}; current box source verified: "
              f"{manifest['current_box_source_verified']}", flush=True)
    else:
        print("Source checkout: local import metadata is not required for building.", flush=True)
    if args.command == "check":
        print("READY for local build. This command does not research, publish, or schedule.")
        return 0
    if args.command == "build":
        subprocess.run([sys.executable, str(ROOT / "site" / "build.py")], check=True, cwd=ROOT)
    latest = validate_output(node)
    if args.command == "serve":
        handler = partial(SimpleHTTPRequestHandler, directory=str(PUBLIC))
        with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
            print(f"Local preview ({latest}): http://127.0.0.1:{args.port}/", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
