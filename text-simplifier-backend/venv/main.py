from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # test için herkese izin, sonra kısıtlanır
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/simplify-text/")
async def simplify_text(payload: dict):
    text = payload.get("text", "")
    simplified_text = "Bu basitleştirilmiş metin: " + text
    return {
        "simplified_text": simplified_text,
        "highlighted_original_text": text
    }
