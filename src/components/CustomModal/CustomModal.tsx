import { PropsWithChildren, useSyncExternalStore } from "react";
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
  const mobileLayout = useMobile();

  Modal.setAppElement(document.getElementsByTagName("main")[0]);

  return (
    <Modal
      isOpen={showModal}
      parentSelector={() => document.getElementsByTagName("main")[0]}
      onRequestClose={handleModalClose}
      className={`custom-modal ${desktopModalHeight === "fit-content" ? "fit-content" : "max-modal"}`}
      style={
        !mobileLayout
          ? {
              content: {
                height: desktopModalHeight || null,
              },
              overlay: {
                position: "absolute",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                inset: 0,
                height: "100%",
                overflow: "visible",
                backdropFilter: "blur(0.5px)",
              },
            }
          : {
              overlay: {
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(0.5px)",
              },
            }
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

// Custom hook that return true if the viewport is smaller or equal to 650 px
const useMobile = () => {
  return useSyncExternalStore(subscribe, () => window.innerWidth <= 650);
};

function subscribe(onViewPortChange: () => void) {
  window.addEventListener("resize", onViewPortChange);

  return () => {
    window.removeEventListener("resize", onViewPortChange);
  };
}
