import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const hour = date.getHours();
  const ampm = hour >= 12 ? 'pm' : 'am';
  const formattedHour = hour % 12 || 12;

  return `${month} ${day}${getOrdinalSuffix(day)}, ${formattedHour}${ampm}`;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

async function getArticles(query: string) {
  try {
    const res = await fetch('https://mrgsvq33oaulttkxjkuuhzgw7q0brdcy.lambda-url.us-east-1.on.aws/', {
      headers: {
        'query': query,
        'news_api_key': process.env.NEWS_API_KEY || ''
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    throw error;
  }
}

export default async function Home({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || '';
  let articles = [];
  let error = null;

  if (query != "") {
    try {
      const data = await getArticles(query);
      const parsedResponse = JSON.parse(data.response);
      articles = (parsedResponse.articles || []).filter(article => 
        article.headline !== "[Removed]" && article.publisher !== "[Removed]"
      );
    } catch (err) {
      error = "Failed to fetch articles. Please try again.";
      console.error("Error fetching articles:", err);
    }
  }

  return (
    <div className="bg-black min-h-screen p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="w-full bg-gray-900 border-gray-800 border-[1px]">
          <CardHeader>
            <CardTitle className="text-xl text-white font-bold">Rust News Aggregator UI</CardTitle>
            <CardDescription className="text-gray-400">
              This UI allows you to search for news articles using the Rust News Aggregator API.
              Enter a query below to get started.
            </CardDescription>
            <CardDescription className="text-gray-400 mt-2">
              API URL: <a href="https://mrgsvq33oaulttkxjkuuhzgw7q0brdcy.lambda-url.us-east-1.on.aws/" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://mrgsvq33oaulttkxjkuuhzgw7q0brdcy.lambda-url.us-east-1.on.aws/</a>
            </CardDescription>
            <CardDescription className="text-gray-400">
              GitHub Repository: <a href="https://github.com/olivercarmont/rust-news-aggregator-api" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://github.com/olivercarmont/rust-news-aggregator-api</a>
            </CardDescription>
          </CardHeader>
        </Card>

        <form className="flex justify-center items-center space-x-2 mb-4">
          <Input 
            type="text" 
            name="query"
            placeholder="Search for a news topic"
            className="h-12 text-base tracking-tight transition-all duration-100 ease-in-out focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0 focus-visible:outline-none bg-black text-white border-gray-700 w-full max-w-md"
          />
          <Button 
            type="submit"
            className="bg-black text-white hover:bg-gray-800 transition-colors h-12 px-4 border border-gray-700"
          >
            Search
          </Button>
        </form>
        
        {query && (
          error ? (
            <div className="text-red-500">{error}</div>
          ) : articles.length === 0 ? (
            <div className="text-gray-300">No articles found. Try a different query.</div>
          ) : (
            articles.map((article, index) => (
              <Card key={index} className="w-full bg-black border-gray-800 border-[1px]">
                <CardHeader>
                  <CardDescription className="text-gray-400 font-medium">
                    <span className="font-bold">{article.publisher}</span> · {formatDate(article.publishedAt)}
                  </CardDescription>
                  <CardTitle className="text-xl text-white font-bold mt-2">{article.headline}</CardTitle>
                </CardHeader>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
}