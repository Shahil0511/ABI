import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/headers/Header";
import Footer from "@/components/headers/Footer";
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ArrowLeft,
  User,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Video,
  GalleryVertical,
  Headphones,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNewsById } from "../services/newsServices";
import AdSidebar from "../components/advertisement/AdPlaceHolder";

const FILE_BASE_URL = "http://localhost:5000/api/news/files";

interface NewsArticle {
  _id: string;
  title: string;
  summary: string;
  content: string;
  contentType: "article" | "video" | "short" | "gallery" | "podcast";
  tags: string[];
  category: string;
  subcategory: string;
  featuredImage?: string;
  videoUrl?: string;
  galleryImages?: string[];
  readTime: number;
  status: "draft" | "published" | "archived";
  author: {
    _id: string;
    name: string;
    bio?: string;
    avatar?: string;
  } | null;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

const SingleNewsPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const response = await getNewsById(id as string);

      if (response.success) {
        setArticle(response.data);
      } else {
        setError(response.message || "Article not found");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching the article");
      console.error("Error fetching article:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    if (article) {
      setIsLiked(!isLiked);
      // Here you would typically make an API call to update likes
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "gallery":
        return GalleryVertical;
      case "podcast":
        return Headphones;
      case "short":
        return FileText;
      default:
        return FileText;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Link
              to="/"
              className="inline-flex items-center text-primary hover:underline mb-6"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to News
            </Link>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <h3 className="text-destructive text-lg font-medium mb-2">
                Error Loading Article
              </h3>
              <p className="text-destructive/80 mb-4">
                {error || "Article not found"}
              </p>
              <Button onClick={fetchArticle}>Try Again</Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const ContentTypeIcon = getContentTypeIcon(article.contentType);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Content with Side Ads */}
          <div className="flex gap-8">
            {/* Left Sidebar Ad */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <AdSidebar
                  imageUrl="/1561096817487.jpg"
                  linkUrl="https://pioneerfilmz.company.site"
                />
                <div className="mt-4">
                  <AdSidebar
                    imageUrl="/logoChawala.webp"
                    linkUrl="https://www.thechawlastandoorijunction.com"
                  />
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="flex-1">
              {/* Back Button */}
              <Link
                to="/"
                className="inline-flex items-center text-primary hover:underline mb-6"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to News
              </Link>

              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ContentTypeIcon
                    size={20}
                    className="text-muted-foreground"
                  />
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {article.contentType}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {article.title}
                </h1>

                <p className="text-xl text-muted-foreground mb-6">
                  {article.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(article.publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    {article.readTime} min read
                  </div>
                  <div className="flex items-center">
                    <Eye size={16} className="mr-2" />
                    {article.views} views
                  </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author Info */}
                {article.author && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-muted rounded-lg">
                    {article.author.avatar ? (
                      <img
                        src={`${FILE_BASE_URL}/${article.author.avatar}`}
                        alt={article.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {article.author.name}
                      </p>
                      {article.author.bio && (
                        <p className="text-sm text-muted-foreground">
                          {article.author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center gap-2"
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                    <span>({article.likes + (isLiked ? 1 : 0)})</span>
                  </Button>

                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={handleBookmark}
                    className="flex items-center gap-2"
                  >
                    <Bookmark
                      size={16}
                      fill={isBookmarked ? "currentColor" : "none"}
                    />
                    <span>{isBookmarked ? "Saved" : "Save"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Featured Media */}
              {article.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={`${FILE_BASE_URL}/${article.featuredImage}`}
                    alt={article.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}

              {article.videoUrl && article.contentType === "video" && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <video
                    src={`${FILE_BASE_URL}/${article.videoUrl}`}
                    controls
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-12">
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Gallery Images */}
              {article.galleryImages && article.galleryImages.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {article.galleryImages.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <img
                          src={`${FILE_BASE_URL}/${image}`}
                          alt={`${article.title} - Image ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="bg-muted p-6 rounded-lg mb-12">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Share this article
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Facebook size={16} />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Twitter size={16} />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon size={16} />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Comments Section - Placeholder */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Comments
                </h2>
                <div className="bg-muted p-6 rounded-lg text-center">
                  <MessageSquare
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">
                    Comments feature coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar Ad */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <AdSidebar
                  imageUrl="/Lafitneess.webp"
                  linkUrl="https://arvlafitnesse.com"
                />
                <div className="mt-4">
                  <AdSidebar
                    imageUrl="/ABStar.webp"
                    linkUrl="https://abstarnews.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SingleNewsPage;
