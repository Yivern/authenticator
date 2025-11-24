import { Routes, Route } from "react-router-dom";
import NoPage from "./pages/NoPage";
import Lector from "./pages/lectorPDF"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lector />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </div>
  );
}

export default App;