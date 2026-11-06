#!/usr/bin/env python3
"""Switch to main, then build the container image from the web/ directory."""

import subprocess
import sys
from pathlib import Path

IMAGE_TAG = "life-web"

# This file lives in web/Container/, so web/ is one level up and the repo root two.
WEB_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = WEB_DIR.parent


def run(*cmd: str, cwd: Path) -> None:
    print(f"$ {' '.join(cmd)}   (in {cwd})")
    subprocess.run(cmd, cwd=cwd, check=True)


def main() -> int:
    # Refuse to build if there are uncommitted changes: the build uses the working
    # tree, so it would not match what is on main.
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    if status.stdout.strip():
        print("Uncommitted changes found. Commit or stash them first:\n")
        print(status.stdout)
        return 1

    run("git", "switch", "main", cwd=REPO_ROOT)
    run("git", "pull", "--ff-only", "origin", "main", cwd=REPO_ROOT)

    # The build context is web/, which is what the Containerfile paths expect.
    run(
        "podman", "build",
        "-f", "Container/Containerfile",
        "-t", IMAGE_TAG,
        ".",
        cwd=WEB_DIR,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except subprocess.CalledProcessError as err:
        sys.exit(err.returncode)
