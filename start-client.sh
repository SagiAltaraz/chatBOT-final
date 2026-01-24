#!/bin/bash

echo "⚛️  Starting React Client..."
cd "$(dirname "$0")/packages/client"
bun run dev
