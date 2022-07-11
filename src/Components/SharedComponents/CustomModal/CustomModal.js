import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal/lib/components/Modal";

import { IoClose } from "react-icons/io5";

//CSS
import "./CustomModal.css";

//Module

//Because of the sidebar, the desktop ui needs to have the modal act as position absolute.
//To have the modal on desktop always in the center, this component uses marginTop. Kinda weird.
//The mobile ui uses position fixed.
const CustomModal = ({ handleModalClose, title, desktopModalHeight, children }) => {
  const [mobileLayout, setMobileLayout] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  Modal.setAppElement("main");

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width } = window;

      if (width <= 650) {
        setMobileLayout(true);
      } else {
        setMobileLayout(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //Handle user Scroll
  const handleScroll = () => {
    const main = document.getElementById("main");
    setScrollPosition(main.scrollTop);
  };

  useEffect(() => {
    handleScroll();
    const main = document.getElementById("main");
    main.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      main.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Modal
      isOpen={true}
      parentSelector={() => document.getElementById("main")}
      onRequestClose={handleModalClose}
      style={
        !mobileLayout
          ? {
              overlay: {
                marginTop: scrollPosition,
              },
              content: {
                height: desktopModalHeight || null,
              },
            }
          : {}
      }
    >
      <div className='title-close-wrapper'>
        <h1 className='modal-title'>{title}</h1>
        <button type='button' className='modal-close-btn' onClick={handleModalClose}>
          <IoClose />
        </button>
      </div>

      <div className='line' />
      <div className='modal-content'>{children}</div>
    </Modal>
  );
};

CustomModal.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  desktopModalHeight: PropTypes.string.isRequired,
};

export default CustomModal;
