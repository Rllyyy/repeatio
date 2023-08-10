import { PropsWithChildren } from "react";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";

import styles from "./FixedModal.module.css";

interface IFixedModal {
  handleModalClose: () => void;
  showModal: boolean;
  title: string;
}

export const FixedModal: React.FC<PropsWithChildren<IFixedModal>> = ({
  handleModalClose,
  showModal,
  title,
  children,
}) => {
  return (
    <Modal
      isOpen={showModal}
      onRequestClose={handleModalClose}
      appElement={document.getElementById("root") as HTMLElement}
      className={styles["fixed-modal"]}
      style={{
        overlay: { position: "fixed", inset: "0px", backgroundColor: "rgba(0, 0, 0, 0.6)" },
        content: {
          position: "absolute",
          /* margin: "40px", */
          /* inset: "40px", */
          border: "1px solid rgb(204, 204, 204)",
          background: "rgb(255, 255, 255)",
          overflow: "auto",
          borderRadius: "4px",
          outline: "none",
          padding: "20px",
          width: "calc(100vw - 80px)",
          maxWidth: "1400px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          height: "90%",
          maxHeight: "700px",
          /* maxHeight: "90vh", */
          /* minHeight: "600px", */
          display: "grid",
          gridTemplateColumns: "1fr max-content",
          rowGap: "20px",
          gridTemplateRows: "max-content 1fr",
        },
      }}
    >
      <h1 className='modal-title'>{title}</h1>
      <button type='button' className={styles["close-modal-btn"]} aria-label="Close Edit Modal" onClick={handleModalClose}>
        <IoClose style={{ height: "30px", width: "30px" }} />
      </button>
      {/*  <div className='title-close-wrapper'></div> */}
      {/* <div className='line' /> */}
      {/*  <hr /> */}
      <div className='modal-content' style={{ gridColumn: "1 / span 2" }}>
        {children}
      </div>
    </Modal>
  );
};
