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
    // Daha anlamlı ve eksiksiz özet için model değişti
    const model = "facebook/bart-large-cnn";

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ //
          inputs: text,
          parameters: { 
            max_length: 200, // Uzun özet
            min_length: 80,  // Çok kısa olmasın
            do_sample: false,
            num_beams: 4     // Daha kaliteli sonuç
          },
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

    return res.json({ simplifiedText });
  } catch (error) {
    console.error("Detailed Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || "Hugging Face API error" });
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
