import { useEffect, useState } from "react";
import AiInterview from "./pages/v1/AiInterview";
import ComprehensiveReview from "./pages/v1/ComprehensiveReview";
import Export from "./pages/v1/Export";
import SectionWriting from "./pages/v1/SectionWriting";
import AiInterviewV2 from "./pages/v2/AiInterviewV2";
import ComprehensiveReviewV2 from "./pages/v2/ComprehensiveReviewV2";
import ExportV2 from "./pages/v2/ExportV2";
import SectionWritingV2 from "./pages/v2/SectionWritingV2";
import AiInterviewV3 from "./pages/v3/AiInterviewV3";
import ComprehensiveReviewV3 from "./pages/v3/ComprehensiveReviewV3";
import ExportV3 from "./pages/v3/ExportV3";
import SectionWritingV3 from "./pages/v3/SectionWritingV3";

const routes = {
  "/v1": AiInterview,
  "/v1/section-writing": SectionWriting,
  "/v1/comprehensive-review": ComprehensiveReview,
  "/v1/export": Export,
  "/v2": AiInterviewV2,
  "/v2/section-writing": SectionWritingV2,
  "/v2/comprehensive-review": ComprehensiveReviewV2,
  "/v2/export": ExportV2,
  "/v3": AiInterviewV3,
  "/v3/section-writing": SectionWritingV3,
  "/v3/comprehensive-review": ComprehensiveReviewV3,
  "/v3/export": ExportV3,
} as const;

type RoutePath = keyof typeof routes;

const isRoutePath = (path: string): path is RoutePath => path in routes;

function App() {
  const [path, setPath] = useState<RoutePath>(() => {
    const currentPath = window.location.pathname;
    return isRoutePath(currentPath) ? currentPath : "/v1";
  });

  useEffect(() => {
    if (!isRoutePath(window.location.pathname)) {
      window.history.replaceState(null, "", path);
    }

    const onPopState = () => {
      const currentPath = window.location.pathname;
      setPath(isRoutePath(currentPath) ? currentPath : "/v1");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [path]);

  const navigate = (nextPath: RoutePath) => {
    window.history.pushState(null, "", nextPath);
    setPath(nextPath);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || !isRoutePath(href)) return;

    event.preventDefault();
    navigate(href);
  };

  const Page = routes[path];

  return (
    <div onClick={handleClick}>
      <Page />
    </div>
  );
}

export default App;
