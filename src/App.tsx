import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import PatternAnalysis from "@/pages/PatternAnalysis";
import ThreadMaking from "@/pages/ThreadMaking";
import CoilingModel from "@/pages/CoilingModel";
import CraftArchive from "@/pages/CraftArchive";
import TemplateLibrary from "@/pages/TemplateLibrary";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/pattern" replace />} />
          <Route path="/pattern" element={<PatternAnalysis />} />
          <Route path="/mixture" element={<ThreadMaking />} />
          <Route path="/coiling" element={<CoilingModel />} />
          <Route path="/records" element={<CraftArchive />} />
          <Route path="/templates" element={<TemplateLibrary />} />
          <Route path="*" element={<Navigate to="/pattern" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
