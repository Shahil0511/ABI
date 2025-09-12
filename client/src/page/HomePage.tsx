import FeedNews from "@/components/news/FeedNews";
import Header from "@/components/headers/Header";
import StoryCarousel from "@/components/StoryCrousel/StoryCards";
import Footer from "@/components/headers/Footer";
import { useState } from "react";

const HomePage = () => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(
    null
  );
  return (
    <div>
      {/* Header */}
      <Header
        onFilterChange={(category, subcategory) => {
          setCategoryFilter(category);
          setSubcategoryFilter(subcategory);
        }}
      />

      {/* Main Content */}
      <main>
        {/* Hero Stories Section */}
        <section aria-label="Featured Stories">
          {/* Background Pattern */}

          <div>
            <StoryCarousel />
          </div>
        </section>

        {/* News Feed Section */}
        <section>
          <FeedNews
            categoryFilter={categoryFilter}
            subcategoryFilter={subcategoryFilter}
          />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
