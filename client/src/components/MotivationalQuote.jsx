import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Lightbulb } from "lucide-react";

const MotivationalQuote = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toISOString().split("T")[0];
      const storedQuoteData = localStorage.getItem("dailyQuote");

      if (storedQuoteData) {
        const { date, quote } = JSON.parse(storedQuoteData);
        if (date === today) {
          setQuote(quote);
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        const response = await api.get("/quote/generate");
        const newQuote = response.data.data;
        setQuote(newQuote);
        localStorage.setItem(
          "dailyQuote",
          JSON.stringify({ date: today, quote: newQuote })
        );
      } catch (error) {
        setQuote({
          text: "The secret of getting ahead is getting started.",
          author: "Mark Twain",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border h-full">
      <Lightbulb className="w-4 h-4 text-chart-2 shrink-0" />
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Finding inspiration...</p>
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="italic text-foreground/80">"{quote.text}"</span>
          <span className="ml-1.5">— {quote.author}</span>
        </p>
      )}
    </div>
  );
};

export default MotivationalQuote;
