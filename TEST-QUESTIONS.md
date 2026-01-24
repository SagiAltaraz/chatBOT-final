# 🧪 שאלות בדיקה לפרויקט Hybrid Product Information Agent

## 1️⃣ מתמטיקה (calculate)

### שאלות פשוטות:
```
What is 25 + 37?
Calculate 100 - 45
What is 12 * 8?
Divide 144 by 12
4x3
2 x 5
```

### שאלות מורכבות:
```
What is (15 + 25) * 3?
Calculate 2^8
What is the square root of 144?
Calculate 50% of 200
10x10
```

**תוצאה צפויה:** התשובה המספרית הנכונה

---

## 2️⃣ מזג אוויר (getWeather)

```
What's the weather in Tel Aviv?
How is the weather in London today?
Tell me the temperature in New York
What's the weather like in Paris?
```

**תוצאה צפויה:** מידע על מזג האוויר (טמפרטורה, תיאור)

---

## 3️⃣ המרת מטבעות (getExchangeRate)

```
Convert 100 USD to EUR
How much is 50 euros in dollars?
What is 1000 ILS in USD?
Convert 200 GBP to EUR
```

**תוצאה צפויה:** שער החליפין והסכום המומר

---

## 4️⃣ שאלות על מוצרים - RAG (getProductInformation)

### EvoPhone X:
```
What is the battery capacity of the EvoPhone X?
Tell me about the camera of the EvoPhone X
What are the specifications of the EvoPhone X?
Does the EvoPhone X support 5G?
```

### Coffee Maker Y:
```
What is the capacity of the Coffee Maker Y?
Tell me about the Coffee Maker Y features
How does the Coffee Maker Y work?
```

### Electric Car Z:
```
What is the range of the Electric Car Z?
Tell me about the Electric Car Z battery
What are the features of Electric Car Z?
```

### 3D Printer:
```
What materials does the 3D printer support?
What is the build volume of the 3D printer?
Tell me about the 3D printer specifications
```

### Laptop Pro:
```
What processor does the Laptop Pro have?
Tell me about the Laptop Pro specifications
What is the RAM of the Laptop Pro?
```

**תוצאה צפויה:** תשובה מבוססת על המידע מה-knowledge base + מקורות (sources)

---

## 5️⃣ שאלות מורכבות - Orchestration (orchestrate)

### דוגמה 1: מזג אוויר + המרת מטבע
```
What's the weather in London and convert 100 GBP to USD
Tell me the temperature in Paris and how much is 50 EUR in dollars
```

**תוצאה צפויה:** תשובה משולבת עם שני התוצאות

### דוגמה 2: מוצר + חישוב
```
What is the battery of EvoPhone X and calculate 5000 * 2
Tell me about the Coffee Maker Y capacity and what is 1.5 * 1000
```

**תוצאה צפויה:** תשובה משולבת עם מידע על המוצר וחישוב

### דוגמה 3: שלוש פעולות
```
What's the weather in New York, convert 200 USD to EUR, and calculate 50 + 50
```

**תוצאה צפויה:** תשובה משולבת עם כל שלוש התוצאות

---

## 6️⃣ צ'אט רגיל (chat)

```
Hello, how are you?
What can you help me with?
Tell me a joke
Thanks for your help!
```

**תוצאה צפויה:** תשובה צ'אט רגילה

---

## 📊 בדיקת API ישירות (curl)

### בדיקת Python Service:
```bash
curl http://localhost:5001/health
```
**צפוי:**
```json
{
  "status": "healthy",
  "service": "RAG Knowledge Base",
  "indexed_chunks": 16,
  "collection": "product_knowledge_base",
  "model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

### בדיקת Backend:
```bash
curl http://localhost:3000/api/hello
```
**צפוי:**
```json
{
  "message": "Hello from the API!"
}
```

### בדיקת RAG Integration:
```bash
curl http://localhost:3000/api/products/health
```
**צפוי:**
```json
{
  "python_service_healthy": true,
  "knowledge_base_indexed": true,
  "total_chunks": 16
}
```

### שאלה דרך Chat API:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 25 + 37?",
    "conversationId": "test-001"
  }'
```

---

## ✅ רשימת ווידוא (Checklist)

- [ ] Python service רץ על port 5001
- [ ] TypeScript backend רץ על port 3000
- [ ] React client רץ על port 5173
- [ ] מתמטיקה עובדת
- [ ] מזג אוויר עובד
- [ ] המרת מטבע עובדת
- [ ] RAG עובד (5 מוצרים)
- [ ] Orchestration עובד
- [ ] Chat רגיל עובד

---

## 🎯 המלצות לבדיקה

1. **התחל עם שאלות פשוטות** - מתמטיקה, מזג אוויר
2. **עבור ל-RAG** - שאל על כל אחד מ-5 המוצרים
3. **נסה Orchestration** - שאלות משולבות
4. **בדוק edge cases** - שאלות לא ברורות, שאלות על מוצרים שלא קיימים

**בהצלחה בבדיקות!** 🚀
