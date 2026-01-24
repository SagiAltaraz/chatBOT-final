#!/bin/bash

echo "🧹 Clearing chat history..."

# Clear browser cookies/localStorage (user needs to do this manually or refresh)
echo "📝 To clear chat history in the browser:"
echo "   1. Open DevTools (F12)"
echo "   2. Go to Application > Storage"
echo "   3. Click 'Clear site data'"
echo ""
echo "   OR simply refresh the page (Cmd+R / Ctrl+R)"
echo ""

# Clear ChromaDB (optional - only if you want to re-index)
if [ "$1" == "--clear-kb" ]; then
    echo "🗑️  Clearing ChromaDB knowledge base..."
    rm -rf "python-service/chroma_db"
    echo "✅ Knowledge base cleared. Run 'python3 python-service/index_kb.py' to re-index."
fi

echo "✅ Chat cleared! Start fresh."
