import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import isElectron from "is-electron";
import PropTypes from "prop-types";

//Icons
import { CgFileDocument } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import { AiFillFolderOpen } from "react-icons/ai";

const ImportModule = ({ handleModalClose }) => {
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
        console.warn(error.message);
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
      console.warn("Can't import modules in electron for this time");
      return;
    }

    //TODO warn user with tost
    if (files.length < 1) {
      console.warn("nothing chosen");
    }

    //Update the localStorage for each object in the files state array and dispatch event
    files.forEach(async (file) => {
      try {
        const data = await file.text();

        //Update localeStorage and tell the window that a new storage event occurred
        localStorage.setItem(`repeatio-module-${JSON.parse(data).id}`, data, { sameSite: "strict", secure: true });
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        console.error(error);
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

export default ImportModule;
