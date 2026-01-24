#!/bin/bash

echo "🧪 Testing Hybrid Product Information Agent"
echo "============================================"
echo ""

API_URL="http://localhost:3000/api/chat"
CONV_ID="test-$(date +%s)"

# Function to test a query
test_query() {
    local query="$1"
    local expected_type="$2"

    echo "📝 Testing: $query"
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"$query\", \"conversationId\": \"$CONV_ID\"}")

    echo "   Response: $(echo $response | jq -r '.message' 2>/dev/null || echo $response | head -c 100)"
    echo ""
}

echo "=== 1️⃣ Math Tests ==="
test_query "4x3" "math"
test_query "What is 12 * 8?" "math"
test_query "Calculate 2^8" "math"
test_query "25 + 37" "math"

echo ""
echo "=== 2️⃣ Product (RAG) Tests ==="
test_query "What is the battery of the EvoPhone X?" "rag"
test_query "Tell me about the BrewMaster Y" "rag"
test_query "What materials does the MakerPro 3D printer support?" "rag"
test_query "What is the RAM of the TechBook Pro?" "rag"

echo ""
echo "=== 3️⃣ Orchestration Tests ==="
test_query "Tell me about the BrewMaster Y capacity and what is 1.5 * 1000" "orchestration"
test_query "What is the battery of EvoPhone X and calculate 5000 * 2" "orchestration"
test_query "What's the weather in London and convert 100 GBP to USD" "orchestration"

echo ""
echo "✅ Testing complete!"
