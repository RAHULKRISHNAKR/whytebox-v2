/**
 * TutorialsPage — redirects to the full Tutorials browse page
 * The real implementation lives at /tutorials/browse (Tutorials.tsx)
 * We redirect so /tutorials also works as the canonical URL.
 */
import { Navigate } from 'react-router-dom';

export default function TutorialsPage() {
  return <Navigate to="/tutorials/browse" replace />;
}

// Made with Bob
