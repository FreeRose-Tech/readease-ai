import { useState, useEffect } from "react"; // useEffect'i ekledik
import translations from "./translations";
import "./index.css"; // index.css'i import ettiğinden emin ol

function App() {
  const [inputText, setInputText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [highlightedOriginalText, setHighlightedOriginalText] = useState(""); // Vurgulanmış orijinal metin için state
  const [lang, setLang] = useState("tr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Hata mesajları için state

  const t = translations[lang];

  const handleSimplify = async () => {
    if (!inputText.trim()) {
      setError(t.emptyInputError); // Boş giriş hatası
      return;
    }
    setLoading(true);
    setSimplifiedText("");
    setHighlightedOriginalText(""); // Yeni istekte eski vurguları temizle
    setError(null); // Yeni istekte hataları temizle

    try {
      // Backend API endpoint'ini doğru şekilde ayarla
      // Daha önce konuştuğumuz gibi, backend 8000 portunda çalışıyor
      const response = await fetch("http://localhost:8000/simplify-text/", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "API'den hata yanıtı alındı.");
      }

      const data = await response.json();
      setSimplifiedText(data.simplified_text);
      setHighlightedOriginalText(data.highlighted_original_text); // Vurgulanmış metni al
    } catch (err) {
      setError(t.apiError + ": " + err.message); // Hata mesajını göster
      console.error("API çağrısı sırasında hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Karanlık mod toggle fonksiyonu
  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
  };

  // Uygulama yüklendiğinde karanlık mod tercihini kontrol et
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  }, []); // Sadece bir kere çalıştır

  return (
    // Tailwind sınıflarını kullanarak genel düzeni oluştur
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-dys-bg text-dys-text font-dyslexic">
      <div className="w-full max-w-4xl bg-container-bg p-8 rounded-3xl shadow-xl border border-dys-border">
        {/* Dil ve Tema Seçici */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleDarkMode}
            className="py-2 px-4 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {t.toggleTheme}
          </button>
          <label htmlFor="language" className="sr-only">{t.dilSecici}</label>
          <select
            id="language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-dys-border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-dys-accent bg-container-bg text-dys-text"
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
          className="w-full h-48 p-5 mb-6 rounded-xl border border-dys-border shadow-sm text-lg leading-relaxed text-dys-text bg-container-bg focus:outline-none focus:ring-4 focus:ring-dys-accent transition"
          placeholder={t.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Hata Mesajı */}
        {error && (
          <div className="text-dys-error text-center mb-4 p-3 border border-dys-error rounded-md bg-red-50">
            {error}
          </div>
        )}

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
          <div className="mt-10 bg-container-bg border-l-4 border-dys-accent p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-dys-accent mb-2">
              {t.resultTitle}
            </h2>
            <p
              className="text-lg whitespace-pre-line leading-relaxed text-dys-text"
            >
              {simplifiedText}
            </p>
          </div>
        )}

        {/* Orijinal Metin Vurgulama Kutusu */}
        {highlightedOriginalText && (
          <div className="mt-10 bg-container-bg border-l-4 border-dys-accent p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold text-dys-accent mb-2">
              {t.originalTextTitle}
            </h2>
            <p
              className="text-lg whitespace-pre-line leading-relaxed text-dys-text"
              dangerouslySetInnerHTML={{ __html: highlightedOriginalText }}
            ></p>
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

