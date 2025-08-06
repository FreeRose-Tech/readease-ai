import { useState, useEffect } from "react";
import translations from "./translations";
import "./index.css";

function App() {
  const [inputText, setInputText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [highlightedOriginalText, setHighlightedOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations["en"]; // İngilizce çeviri kullanılıyor

  const highlightKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    // RegExp oluştur
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    return text.replace(regex, (match) => `<mark class="bg-yellow-200">${match}</mark>`);
  };

  const handleSimplify = async (textParam) => {
    const textToSimplify = textParam ?? inputText;

    if (!textToSimplify.trim()) {
      setError(t.emptyInputError);
      setSimplifiedText("");
      setHighlightedOriginalText("");
      return;
    }

    setLoading(true);
    setSimplifiedText("");
    setHighlightedOriginalText("");
    setError(null);

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSimplify }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "API error received.");
      }

      const data = await response.json();
      setSimplifiedText(data.simplifiedText);

      // Gelen keywords ile highlight yap
      const highlighted = highlightKeywords(textToSimplify, data.keywords);
      setHighlightedOriginalText(highlighted);

    } catch (err) {
      setError(t.apiError + ": " + err.message);
      console.error("API call error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  };

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-dys-bg text-dys-text font-dyslexic">
      <div className="w-full max-w-4xl bg-container-bg p-8 rounded-3xl shadow-xl border border-dys-border">
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleDarkMode}
            className="py-2 px-4 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {t.toggleTheme}
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-dys-accent text-center tracking-tight">
          {t.title}
        </h1>

        <textarea
          aria-label="Input text area"
          className="w-full h-48 p-5 mb-6 rounded-xl border border-dys-border shadow-sm text-lg leading-relaxed text-dys-text bg-container-bg focus:outline-none focus:ring-4 focus:ring-dys-accent transition"
          placeholder={t.placeholder}
          value={inputText}
          onChange={handleInputChange}
        />

        {error && (
          <div className="text-dys-error text-center mb-4 p-3 border border-dys-error rounded-md bg-red-50">
            {error}
          </div>
        )}

        <button
          onClick={() => handleSimplify()}
          disabled={loading}
          aria-label="Simplify the text"
          className={`w-full py-4 rounded-xl bg-dys-button text-white text-lg font-medium shadow-md hover:bg-dys-buttonHover transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Simplifying..." : t.simplifyBtn}
        </button>

        {highlightedOriginalText && (
          <div className="mt-10 bg-container-bg border-l-4 border-yellow-400 p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              Original Text with Highlights
            </h2>
            <p
              className="text-lg whitespace-pre-line leading-relaxed text-dys-text"
              dangerouslySetInnerHTML={{ __html: highlightedOriginalText }}
            ></p>
          </div>
        )}

        {simplifiedText && (
          <div className="mt-10 bg-container-bg border-l-4 border-dys-accent p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-dys-accent mb-2">
              {t.resultTitle}
            </h2>
            <p className="text-lg whitespace-pre-line leading-relaxed text-dys-text">
              {simplifiedText}
            </p>
          </div>
        )}
      </div>

      <footer className="mt-10 text-sm text-gray-500">{t.footerText}</footer>
    </div>
  );
}

export default App;
