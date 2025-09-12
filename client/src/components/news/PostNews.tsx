import { useState } from "react";
import { createNews, type NewsForm } from "../../services/newsServices";
import {
  AlertCircle,
  Video,
  FileText,
  GalleryVertical,
  Headphones,
  X,
  Plus,
  Save,
  Send,
  Image,
} from "lucide-react";

type NewsFormErrors = Partial<Record<keyof NewsForm | "submit", string>>;
type FormField = keyof Omit<NewsForm, "tags" | "currentTag" | "galleryImages">;

const PostNews = () => {
  const [form, setForm] = useState<NewsForm>({
    title: "",
    summary: "",
    content: "",
    contentType: "article",
    tags: [],
    category: "",
    subcategory: "",
    featuredImage: null,
    videoUrl: null,
    galleryImages: [],
    readTime: 5,
    status: "draft",
    currentTag: "",
  });

  const [errors, setErrors] = useState<NewsFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof NewsForm, boolean>>
  >({});
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([]);

  const contentTypes = [
    { value: "article", label: "Article", icon: FileText },
    { value: "video", label: "Video", icon: Video },
    { value: "short", label: "Short", icon: FileText },
    { value: "gallery", label: "Gallery", icon: GalleryVertical },
    { value: "podcast", label: "Podcast", icon: Headphones },
  ];

  const categories = [
    "National",
    "Entertainment",
    "Business",
    "Sports",
    "Health",
    "World",
    "Tech",
    "Videos",
  ];

  const subcategories: Record<string, string[]> = {
    National: ["India", "Politics", "Weather", "Local"],
    Entertainment: ["Movies", "TV Shows", "Music", "Celebrities"],
    Business: ["Markets", "Startups", "Economy", "Crypto"],
    Sports: ["Cricket", "Football", "Tennis", "Olympics"],
    Health: ["Fitness", "Mental Health", "Nutrition", "COVID-19"],
    World: ["Asia", "Europe", "US", "Africa"],
    Tech: ["AI", "Apps", "Gadgets", "Startups"],
    Videos: ["Interviews", "Shorts", "News Clips", "Trending"],
  };

  // File validation helper
  const validateFile = (file: File, type: "image" | "video"): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      return "Please select a valid video file";
    }

    return null;
  };

  const handleFileUpload = async (
    file: File,
    type: "featured" | "video" | "gallery",
    index?: number
  ) => {
    const fileType = type === "video" ? "video" : "image";
    const validationError = validateFile(file, fileType);

    if (validationError) {
      setErrors((prev) => ({ ...prev, [type]: validationError }));
      return;
    }

    if (type === "featured") {
      setForm((prev) => ({ ...prev, featuredImage: file }));
      setFeaturedImagePreview(URL.createObjectURL(file));
    } else if (type === "video") {
      setForm((prev) => ({ ...prev, videoUrl: file }));
      setVideoPreview(URL.createObjectURL(file));
    } else if (type === "gallery" && typeof index === "number") {
      const newGallery = [...(form.galleryImages || [])];
      newGallery[index] = file;
      setForm((prev) => ({ ...prev, galleryImages: newGallery }));

      const newPreviews = [...galleryPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setGalleryPreviews(newPreviews);
    }

    // Clear any previous errors
    if (errors) {
      setErrors((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof NewsForm, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!form.summary.trim()) {
      newErrors.summary = "Summary is required";
    } else if (form.summary.length < 10) {
      newErrors.summary = "Summary must be at least 10 characters";
    }

    if (!form.content.trim()) {
      newErrors.content = "Content is required";
    } else if (form.content.length < 50) {
      newErrors.content = "Content must be at least 50 characters";
    }

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.subcategory) {
      newErrors.subcategory = "Subcategory is required";
    }

    if (form.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (
      (form.contentType === "video" || form.contentType === "podcast") &&
      !form.videoUrl
    ) {
      newErrors.videoUrl =
        "Video file is required for video and podcast content";
    }

    if (form.contentType === "gallery" && form.galleryImages?.length === 0) {
      newErrors.galleryImages =
        "At least one image is required for gallery content";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: FormField, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleTagAdd = () => {
    if (form.currentTag.trim() && !form.tags.includes(form.currentTag)) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: "",
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleGalleryImageRemove = (index: number) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || [],
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setTouched({
      title: true,
      summary: true,
      content: true,
      category: true,
      subcategory: true,
      tags: true,
    });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newsData: NewsForm = {
        ...form,
        status: isDraft ? "draft" : "published",
      };

      const response = await createNews(newsData);
      console.log("✅ News created successfully:", response);

      // Reset form after successful submission
      setForm({
        title: "",
        summary: "",
        content: "",
        contentType: "article",
        tags: [],
        category: "",
        subcategory: "",
        featuredImage: null,
        videoUrl: null,
        galleryImages: [],
        readTime: 5,
        status: "draft",
        currentTag: "",
      });
      setFeaturedImagePreview(null);
      setVideoPreview(null);
      setGalleryPreviews([]);
      setTouched({});
    } catch (error: any) {
      console.error("News creation failed:", error.message);
      setErrors({
        submit: error.message || "News creation failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create New Post</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Share your story with the world
          </p>
        </div>

        <div className="space-y-8">
          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={20} />
              <span className="font-medium">{errors.submit}</span>
            </div>
          )}

          {/* Content Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Content Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {contentTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange("contentType", value)}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 min-h-[80px]
                    ${
                      form.contentType === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent"
                    }`}
                >
                  <Icon size={24} className="mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={() => handleBlur("title")}
              placeholder="Enter a compelling headline"
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors
                focus:outline-none focus:ring-0 bg-background text-foreground
                ${
                  errors.title && touched.title
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                    : "border-border focus:border-primary"
                }
                placeholder:text-muted-foreground
              `}
            />
            {errors.title && touched.title && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Summary *
            </label>
            <textarea
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              onBlur={() => handleBlur("summary")}
              placeholder="Brief summary of your news article"
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors resize-none
                focus:outline-none focus:ring-0 bg-background text-foreground
                ${
                  errors.summary && touched.summary
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                    : "border-border focus:border-primary"
                }
                placeholder:text-muted-foreground
              `}
            />
            {errors.summary && touched.summary && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.summary}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Content *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              onBlur={() => handleBlur("content")}
              placeholder="Write your full article content here..."
              rows={10}
              className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors resize-none
                focus:outline-none focus:ring-0 bg-background text-foreground
                ${
                  errors.content && touched.content
                    ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                    : "border-border focus:border-primary"
                }
                placeholder:text-muted-foreground
              `}
            />
            {errors.content && touched.content && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.content}
              </p>
            )}
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  handleChange("category", e.target.value);
                  handleChange("subcategory", "");
                }}
                onBlur={() => handleBlur("category")}
                className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors
                  focus:outline-none focus:ring-0 bg-background text-foreground
                  ${
                    errors.category && touched.category
                      ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                      : "border-border focus:border-primary"
                  }
                `}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && touched.category && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
                Subcategory *
              </label>
              <select
                value={form.subcategory}
                onChange={(e) => handleChange("subcategory", e.target.value)}
                onBlur={() => handleBlur("subcategory")}
                disabled={!form.category}
                className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-colors
                  focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed
                  bg-background text-foreground
                  ${
                    errors.subcategory && touched.subcategory
                      ? "border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                      : "border-border focus:border-primary"
                  }
                `}
              >
                <option value="">Select Subcategory</option>
                {form.category &&
                  subcategories[form.category]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
              {errors.subcategory && touched.subcategory && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.subcategory}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Tags *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={form.currentTag}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currentTag: e.target.value }))
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleTagAdd())
                }
                placeholder="Add tags..."
                className="flex-1 px-4 py-3 border-2 border-border rounded-lg text-base
                  bg-background text-foreground focus:border-primary focus:outline-none focus:ring-0 
                  placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border 
                    text-secondary-foreground rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>

            {errors.tags && touched.tags && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.tags}
              </p>
            )}
          </div>

          {/* Featured Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              <label
                className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border 
                rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-card"
              >
                <Image size={20} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  Choose Image (Max 10MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "featured");
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {featuredImagePreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={featuredImagePreview}
                  alt="Featured Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, featuredImage: null }));
                    setFeaturedImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Video Upload (for both video and podcast content) */}
          {(form.contentType === "video" || form.contentType === "podcast") && (
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
                Video File *
              </label>
              <div className="flex items-center gap-4">
                <label
                  className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border 
                  rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-card"
                >
                  <Video size={20} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Choose Video (Max 10MB)
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "video");
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {videoPreview && (
                <div className="mt-3 relative inline-block">
                  <video
                    src={videoPreview}
                    className="w-64 h-36 object-cover rounded-lg border-2 border-border"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, videoUrl: null }));
                      setVideoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {errors.videoUrl && touched.videoUrl && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.videoUrl}
                </p>
              )}
            </div>
          )}

          {/* Gallery Images (only for gallery content) */}
          {form.contentType === "gallery" && (
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
                Gallery Images *
              </label>
              <div className="space-y-3">
                {form.galleryImages?.map((_img, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border 
                        rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-card w-full"
                      >
                        <Image size={20} className="text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Choose Image {index + 1} (Max 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "gallery", index);
                          }}
                          className="hidden"
                        />
                      </label>
                      {galleryPreviews[index] && (
                        <img
                          src={galleryPreviews[index]!}
                          alt={`Gallery ${index + 1}`}
                          className="mt-2 w-24 h-24 object-cover rounded border-2 border-border"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGalleryImageRemove(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      galleryImages: [...(prev.galleryImages ?? []), null], // add null instead of ""
                    }))
                  }
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  + Add Image
                </button>
              </div>
            </div>
          )}

          {/* Read Time */}
          <div className="space-y-2">
            <label className="block text-sm font-bold uppercase tracking-wide text-foreground">
              Estimated Read Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={form.readTime}
              onChange={(e) =>
                handleChange("readTime", parseInt(e.target.value) || 1)
              }
              className="w-full sm:w-48 px-4 py-3 border-2 border-border rounded-lg text-base
                bg-background text-foreground focus:border-primary focus:outline-none focus:ring-0"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-border">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-border 
                rounded-lg text-base font-medium hover:border-primary/50 hover:bg-accent 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground 
                rounded-lg text-base font-medium hover:bg-primary/90 transition-colors 
                disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
              Publish Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostNews;
