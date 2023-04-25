import { useState, useEffect, PropsWithChildren } from "react";
import Modal from "react-modal";

import { IoClose } from "react-icons/io5";

//CSS
import "./CustomModal.css";
type Unit = "%" | "px" | "em" | "vh" | "vh";
type CustomHeight = `${string}${Unit}`;

type Globals = "-moz-initial" | "inherit" | "initial" | "revert" | "revert-layer" | "unset";

/**
 * Pass any valid css height
 */
type Height =
  | Globals
  | "90vh"
  | "-moz-max-content"
  | "-moz-min-content"
  | "-webkit-fit-content"
  | "auto"
  | "fit-content"
  | `fit-content(${CustomHeight})`
  | "max-content"
  | "min-content"
  | CustomHeight;

interface ICustomModal {
  handleModalClose: () => void;
  showModal: boolean;
  title: string;
  //Pass any valid css height
  desktopModalHeight: Height;
}

export const CustomModal: React.FC<PropsWithChildren<ICustomModal>> = ({
  handleModalClose,
  showModal,
  title,
  desktopModalHeight,
  children,
}) => {
  const [mobileLayout, setMobileLayout] = useState(false);

  Modal.setAppElement(document.getElementsByTagName("main")[0]);

  //TODO replace this in the future with css container query
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
      isOpen={showModal}
      parentSelector={() => document.getElementsByTagName("main")[0]}
      onRequestClose={handleModalClose}
      className={desktopModalHeight === "fit-content" ? "fit-content" : "max-modal"}
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
