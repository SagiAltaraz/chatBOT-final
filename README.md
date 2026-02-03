# Hybrid Product Information Agent

צ'אטבוט חכם המשלב **RAG** (Retrieval Augmented Generation) עם **Tool Orchestration** לתזמור מרובה כלים.

**יכולות המערכת:**
- 🔍 חיפוש סמנטי במאגר מוצרים (ChromaDB)
- 🧮 חישובים מתמטיים
- 🌦️ מזג אוויר בזמן אמת
- 💱 המרת מטבעות
- 🎯 שילוב מרובה כלים בשאלה אחת (Orchestration)
- 🌐 **תמיכה בעברית ואנגלית** - עונה בשפה שבה נשאלת השאלה

## 🚀 התקנה מהירה

### דרישות מקדימות

```bash
# Bun (JavaScript runtime)
brew install bun  # macOS
# או: https://bun.sh

# Python 3.9-3.12
python3 --version
```

**צריך API Key:**
- OpenAI API Key (חובה) - [קבל כאן](https://platform.openai.com)
- Weather API Key (אופציונלי) - [קבל כאן](https://openweathermap.org)

### שלבי התקנה

**1. התקן תלויות:**
```bash
bun install
cd python-service && pip install -r requirements.txt && cd ..
```

**2. הגדר `.env` (העתק את הקובץ ושנה את המפתח):**
```bash
cp .env.example .env
nano .env  # שנה את OPENAI_API_KEY
```

**3. בנה את מאגר הידע (חובה - פעם ראשונה):**
```bash
cd python-service
python3 index_kb.py
cd ..
```

יצר 16 chunks מ-5 מוצרים ✓

**4. הרץ את המערכת (3 חלונות טרמינל):**
```bash
# חלון 1
./start-python.sh

# חלון 2
./start-server.sh

# חלון 3
./start-client.sh
```

**5. פתח דפדפן:**
```
http://localhost:5173
```

## 📦 מוצרים במערכת

| מוצר | שם מלא |
|------|--------|
| **EvoPhone X** | סמארטפון (5000mAh, 65W) |
| **BrewMaster Y** | מכונת קפה (2L, 19 bar) |
| **MakerPro 3D** | מדפסת 3D (רב חומרים) |
| **TechBook Pro** | לפטופ (32GB RAM) |
| **EcoVolt Z** | רכב חשמלי (450km) |

## 💬 דוגמאות שימוש

### שאלות על מוצרים:
```
"מה הסוללה של EvoPhone X?"
"ספר לי על BrewMaster Y"
"אילו חומרים MakerPro 3D תומך?"
"כמה RAM יש ל-TechBook Pro?"
```

### חישובים:
```
"4x3"
"מה זה 2^8?"
"חשב 25 + 37"
```

### מזג אוויר והמרות:
```
"מה מזג האוויר בלונדון?"
"המר 100 USD ל-EUR"
```

### שאלות משולבות (אורקסטרציה):
```
"ספר על הקיבולת של BrewMaster Y וחשב 1.5 * 1000"
"מה הסוללה של EvoPhone X וחשב 5000 * 2"
"מה מזג האוויר בפריז והמר 50 EUR ל-USD"
```

## 🧪 הרצת טסטים

```bash
./test-all.sh
```

רץ 11 טסטים:
- 4 טסטי מתמטיקה
- 4 טסטי RAG (חיפוש במוצרים)
- 3 טסטי אורקסטרציה

## 🔧 פתרון בעיות

**Python service לא עולה:**
```bash
cd python-service
rm -rf chroma_db/
python3 index_kb.py
```

**Port תפוס:**
```bash
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**OpenAI API Key לא עובד:**
- בדוק שהקובץ `.env` קיים בתיקייה הראשית
- ודא שהמפתח מתחיל ב-`sk-proj-`

## 📁 מבנה הפרויקט

```
chatBOT-final/
├── packages/
│   ├── client/              # React Frontend (Port 5173)
│   └── server/
│       ├── services/
│       │   ├── intent.service.ts        # Router - זיהוי Intent
│       │   ├── orchestration.service.ts # תזמור מרובה כלים
│       │   ├── rag.service.ts           # חיבור ל-ChromaDB
│       │   ├── weather.service.ts       # API מזג אוויר
│       │   └── exchange.service.ts      # API המרת מטבעות
│       └── prompts/                     # הוראות ל-LLM
├── python-service/          # Flask RAG Service (Port 5001)
│   ├── server.py            # שרת חיפוש וקטורי
│   └── index_kb.py          # בניית מאגר הידע
├── data/products/           # 5 מסמכי מוצרים
└── test-all.sh              # 11 טסטים אוטומטיים
```

## 🔧 איך המערכת עובדת

```
שאלת משתמש
     │
     ▼
┌─────────────────────────────────────────┐
│            Router (GPT-4o-mini)          │
│         זיהוי Intent + פרמטרים          │
└─────────────────────────────────────────┘
     │
     ├── Intent בודד ──► כלי ספציפי (Weather/Math/RAG)
     │
     └── Orchestrate ──► תוכנית מרובת שלבים
                              │
                        ┌─────┴─────┐
                        ▼           ▼
                     שלב 1      שלב 2 ...
                        │           │
                        └─────┬─────┘
                              ▼
                        סינתוז תשובה אחידה
```

**Intents זמינים:**
- `getProductInformation` - חיפוש RAG במאגר המוצרים
- `calculateMath` - חישובים מתמטיים
- `getWeather` - מזג אוויר
- `getExchangeRate` - המרת מטבעות
- `orchestrate` - שילוב מרובה כלים
- `chat` - שיחה כללית

## 🛠️ טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Express + Bun Runtime |
| **LLM** | OpenAI GPT-4o-mini |
| **Vector DB** | ChromaDB |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 |
| **RAG Service** | Python + Flask |

---

**המערכת מוכנה לעבודה! 🚀**
