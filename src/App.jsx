import { useState } from "react";
import translations from "./translations";
import "./styles.css"; // Assuming you have a styles.css for global styles

function App() {
  const [inputText, setInputText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [lang, setLang] = useState("tr");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSimplifiedText("");

    try {
      const response = await fetch("http://localhost:4000/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, lang }),
      });
      const data = await response.json();
      setSimplifiedText(data.simplifiedText);
    } catch (error) {
      setSimplifiedText("Hata oluştu, lütfen tekrar deneyin.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dys-bg text-dys-text font-dyslexic px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
        {/* Dil Seçici */}
        <div className="flex justify-end mb-6">
        <label htmlFor="language" className="sr-only">{t.dilSecici} </label>
          <select
            id="language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-dys-accent"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Başlık */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-dys-accent text-center tracking-tight">
          {t.title}
        </h1>

        {/* Giriş Alanı */}
        <textarea
          aria-label="Girdi metin alanı"
          className="w-full h-48 p-5 mb-6 rounded-xl border border-gray-300 shadow-sm text-lg leading-relaxed focus:outline-none focus:ring-4 focus:ring-dys-accent transition"
          placeholder={t.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ letterSpacing: "0.03em", lineHeight: "1.6" }}
        />

        {/* Buton */}
        <button
          onClick={handleSimplify}
          disabled={loading}
          aria-label="Simplify the text"
          className={`w-full py-4 rounded-xl bg-dys-button text-white text-lg font-medium shadow-md hover:bg-dys-buttonHover transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? lang === "tr"
              ? "Sadeleştiriliyor..."
              : "Simplifying..."
            : t.simplifyBtn}
        </button>

        {/* Sonuç Kutusu */}
        {simplifiedText && (
          <div className="mt-10 bg-white border-l-4 border-dys-accent p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-dys-accent mb-2">
              {t.resultTitle}
            </h2>
            <p
              className="text-lg whitespace-pre-line leading-relaxed text-dys-text"
              style={{ letterSpacing: "0.02em", lineHeight: "1.8" }}
            >
              {simplifiedText}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-500">
        {t.footerText}
      </footer>
    </div>
  );
}

export default App;
