#!/usr/bin/env python3
"""
Script to copy remaining frontend and backend files to new structure
"""
import os
import shutil
from pathlib import Path

# Define source and destination paths
ROOT = Path(__file__).parent
FRONTEND_SRC = ROOT / "src" / "front"
FRONTEND_DEST = ROOT / "frontend" / "src"
BACKEND_SRC = ROOT / "src"
BACKEND_DEST = ROOT / "backend" / "src"

def copy_tree(src, dst, exclude=None):
    """Copy directory tree, excluding specified patterns"""
    exclude = exclude or []
    for root, dirs, files in os.walk(src):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not any(e in d for e in exclude)]
        
        # Calculate relative path and destination
        rel_path = os.path.relpath(root, src)
        dst_dir = os.path.join(dst, rel_path)
        os.makedirs(dst_dir, exist_ok=True)
        
        # Copy files
        for file in files:
            if not any(e in file for e in exclude):
                src_file = os.path.join(root, file)
                dst_file = os.path.join(dst_dir, file)
                shutil.copy2(src_file, dst_file)
                print(f"Copied: {src_file} -> {dst_file}")

def main():
    print("Copying frontend files...")
    # Copy remaining frontend files (components, pages, assets)
    if FRONTEND_SRC.exists():
        components_src = FRONTEND_SRC / "components"
        pages_src = FRONTEND_SRC / "pages"
        assets_src = FRONTEND_SRC / "assets"
        
        if components_src.exists():
            copy_tree(components_src, FRONTEND_DEST / "components")
        
        if pages_src.exists():
            copy_tree(pages_src, FRONTEND_DEST / "pages")
        
        if assets_src.exists():
            copy_tree(assets_src, FRONTEND_DEST / "assets")
    
    print("\nCopying backend files...")
    # Copy backend files
    if BACKEND_SRC.exists():
        api_src = BACKEND_SRC / "api"
        if api_src.exists():
            copy_tree(api_src, BACKEND_DEST / "api")
        
        # Copy app.py and wsgi.py
        for file in ["app.py", "wsgi.py"]:
            src_file = BACKEND_SRC / file
            if src_file.exists():
                shutil.copy2(src_file, BACKEND_DEST / file)
                print(f"Copied: {src_file} -> {BACKEND_DEST / file}")
    
    print("\nMigration complete!")

if __name__ == "__main__":
    main()
