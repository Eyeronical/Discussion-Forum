#!/bin/sh
# Run this from the directory you want the repo created in (macOS / Linux)
set -e
mkdir learnato-discussion-forum
cd learnato-discussion-forum
git init
cat > README.md <<'README'
# Learnato — Discussion Forum Microservice
README
git add README.md
git commit -m "Initial commit: repo scaffold"
echo "Repository scaffolded. Copy in files or unzip the provided archive."
