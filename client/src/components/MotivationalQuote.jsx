import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        console.error("Failed to fetch daily quote:", error);

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
    <Card className="bg-white dark:bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <Lightbulb className="w-5 h-5 mr-3 text-yellow-400" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Fetching inspiration...
          </p>
        ) : (
          <div>
            <p className="italic text-gray-800 dark:text-gray-200">
              "{quote.text}"
            </p>
            <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
              - {quote.author}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MotivationalQuote;
