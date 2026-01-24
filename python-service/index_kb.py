#!/usr/bin/env python3
"""
Knowledge Base Indexing Script
Loads product documentation files and indexes them into ChromaDB
"""

import os
import time
from pathlib import Path
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# Configuration
PRODUCTS_DIR = "../data/products"
CHROMA_DB_DIR = "./chroma_db"
CHUNK_SIZE = 300  # words per chunk
CHUNK_OVERLAP = 50  # words overlap between chunks
COLLECTION_NAME = "product_knowledge_base"

def load_embedding_model():
    """Load the sentence transformer model for embeddings"""
    print("Loading embedding model: sentence-transformers/all-MiniLM-L6-v2...")
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("✓ Model loaded successfully")
    return model

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """
    Split text into overlapping chunks based on word count

    Args:
        text: The text to chunk
        chunk_size: Number of words per chunk
        overlap: Number of overlapping words between chunks

    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []

    if len(words) <= chunk_size:
        return [text]

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        start += (chunk_size - overlap)

        # Prevent infinite loop
        if start >= len(words):
            break

    return chunks

def load_product_documents():
    """
    Load all product documentation files from the data/products directory

    Returns:
        List of dictionaries with 'filename', 'content', and 'product_name'
    """
    products_path = Path(PRODUCTS_DIR)

    if not products_path.exists():
        raise FileNotFoundError(f"Products directory not found: {PRODUCTS_DIR}")

    documents = []
    txt_files = list(products_path.glob("*.txt"))

    if not txt_files:
        raise FileNotFoundError(f"No .txt files found in {PRODUCTS_DIR}")

    print(f"\nFound {len(txt_files)} product files:")

    for file_path in txt_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract product name from filename
        product_name = file_path.stem.replace('-', ' ').title()

        documents.append({
            'filename': file_path.name,
            'content': content,
            'product_name': product_name
        })

        word_count = len(content.split())
        print(f"  - {file_path.name}: {word_count} words")

    return documents

def index_documents(documents, model):
    """
    Index documents into ChromaDB with embeddings

    Args:
        documents: List of document dictionaries
        model: SentenceTransformer model for generating embeddings
    """
    print(f"\nInitializing ChromaDB at: {CHROMA_DB_DIR}")

    # Create ChromaDB client
    client = chromadb.PersistentClient(
        path=CHROMA_DB_DIR,
        settings=Settings(anonymized_telemetry=False)
    )

    # Delete existing collection if it exists
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print(f"✓ Deleted existing collection: {COLLECTION_NAME}")
    except:
        pass

    # Create new collection
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "Product documentation knowledge base"}
    )
    print(f"✓ Created collection: {COLLECTION_NAME}")

    # Process each document
    total_chunks = 0
    chunk_id = 0

    print("\nChunking and indexing documents...")
    start_time = time.time()

    for doc in documents:
        print(f"\n  Processing: {doc['filename']}")

        # Split into chunks
        chunks = chunk_text(doc['content'])
        print(f"    Created {len(chunks)} chunks")

        # Generate embeddings for all chunks
        print(f"    Generating embeddings...")
        embeddings = model.encode(chunks, show_progress_bar=False).tolist()

        # Prepare data for insertion
        ids = []
        metadatas = []

        for i, chunk in enumerate(chunks):
            ids.append(f"chunk_{chunk_id}")
            metadatas.append({
                "product_name": doc['product_name'],
                "filename": doc['filename'],
                "chunk_index": i,
                "total_chunks": len(chunks)
            })
            chunk_id += 1

        # Add to collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        print(f"    ✓ Indexed {len(chunks)} chunks")
        total_chunks += len(chunks)

    elapsed_time = time.time() - start_time

    # Print summary
    print("\n" + "="*60)
    print("INDEXING COMPLETE")
    print("="*60)
    print(f"Total documents processed: {len(documents)}")
    print(f"Total chunks created: {total_chunks}")
    print(f"Average chunks per document: {total_chunks / len(documents):.1f}")
    print(f"Embedding model: sentence-transformers/all-MiniLM-L6-v2")
    print(f"Chunk size: {CHUNK_SIZE} words")
    print(f"Chunk overlap: {CHUNK_OVERLAP} words")
    print(f"Time taken: {elapsed_time:.2f} seconds")
    print(f"ChromaDB location: {CHROMA_DB_DIR}")
    print("="*60)

def main():
    """Main execution function"""
    print("="*60)
    print("KNOWLEDGE BASE INDEXING")
    print("="*60)

    try:
        # Load embedding model
        model = load_embedding_model()

        # Load product documents
        documents = load_product_documents()

        # Index documents
        index_documents(documents, model)

        print("\n✓ Knowledge base ready for use!")
        print(f"  Start the Flask server: python3 server.py")

    except Exception as e:
        print(f"\n✗ Error during indexing: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
