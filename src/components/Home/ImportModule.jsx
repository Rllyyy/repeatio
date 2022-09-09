import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import isElectron from "is-electron";
import PropTypes from "prop-types";

//Icons
import { CgFileDocument } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import { AiFillFolderOpen } from "react-icons/ai";

export const ImportModule = ({ handleModalClose }) => {
  const [files, setFiles] = useState([]);

  //Update the prev files states on drop with the new selected files
  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files]
  );

  //Show warning if there is an error
  //TODO switch to toast
  const onDropRejected = useCallback((dropFileRejections) => {
    dropFileRejections?.forEach(({ errors }) => {
      errors.forEach((error) => {
        //TODO switch to warning in form
        toast.error(error.message);
      });
    });
  }, []);

  //Check if the file is already in the state
  //TODO switch maybe to id as the id is used as a unique identifier key in the home component
  const checkExist = (file) => {
    if (file === undefined) {
      return;
    }
    //TODO check if file already exists
    if (files.some((e) => e.lastModified === file.lastModified && e.name === file.name)) {
      return {
        code: "item-already-in-list",
        message: "item already in list",
      };
    }
  };

  //useDropzone hook
  //For documentation: https://react-dropzone.js.org
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/json": [".json"] },
    noClick: true,
    validator: checkExist,
  });

  //Remove selected file on button click
  const handleRemoveFile = (file) => {
    const newFiles = [...files];
    newFiles.splice(newFiles.indexOf(file), 1);
    setFiles(newFiles);
  };

  //Update the localStorage on submit
  const handleImportSubmit = (e) => {
    e.preventDefault();

    //prevent using electron for this time
    //TODO add ability to use electron
    if (isElectron()) {
      toast.warn("Can't import modules in electron for this time!");
      handleModalClose();
      return;
    }

    //TODO disable submit if files?.length < 1
    if (files.length < 1) {
      toast.warn("Nothing chosen");
    }

    //Update the localStorage for each object in the files state array and dispatch event
    files.forEach(async (file) => {
      try {
        const data = await file.text();
        const { id } = JSON.parse(data);

        //Update localeStorage and tell the window that a new storage event occurred
        localStorage.setItem(`repeatio-module-${id}`, data, {
          sameSite: "strict",
          secure: true,
        });
        window.dispatchEvent(new Event("storage"));

        //Toast here success
        toast.success(<ImportSuccessMessage id={id} />, {
          autoClose: 12000,
          closeOnClick: true,
          data: `Imported ${id}`,
        });
      } catch (error) {
        //Notify user of import error and console log error
        toast.error(<ImportErrorMessage errorMessage={error.message} />, {
          autoClose: 18000,
          data: `Failed to import the module.\n ${error.message}`,
        });
      }
    });

    handleModalClose();
  };

  return (
    <form className='import-module' onSubmit={handleImportSubmit}>
      <h2>Import Module</h2>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} data-testid='dropzone-input' />
        <div className='drop-info'>
          <AiFillFolderOpen className='folder' />
          <p>Drag 'n' drop files here</p>
        </div>
        <p className='background'>
          <span className='strike'>or</span>
        </p>
        <button type='button' onClick={open} className='drop-browse-btn'>
          Browse files
        </button>
      </div>
      <div className='accepted-files'>
        {files.map((file) => {
          return (
            <div key={`${file.lastModified}-${file.name}`} className='file'>
              <CgFileDocument className='file-icon' />
              <span className='file-name'>{file.name}</span>
              <button
                type='button'
                className='file-remove-btn'
                data-testid='file-remove-button'
                onClick={() => handleRemoveFile(file)}
              >
                <IoCloseOutline className='file-remove-icon' />
              </button>
            </div>
          );
        })}
      </div>
      <button type='submit' className='import-module-btn'>
        Add
      </button>
    </form>
  );
};

ImportModule.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
};

/* ------------------------------- Success message for the toast -------------------------------- */
const ImportSuccessMessage = ({ id }) => {
  return (
    <>
      <p>
        Successfully imported{" "}
        <b>
          <Link to={`/module/${id}`}>{id}</Link>
        </b>
        .
      </p>
      <p>Click on the ID to view the module.</p>
    </>
  );
};

ImportSuccessMessage.propTypes = {
  id: PropTypes.string.isRequired,
};

/* ------------------------------- Error message for the toast ---------------------------------- */
const ImportErrorMessage = ({ errorMessage }) => {
  return (
    <>
      <p>Failed to import the module.</p>
      <p>{errorMessage}</p>
    </>
  );
};

ImportErrorMessage.propTypes = {
  errorMessage: PropTypes.string.isRequired,
};
