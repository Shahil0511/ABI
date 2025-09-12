import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const stories = [
  {
    id: 1,
    title: "Breaking: Parliament Passes New Education Reform Bill That Will Affect Millions",
    image: "/1.jpg",
    isViewed: false,
    timestamp: "2h"
  },
  {
    id: 2,
    title: "India Wins Gold at the Olympics in Record-Breaking Performance",
    image: "/2.jpg",
    isViewed: true,
    timestamp: "4h"
  },
  {
    id: 3,
    title: "AI Startup Raises $100 Million in Funding for Revolutionary Tech",
    image: "/3.jpg",
    isViewed: false,
    timestamp: "6h"
  },
  {
    id: 4,
    title: "Cricket Legend Announces Retirement After Two Decades on the Field",
    image: "/4.jpg",
    isViewed: true,
    timestamp: "8h"
  },
  {
    id: 5,
    title: "Cricket Legend Announces Retirement After Two Decades on the Field",
    image: "/5.jpeg",
    isViewed: false,
    timestamp: "10h"
  },
   {
    id: 8,
    title: "AI Startup Raises $100 Million in Funding for Revolutionary Tech",
    image: "/3.jpg",
    isViewed: false,
    timestamp: "6h"
  },
   {
    id: 10,
    title: "Breaking: Parliament Passes New Education Reform Bill That Will Affect Millions",
    image: "/1.jpg",
    isViewed: false,
    timestamp: "2h"
  },
  {
    id: 6,
    title: "Global Climate Summit Reaches Historic Agreement",
    image: "/6.jpeg",
    isViewed: false,
    timestamp: "12h"
  },
  {
    id: 7,
    title: "Tech Giant Unveils Revolutionary New Smartphone",
    image: "/7.jpeg",
    isViewed: true,
    timestamp: "14h"
  },
   {
    id: 9,
    title: "AI Startup Raises $100 Million in Funding for Revolutionary Tech",
    image: "/3.jpg",
    isViewed: false,
    timestamp: "6h"
  },
   {
    id: 11,
    title: "Breaking: Parliament Passes New Education Reform Bill That Will Affect Millions",
    image: "/1.jpg",
    isViewed: false,
    timestamp: "2h"
  },
];

const StoryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewedStories, setViewedStories] = useState(new Set());
  const scrollContainerRef = useRef(null);

  // Responsive stories per view
  const getStoriesPerView = () => {
    if (typeof window === 'undefined') return 4;
    
    const width = window.innerWidth;
    if (width < 480) return 2.2; // Mobile: show partial next story
    if (width < 768) return 3.2; // Small tablet
    if (width < 1024) return 4.5; // Tablet
    if (width < 1280) return 5.5; // Desktop
    return 6.5; // Large desktop
  };

  const [storiesPerView, setStoriesPerView] = useState(getStoriesPerView());

  // Update stories per view on resize
  useEffect(() => {
    const handleResize = () => {
      const newStoriesPerView = getStoriesPerView();
      setStoriesPerView(newStoriesPerView);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, Math.ceil(stories.length - storiesPerView));

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < maxIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handle story view
  const handleStoryView = (storyId: number) => {
    setViewedStories(prev => new Set([...prev, storyId]));
  };

  return (
    <div className="w-full bg-background">
      {/* Header - increased size for desktop */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Stories</h2>
        <div className="flex gap-2">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0 || isTransitioning}
            className="p-2 lg:p-3 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex || isTransitioning}
            className="p-2 lg:p-3 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

      {/* Stories Container - increased size for desktop */}
      <div className="overflow-hidden px-4 sm:px-6 lg:px-8">
        <div 
          ref={scrollContainerRef}
          className="flex transition-transform duration-300 ease-out gap-3 lg:gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / storiesPerView)}%)`,
          }}
        >
          {/* Add Story Button - increased size for desktop */}
          <div className="flex-shrink-0 w-20 sm:w-24 lg:w-36">
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 border-4 border-transparent">
                <Plus className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <p className="text-xs lg:text-sm text-center mt-2 lg:mt-3 font-medium text-muted-foreground truncate">
                Add Story
              </p>
            </div>
          </div>

          {/* Story Items - increased size for desktop */}
          {stories.map((story) => {
            const isViewed = viewedStories.has(story.id) || story.isViewed;
            
            return (
              <div key={story.id} className="flex-shrink-0 w-20 sm:w-24 lg:w-36">
                <div className="relative">
                  {/* Story Ring */}
                  <div className={`p-1 rounded-xl lg:rounded-2xl ${
                    isViewed 
                      ? 'bg-gray-300' 
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
                  }`}>
                    <div 
                      className="aspect-[3/4] rounded-lg lg:rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 relative group"
                      onClick={() => handleStoryView(story.id)}
                    >
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      
                      {/* Fallback for broken images */}
                      <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                        <span className="text-gray-400 text-xs lg:text-sm">No Image</span>
                      </div>
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Story content */}
                      <div className="absolute bottom-1 left-1 right-1 lg:bottom-2 lg:left-2 lg:right-2">
                        <p className="text-white text-[10px] sm:text-xs lg:text-sm font-medium leading-tight line-clamp-2">
                          {story.title}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="absolute top-1 right-1 lg:top-2 lg:right-2">
                        <span className="text-white text-[9px] lg:text-xs bg-black/30 px-1 rounded">
                          {story.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Story title below */}
                  <p className="text-[10px] sm:text-xs lg:text-sm text-center mt-1 lg:mt-2 font-medium text-foreground truncate px-1">
                    {story.title.split(' ').slice(0, 2).join(' ')}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress indicators - increased size for desktop */}
      <div className="flex justify-center mt-4 lg:mt-6 gap-1 px-4">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => setIsTransitioning(false), 300);
              }
            }}
            className={`h-1 lg:h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-primary w-8 lg:w-12'
                : 'bg-muted w-2 lg:w-3 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StoryCarousel;



 