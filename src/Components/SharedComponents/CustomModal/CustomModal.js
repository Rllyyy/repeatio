import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal/lib/components/Modal";

import { IoClose } from "react-icons/io5";

//CSS
import "./CustomModal.css";

const CustomModal = ({ handleModalClose, title, desktopModalHeight, children }) => {
  const [mobileLayout, setMobileLayout] = useState(false);

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

  return (
    <Modal
      isOpen={true}
      parentSelector={() => document.getElementsByTagName("main")[0]}
      onRequestClose={handleModalClose}
      className={desktopModalHeight === "fit-content" ? "min-modal" : "max-modal"}
      style={
        !mobileLayout
          ? {
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
