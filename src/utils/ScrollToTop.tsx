import { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";

//Scroll to top on path change
const ScrollToTopComponent: React.FC = () => {
  let { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const ScrollToTop = withRouter(ScrollToTopComponent);
