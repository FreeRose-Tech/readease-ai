import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/simplify", async (req, res) => {
  const { text, lang } = req.body;

  try {
    const prompt = lang === "tr"
      ? `Aşağıdaki metni disleksi ve okuma güçlüğü yaşayanlar için daha kolay anlaşılır ve sade bir şekilde yeniden yaz:\n\n${text}`
      : `Simplify the following text for people with dyslexia and reading difficulties:\n\n${text}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    res.json({ simplifiedText: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
