// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/simplify", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text field is required" });
  }

  try {
    const model = "sshleifer/distilbart-cnn-12-6";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          parameters: { max_length: 100, min_length: 40, do_sample: false },
        }),
      }
    );

    const rawData = await response.text();
    console.log("Hugging Face Raw Response:", rawData);

    let data;
    try {
      data = JSON.parse(rawData);
    } catch {
      throw new Error("API response is not valid JSON: " + rawData);
    }

    let simplifiedText = "";
    if (Array.isArray(data) && data[0]?.summary_text) {
      simplifiedText = data[0].summary_text;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      simplifiedText = data[0].generated_text;
    } else if (data.error) {
      throw new Error(`Hugging Face error: ${data.error}`);
    } else {
      simplifiedText = JSON.stringify(data);
    }

    // 🔹 Önemli kelimeleri otomatik çıkarma (basit versiyon)
    const words = simplifiedText
      .split(/\s+/)
      .map(w => w.replace(/[^\p{L}0-9]/gu, "")) // Noktalama temizle
      .filter(w => w.length > 4); // 4 harften kısa kelimeleri alma

    const uniqueWords = [...new Set(words)];
    const sorted = uniqueWords.sort((a, b) => b.length - a.length);
    const topKeywords = sorted.slice(0, 5);

    // Tek seferde cevap dön
    return res.json({
      simplifiedText,
      keywords: topKeywords
    });
  } catch (error) {
    console.error("Detailed Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "Hugging Face API error"
      });
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
