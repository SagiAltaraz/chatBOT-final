# Hybrid Product Information Agent

A sophisticated chatbot system that combines RAG (Retrieval Augmented Generation) with advanced tool orchestration. The system can answer product questions using a vector database and execute complex multi-step queries.

## 🏗️ Project Structure

```
packages/
├── client/          # React + Vite frontend
└── server/          # Express + Prisma backend
python-service/     # Flask + ChromaDB RAG service
data/               # Product documentation files
```

## 🚀 Getting Started

### Prerequisites

- **Bun** (package manager & runtime)
- **Python 3.9+**
- **OpenAI API key**

### Quick Start

#### 1. Install Dependencies

```bash
# Install all packages
bun install

# Install Python dependencies
cd python-service
pip install -r requirements.txt
cd ..
```

#### 2. Environment Setup

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-key-here
WEATHER_API_KEY=your-weather-key
DATABASE_URL=your-database-url
```

#### 3. Index Knowledge Base

Before first run, index the product documentation:

```bash
cd python-service
python3 index_kb.py
cd ..
```

#### 4. Run the Services

**Option 1: Using Scripts (Recommended)**

Open 3 separate terminals and run:

```bash
# Terminal 1: Python RAG Service (port 5001)
./start-python.sh

# Terminal 2: TypeScript Backend (port 3000)
./start-server.sh

# Terminal 3: React Client (port 5173)
./start-client.sh
```

**Option 2: Manual**

```bash
# Terminal 1
cd python-service && python3 server.py

# Terminal 2
cd packages/server && bun start

# Terminal 3
cd packages/client && bun run dev
```

## 🔧 Service Commands

### Quick Start Scripts

- `./start-python.sh` - Start Python RAG service (port 5001)
- `./start-server.sh` - Start TypeScript backend (port 3000)
- `./start-client.sh` - Start React client (port 5173)

### Python Service

- `python3 index_kb.py` - Index product knowledge base (run once before first start)
- `python3 server.py` - Start Flask RAG service

### Maintenance

- **UI Clear Button** - Click the 🗑️ "Clear" button in the chat interface to reset conversation
- `./clear-chat.sh` - Clear chat history via script (refresh browser to reset)
- `./clear-chat.sh --clear-kb` - Clear chat AND knowledge base (requires re-indexing)

### Testing

- `./test-all.sh` - Run automated tests for math, RAG, and orchestration queries

## 📋 Features

- **RAG System** - ChromaDB vector database for product knowledge
- **Multi-Tool Orchestration** - Weather, Exchange Rates, Math, Reviews
- **Real-time Chat** - WebSocket support for live messaging
- **Database** - Prisma ORM with PostgreSQL/MariaDB
- **TypeScript** - Full type safety across client and server

## 📡 Key API Endpoints

- `POST /api/chat` - Main chat endpoint
- `POST /api/products/search` - Product information search
- `GET /api/products/health` - Health check
