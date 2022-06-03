import { useLayoutEffect } from "react";
import { withRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";

//Scroll to top on path change
const ScrollToTop = ({ children }) => {
  let { pathname } = useLocation();

  useLayoutEffect(() => {
    const main = document.getElementsByTagName("main");
    main[0].scrollTo(0, 0);
  }, [pathname]);

  return children || null;
};

export default withRouter(ScrollToTop);
