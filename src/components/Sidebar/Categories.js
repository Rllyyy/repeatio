import { useState, useCallback, useEffect, memo } from "react";
import { Link, useLocation } from "react-router-dom";

//Import Icons
import { FaHome } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { FaHandshake } from "react-icons/fa";
import { BiNews } from "react-icons/bi";
import { RiSettings4Fill } from "react-icons/ri";
import { MdOndemandVideo } from "react-icons/md";

//Navbar categories
//TODO if custom navbar comes, this has to be moved into the component as a state
const navbarCategories = [
  { className: "home", linkTo: "", icon: <FaHome className='category-icon' />, text: "Home" },
  {
    className: "tutorials",
    linkTo: "tutorials",
    icon: <MdOndemandVideo className='category-icon' />,
    text: "Tutorials",
  },
  {
    className: "contribute",
    linkTo: "contribute",
    icon: <AiOutlineHeart className='category-icon' />,
    text: "Contribute",
  },
  { className: "thanks", linkTo: "thanks", icon: <FaHandshake className='category-icon' />, text: "Special Thanks" },
  { className: "news", linkTo: "news", icon: <BiNews className='category-icon' />, text: "News" },
  { className: "settings", linkTo: "settings", icon: <RiSettings4Fill className='category-icon' />, text: "Settings" },
];

const Categories = memo(({ setExpandSidebar, expandSidebar }) => {
  const [isMobile, setIsMobile] = useState();
  const [currentlyViewedCategory, setCurrentlyViewedCategory] = useState("");

  //Detect url changes to highlight background of current component in navbar
  const location = useLocation();

  //Update the useState value every time the url changes
  useEffect(() => {
    const currentPath = location.pathname;

    //Remove dash that is in-front of the url
    let pathNoDash = currentPath.split("/")[1];

    if (pathNoDash !== currentlyViewedCategory) {
      setCurrentlyViewedCategory(pathNoDash);
    }
  }, [location.pathname, currentlyViewedCategory]);

  //Set is mobile to true when the viewport is smaller than 650px
  const handleWindowResize = useCallback(() => {
    if (window.innerWidth <= 650) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  //Check if the size of the window is smaller than 650px so the special mobile navbar behavior is applied
  useEffect(() => {
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  //Close the navbar when on mobile when the users clicks on a category.
  //Only runs when the viewport is smaller than 650px
  const closeMenuOnMobileClick = useCallback(() => {
    if (!isMobile) return;
    setExpandSidebar(false);
  }, [isMobile, setExpandSidebar]);

  return (
    <div className='category-items'>
      {navbarCategories.map((category) => {
        //destructure category
        const { className, linkTo, icon, text } = category;
        return (
          <Link
            to={`/${linkTo}`}
            key={className}
            onClick={closeMenuOnMobileClick}
            aria-label={className}
            className={`${className}${currentlyViewedCategory === linkTo ? " currentView" : ""}`}
          >
            {icon}

            <p className={`category-title ${expandSidebar && "sidebar-button-expanded"}`} aria-hidden={!expandSidebar}>
              {text}
            </p>
          </Link>
        );
      })}
    </div>
  );
});

export { Categories, navbarCategories };
