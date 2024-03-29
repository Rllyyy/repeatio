import { useEffect } from "react";
import { useLocation } from "react-router-dom";

//Scroll to top on path change
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the magic for React Router Dom v6
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // Optional if you want to skip the scrolling animation
    });
  }, [pathname]);

  return null;
}
