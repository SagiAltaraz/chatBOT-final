#!/bin/bash

echo "🐍 Starting Python RAG Service..."
cd "$(dirname "$0")/python-service"
python3 server.py
