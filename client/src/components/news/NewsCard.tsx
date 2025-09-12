const FILE_BASE_URL = "http://localhost:5000/api/news/files";

import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Video,
  FileText,
  GalleryVertical,
  Headphones,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface NewsArticle {
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
    $oid: string;
  } | null;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface NewsCardProps {
  article: NewsArticle;
  onLikeClick?: (id: string, e: React.MouseEvent) => void;
}

const NewsCard = ({ article, onLikeClick }: NewsCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "gallery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "podcast":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "short":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleCardClick = (id: string, e: React.MouseEvent) => {
    // Prevent navigation if the click was on the like button
    if ((e.target as HTMLElement).closest(".like-button")) {
      return;
    }
    navigate(`/news/${id}`);
  };

  const handleLikeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeClick) {
      onLikeClick(id, e);
    } else {
      // Default behavior if no handler is provided
      navigate(`/news/${id}`);
    }
  };

  const ContentTypeIcon = getContentTypeIcon(article.contentType);

  return (
    <div
      className=" bg-card rounded-lg border shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
      onClick={(e) => handleCardClick(article._id, e)}
    >
      {/* Featured Media */}
      <div className="h-48 overflow-hidden flex items-center justify-center bg-muted">
        {(article.contentType === "video" ||
          article.contentType === "podcast") &&
        article.videoUrl ? (
          <video
            src={`${FILE_BASE_URL}/${article.videoUrl}`}
            controls
            className="w-full h-full object-cover"
          />
        ) : article.featuredImage ? (
          <img
            src={`${FILE_BASE_URL}/${article.featuredImage}`}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : article.galleryImages && article.galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            {article.galleryImages.slice(0, 4).map((imgId, i) => (
              <img
                key={i}
                src={`${FILE_BASE_URL}/${imgId}`}
                alt={`gallery-${i}`}
                className="w-full h-24 object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No media available
          </div>
        )}
      </div>

      {/* Content Type Badge */}
      <div className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getContentTypeColor(
            article.contentType
          )}`}
        >
          <ContentTypeIcon size={14} className="mr-1" />
          {article.contentType}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 pt-0 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
          {article.summary}
        </p>

        {/* Category and Tags */}
        <div className="mb-4">
          <span className="text-sm font-medium text-card-foreground">
            {article.category} • {article.subcategory}
          </span>
          <div className="flex flex-wrap gap-1 mt-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats and Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDate(article.publishedAt)}
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {article.readTime} min
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye size={14} className="mr-1" />
              {article.views}
            </div>
            <button
              className="flex items-center like-button"
              onClick={(e) => handleLikeClick(article._id, e)}
            >
              <Heart size={14} className="mr-1" />
              {article.likes}
            </button>
          </div>
        </div>

        {/* Author and Status */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center">
            <User size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">
              {article.author ? "Author" : "Unknown"}
            </span>
          </div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              article.status
            )}`}
          >
            {article.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
