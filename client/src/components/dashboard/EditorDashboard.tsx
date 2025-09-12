import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import Header from "../headers/Header";
import StoryCarousel from "../StoryCrousel/StoryCards";
import PostNews from "../news/PostNews";

export const EditorDashboard = () => {
      const { token } = useSelector((state: RootState) => state.auth);
        if (!token) return <p>Please log in</p>;
return (
    <div>
      <Header/>
      <StoryCarousel/>
      <PostNews/>
    </div>
  );
}

