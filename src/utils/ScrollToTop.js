import { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";

//Scroll to top on path change
export const ScrollToTop = withRouter(({ children }) => {
  let { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children || null;
});
