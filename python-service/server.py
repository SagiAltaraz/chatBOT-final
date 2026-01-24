#!/usr/bin/env python3
"""
Flask RAG Service
Provides REST API for searching product knowledge base using ChromaDB
"""

import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# Configuration
CHROMA_DB_DIR = "./chroma_db"
COLLECTION_NAME = "product_knowledge_base"
PORT = 5001  # Use 5001 to avoid conflict with AirPlay on macOS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables for model and collection
embedding_model = None
chroma_client = None
collection = None

def initialize_services():
    """Initialize embedding model and ChromaDB connection"""
    global embedding_model, chroma_client, collection

    print("="*60)
    print("INITIALIZING RAG SERVICE")
    print("="*60)

    # Load embedding model
    print("Loading embedding model: sentence-transformers/all-MiniLM-L6-v2...")
    embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("✓ Embedding model loaded")

    # Connect to ChromaDB
    print(f"Connecting to ChromaDB at: {CHROMA_DB_DIR}")
    if not os.path.exists(CHROMA_DB_DIR):
        raise FileNotFoundError(
            f"ChromaDB directory not found: {CHROMA_DB_DIR}\n"
            f"Please run 'python3 index_kb.py' first to create the knowledge base."
        )

    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DB_DIR,
        settings=Settings(anonymized_telemetry=False)
    )

    # Get collection
    try:
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
        doc_count = collection.count()
        print(f"✓ Connected to collection: {COLLECTION_NAME}")
        print(f"  Total indexed chunks: {doc_count}")
    except Exception as e:
        raise Exception(
            f"Could not load collection '{COLLECTION_NAME}': {str(e)}\n"
            f"Please run 'python3 index_kb.py' first to create the knowledge base."
        )

    print("="*60)
    print(f"✓ RAG Service ready on port {PORT}")
    print("="*60)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "RAG Knowledge Base",
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "collection": COLLECTION_NAME,
        "indexed_chunks": collection.count() if collection else 0
    }), 200

@app.route('/index_status', methods=['GET'])
def index_status():
    """Check if knowledge base is indexed and ready"""
    try:
        if not collection:
            return jsonify({
                "indexed": False,
                "message": "Collection not initialized"
            }), 503

        chunk_count = collection.count()

        return jsonify({
            "indexed": chunk_count > 0,
            "collection_name": COLLECTION_NAME,
            "total_chunks": chunk_count,
            "db_path": CHROMA_DB_DIR
        }), 200

    except Exception as e:
        return jsonify({
            "indexed": False,
            "error": str(e)
        }), 500

@app.route('/search_kb', methods=['POST'])
def search_knowledge_base():
    """
    Search the knowledge base for relevant information

    Request body:
    {
        "query": "user question",
        "n_results": 3  # optional, default 3
    }

    Response:
    {
        "query": "user question",
        "chunks": [
            {
                "content": "chunk text",
                "metadata": {
                    "product_name": "Product Name",
                    "filename": "file.txt",
                    "chunk_index": 0,
                    "total_chunks": 5
                },
                "distance": 0.65
            }
        ],
        "retrieval_time_ms": 150
    }
    """
    start_time = time.time()

    try:
        # Validate request
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Request body must be JSON"
            }), 400

        query = data.get('query')
        if not query or not isinstance(query, str) or not query.strip():
            return jsonify({
                "error": "Missing or invalid 'query' field"
            }), 400

        n_results = data.get('n_results', 3)
        if not isinstance(n_results, int) or n_results < 1 or n_results > 10:
            return jsonify({
                "error": "'n_results' must be an integer between 1 and 10"
            }), 400

        # Generate query embedding
        query_embedding = embedding_model.encode([query])[0].tolist()

        # Search in ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        # Format results
        chunks = []
        if results['ids'] and len(results['ids'][0]) > 0:
            for i in range(len(results['ids'][0])):
                chunks.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i]
                })

        retrieval_time_ms = int((time.time() - start_time) * 1000)

        return jsonify({
            "query": query,
            "chunks": chunks,
            "retrieval_time_ms": retrieval_time_ms
        }), 200

    except Exception as e:
        return jsonify({
            "error": f"Search failed: {str(e)}"
        }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "GET /index_status",
            "POST /search_kb"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": str(e)
    }), 500

def main():
    """Main entry point"""
    try:
        initialize_services()

        print(f"\nStarting Flask server on http://localhost:{PORT}")
        print("Available endpoints:")
        print(f"  GET  http://localhost:{PORT}/health")
        print(f"  GET  http://localhost:{PORT}/index_status")
        print(f"  POST http://localhost:{PORT}/search_kb")
        print("\nPress Ctrl+C to stop the server\n")

        app.run(
            host='0.0.0.0',
            port=PORT,
            debug=False  # Set to True for development
        )

    except Exception as e:
        print(f"\n✗ Failed to start server: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
