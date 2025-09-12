import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./page/HomePage";
import {EditorDashboard} from "./components/dashboard/EditorDashboard";
import SingleNewsPage from "./page/SingleNewsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element = {<EditorDashboard/>} />
        <Route path = "/news/:id" element = {<SingleNewsPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
