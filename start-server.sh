#!/bin/bash

echo "🚀 Starting TypeScript Backend..."
cd "$(dirname "$0")/packages/server"
bun start
