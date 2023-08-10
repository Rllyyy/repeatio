import { memo, useCallback, useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router-dom";

//Import Icons
import { FaHome } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { FaHandshake } from "react-icons/fa";
import { BiNews } from "react-icons/bi";
import { RiSettings4Fill } from "react-icons/ri";
import { MdOndemandVideo } from "react-icons/md";

//Types
import { TExpandSidebar } from "./Sidebar";

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

const Categories = ({ expandedSidebar, setExpandedSidebar }: TExpandSidebar) => {
  const isMobile = useSyncExternalStore(subscribe, () => window.innerWidth <= 650);
  const { pathname } = useLocation();

  //Get the currently viewed category from the URL path
  const currentlyViewedCategory = pathname.split("/")[1];

  //Close the navbar when on mobile when the users clicks on a category.
  //Only runs when the viewport is smaller than 650px
  const closeMenuOnMobileClick = useCallback(() => {
    if (!isMobile) return;
    setExpandedSidebar(false);
  }, [isMobile, setExpandedSidebar]);

  return (
    <div className='category-items'>
      {navbarCategories.map((category) => {
        return (
          <LinkItem
            category={category}
            closeMenuOnMobileClick={closeMenuOnMobileClick}
            isCurrentlyViewed={currentlyViewedCategory === category.linkTo}
            expandedSidebar={expandedSidebar}
            key={category.text}
          />
        );
      })}
    </div>
  );
};

// Add event listener for window resizing
function subscribe(onWindowResize: () => void) {
  window.addEventListener("resize", onWindowResize);

  return () => window.removeEventListener("resize", onWindowResize);
}

interface ILinkItem {
  category: (typeof navbarCategories)[number];
  closeMenuOnMobileClick: () => void;
  isCurrentlyViewed: boolean;
  expandedSidebar: boolean;
}

const LinkItem: React.FC<ILinkItem> = memo(
  ({ category, closeMenuOnMobileClick, isCurrentlyViewed, expandedSidebar }) => {
    const { className, linkTo, icon, text } = category;

    return (
      <Link
        to={`/${linkTo}`}
        key={className}
        onClick={closeMenuOnMobileClick}
        aria-label={className}
        className={`${className}${isCurrentlyViewed ? " currentView" : ""}`}
      >
        {icon}
        <p className={`category-title ${expandedSidebar && "sidebar-button-expanded"}`} aria-hidden={!expandedSidebar}>
          {text}
        </p>
      </Link>
    );
  }
);

export { Categories, navbarCategories };
