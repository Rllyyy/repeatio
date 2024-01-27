import { BsExclamationTriangle } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import Modal from "react-modal";

type TDeleteConfirmationModal = {
  deleteButtonText: string;
  title: string;
  message: string;
  onConfirmDelete: () => void;
  showModal: boolean;
  handleCloseModal: () => void;
};

const customStyles: Modal.Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "90%",
    maxWidth: "500px",
    padding: "0",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
};

export const DeleteConfirmationModal: React.FC<TDeleteConfirmationModal> = ({
  showModal,
  message,
  title,
  deleteButtonText,
  onConfirmDelete,
  handleCloseModal,
}) => {
  return (
    <Modal
      isOpen={showModal}
      appElement={document.getElementById("root") as HTMLElement}
      style={customStyles}
      onRequestClose={handleCloseModal}
    >
      <div className='flex flex-col gap-4 p-3 md:p-4'>
        <div className='flex items-center justify-center p-3 mx-auto bg-red-100 rounded-full'>
          <BsExclamationTriangle className='text-red-600 size-8' />
        </div>
        <h2 className='px-2 text-2xl font-semibold text-center text-slate-700'>{title}</h2>

        <button
          className='absolute p-2 rounded-sm right-2 top-2 text-slate-400 hover:text-red-600'
          type='button'
          aria-label='Close Modal'
          onClick={handleCloseModal}
        >
          <IoClose className=' size-7' />
        </button>
        <p className='text-base text-center text-slate-500 text-balance'>{message}</p>
        <div className='flex flex-col justify-between gap-1.5'>
          <button
            className='px-4 py-2 font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 hover:border-red-700'
            onClick={onConfirmDelete}
            aria-label={deleteButtonText}
            type='button'
          >
            {deleteButtonText}
          </button>
          <button
            className='px-4 py-2 font-medium bg-transparent border border-gray-300 rounded hover:bg-slate-100 text-slate-700'
            aria-label='Cancel Deletion'
            type='button'
            onClick={handleCloseModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
