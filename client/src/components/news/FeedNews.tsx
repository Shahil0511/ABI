import { useState, useEffect } from "react";
import { getAllNews } from "../../services/newsServices";
import AdSidebar from "../advertisement/AdPlaceHolder";
import NewsCard, { type NewsArticle } from "./NewsCard";

const FeedNews = ({
  categoryFilter,
  subcategoryFilter,
}: {
  categoryFilter: string | null;
  subcategoryFilter: string | null;
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchNews();
  }, [filter, categoryFilter, subcategoryFilter]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await getAllNews();

      if (response.success) {
        let filteredNews = response.data;

        // Filter by status
        if (filter !== "all") {
          filteredNews = filteredNews.filter(
            (article: NewsArticle) => article.status === filter
          );
        }

        // Filter by category
        if (categoryFilter) {
          filteredNews = filteredNews.filter(
            (article: NewsArticle) =>
              article.category.toLowerCase() === categoryFilter.toLowerCase()
          );
        }

        // Filter by subcategory
        if (subcategoryFilter) {
          filteredNews = filteredNews.filter(
            (article: NewsArticle) =>
              article.subcategory.toLowerCase() ===
              subcategoryFilter.toLowerCase()
          );
        }

        setNews(filteredNews);
      } else {
        setError(response.message || "Failed to fetch news");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching news");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Here you would typically dispatch an action to like the article
    // For now, just update the local state to reflect the like
    setNews((prevNews) =>
      prevNews.map((article) =>
        article._id === id ? { ...article, likes: article.likes + 1 } : article
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <h3 className="text-destructive text-lg font-medium mb-2">
              Error Loading News
            </h3>
            <p className="text-destructive/80">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto px-4 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">News Feed</h1>

          {/* Filter Tabs */}
          <div className="flex space-x-4 border-b border-border">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 font-medium ${
                filter === "all"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All News
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`px-4 py-2 font-medium ${
                filter === "published"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 font-medium ${
                filter === "draft"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Main Content with Side Ads */}
        <div className="flex gap-8">
          {/* Left Sidebar Ad */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <AdSidebar />
              <div className="mt-4">
                <AdSidebar />
              </div>
            </div>
          </div>

          {/* News Content */}
          <div className="flex-1">
            {/* News Grid */}
            {news.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-6xl mb-4">📰</div>
                <h3 className="text-muted-foreground text-lg font-medium mb-2">
                  {filter === "all"
                    ? "No news articles found"
                    : `No ${filter} articles found`}
                </h3>
                <p className="text-muted-foreground">
                  Check back later for new content
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {news.map((article) => (
                  <NewsCard
                    key={article._id}
                    article={article}
                    onLikeClick={handleLikeClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <AdSidebar />
              <div className="mt-4">
                <AdSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedNews;
