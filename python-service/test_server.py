#!/usr/bin/env python3
"""
Quick test script for RAG service
Tests all endpoints to verify service is working
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001"

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_health():
    """Test /health endpoint"""
    print_header("Testing /health endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_index_status():
    """Test /index_status endpoint"""
    print_header("Testing /index_status endpoint")
    try:
        response = requests.get(f"{BASE_URL}/index_status", timeout=5)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(json.dumps(data, indent=2))

        if data.get("indexed"):
            print(f"\n✓ Knowledge base is indexed with {data.get('total_chunks')} chunks")
            return True
        else:
            print("\n✗ Knowledge base is NOT indexed")
            print("Run: python3 index_kb.py")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_search():
    """Test /search_kb endpoint"""
    print_header("Testing /search_kb endpoint")

    test_query = {
        "query": "EvoPhone X battery specifications",
        "n_results": 3
    }

    print(f"Query: {test_query['query']}")

    try:
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/search_kb",
            json=test_query,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        elapsed = (time.time() - start_time) * 1000

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"\nRetrieved {len(data['chunks'])} chunks in {data['retrieval_time_ms']}ms")
            print(f"Total time: {elapsed:.0f}ms")

            for i, chunk in enumerate(data['chunks']):
                print(f"\n--- Chunk {i+1} ---")
                print(f"Product: {chunk['metadata']['product_name']}")
                print(f"Distance: {chunk['distance']:.4f}")
                print(f"Content: {chunk['content'][:200]}...")

            return len(data['chunks']) > 0
        else:
            print(f"✗ Error: {response.text}")
            return False

    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print_header("RAG SERVICE TEST SUITE")
    print("Testing Python RAG service at:", BASE_URL)

    results = []

    # Test 1: Health check
    results.append(("Health Check", test_health()))
    time.sleep(0.5)

    # Test 2: Index status
    results.append(("Index Status", test_index_status()))
    time.sleep(0.5)

    # Test 3: Search
    results.append(("Search KB", test_search()))

    # Summary
    print_header("TEST RESULTS")
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")

    all_passed = all(passed for _, passed in results)

    if all_passed:
        print("\n✓ All tests passed! RAG service is working correctly.")
        return 0
    else:
        print("\n✗ Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    exit(main())
