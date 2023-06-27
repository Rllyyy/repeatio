import { useSyncExternalStore, useState } from "react";
import "./Sidebar.css";

//Components
import { Categories } from "./Categories";

//Hooks
import { useSetting } from "../../hooks/useSetting";

//Icon
import { FiMenu } from "react-icons/fi";
import { HiXMark } from "react-icons/hi2";

export type TExpandSidebar = {
  expandedSidebar: boolean;
  setExpandedSidebar: (newValue: boolean) => void | React.Dispatch<React.SetStateAction<boolean>>;
};

//Sidebar Component
export const Sidebar = () => {
  // Only save the state of the sidebar to the localStorage on desktop and not on mobile.
  const [expandedDesktop, setExpandedDesktop] = useSetting("expanded", true);
  const [expandedMobile, setExpandedMobile] = useState(false);

  const isMobile = useSyncExternalStore(subscribeToResize, () => window.innerWidth <= 650);

  // Use react state if on mobile viewport, else use the localStorage value
  const isExpanded = isMobile ? expandedMobile : expandedDesktop;

  //JSX
  return (
    <nav className={`sidebar ${isExpanded && "sidebar-expanded"}`}>
      <Hamburger
        setExpandedSidebar={isMobile ? setExpandedMobile : setExpandedDesktop}
        expandedSidebar={isExpanded}
        isMobile={isMobile}
      />
      <Categories setExpandedSidebar={setExpandedMobile} expandedSidebar={isExpanded} />
    </nav>
  );
};

interface IHamburger {
  expandedSidebar: TExpandSidebar["expandedSidebar"];
  setExpandedSidebar: TExpandSidebar["setExpandedSidebar"];
  isMobile: boolean;
}

//Hamburger Component
const Hamburger: React.FC<IHamburger> = ({ setExpandedSidebar, expandedSidebar, isMobile }) => {
  function handleNavClick() {
    setExpandedSidebar(!expandedSidebar);
  }

  return (
    <button className='hamburger' onClick={handleNavClick} type='button'>
      {/* Show x-mark (close icon) if on mobile and nav is expanded else display hamburger icon */}
      {expandedSidebar && isMobile ? (
        <HiXMark style={{ strokeWidth: "1", pointerEvents: "none" }} className='category-icon' id='x-mark-icon' />
      ) : (
        <FiMenu className='category-icon' id='hamburger-icon' />
      )}
      <p className={`${expandedSidebar ? "sidebar-button-expanded" : ""}`}>repeatio</p>
    </button>
  );
};

function subscribeToResize(onWindowResize: () => void) {
  window.addEventListener("resize", onWindowResize);

  return () => window.removeEventListener("resize", onWindowResize);
}
