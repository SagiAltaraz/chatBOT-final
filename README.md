# Hybrid Product Information Agent

צ'אטבוט חכם המשלב RAG (חיפוש סמנטי במסמכים) עם כלי עבודה נוספים - מתמטיקה, מזג אוויר, המרת מטבעות.

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
│   ├── client/          # React frontend (Port 5173)
│   └── server/          # Express backend (Port 3000)
├── python-service/      # Flask RAG service (Port 5001)
├── data/products/       # 5 מסמכי מוצרים
├── start-*.sh           # סקריפטי הפעלה
└── test-all.sh          # טסטים אוטומטיים
```

## 🛠️ טכנולוגיות

- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + Bun + OpenAI
- **RAG:** Python + Flask + ChromaDB + Sentence Transformers

---

**זהו! המערכת מוכנה לעבודה 🚀**

בעיות? בדוק את קטע "פתרון בעיות" למעלה.
