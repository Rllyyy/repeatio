import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import isElectron from "is-electron";
import PropTypes from "prop-types";
import { moduleAlreadyInStorage, getModuleID } from "./helpers.js";

//Icons
import { CgFileDocument } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import { AiFillFolderOpen } from "react-icons/ai";
import { BsFillExclamationCircleFill } from "react-icons/bs";

export const ImportModule = ({ handleModalClose }) => {
  const [files, setFiles] = useState([]);
  const [warningMessages, setWarningMessages] = useState([]);

  //Update the prev files states on drop/upload with the new selected files and update warnings
  const onDropAccepted = useCallback(
    async (acceptedFiles) => {
      let acceptedFilesWithID = [];
      let warnings = [];
      //Loop through accepted files to add id prop to file and add warning if module is already in storage
      for await (const acceptedFile of acceptedFiles) {
        const idObject = { id: await getModuleID({ file: acceptedFile }) };
        const newFile = Object.assign(acceptedFile, idObject);

        //This doesn't work if the user import the same file (but with a different name) at the same time but this isn't really a problem as it will be added to the storage only once (edge case)
        if (!files.find((file) => file.id === newFile.id)) {
          acceptedFilesWithID.push(newFile);

          //Check Storage if the
          if (moduleAlreadyInStorage({ value: newFile.id })) {
            warnings.push(
              `${newFile.id} already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
            );
          }
        } else {
          toast.error(
            `A file with the same ID (${newFile.id}) is already in your imports! Remove it, to add this file!`
          );
        }
      }

      //Update warnings
      setWarningMessages((prev) => [...prev, ...warnings]);

      //Update files state if there are any new files added else escape function
      if (acceptedFilesWithID.length > 0) {
        setFiles([...files, ...acceptedFilesWithID]);
      }
    },
    [files]
  );

  //Show warning if there is an error
  const onDropRejected = useCallback((dropFileRejections) => {
    dropFileRejections?.forEach(({ errors }) => {
      errors.forEach((error) => {
        toast.error(error.message);
      });
    });
  }, []);

  //Check if the file is already in the state by checking name and lastModified prop
  //Sadly the validator can't read the content because it seems to not support async
  const validateSameFile = (file) => {
    if (file === undefined) {
      return;
    }

    if (
      files.some(
        (existingFiles) => existingFiles.lastModified === file.lastModified && existingFiles.name === file.name
      )
    ) {
      return {
        code: "item-already-in-list",
        message: "Module is already in the list of imports!",
      };
    }
  };

  //useDropzone hook
  //For documentation: https://react-dropzone.js.org
  const { getRootProps, getInputProps, open } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: { "application/json": [".json"] },
    noClick: true,
    validator: validateSameFile,
  });

  //Revalidate if id already exists in storage and will be overwritten, as the initial validate runs when the component is
  const revalidateAlreadyInStorage = useCallback(async (passedFiles) => {
    let messages = [];

    //
    for await (const contents of passedFiles) {
      const data = await contents.text();
      const { id } = JSON.parse(data);

      if (moduleAlreadyInStorage({ value: id })) {
        messages.push(
          `${id} already exists in your modules. If you click on "Add" the old module will be overwritten with the imported file!`
        );
      }
    }

    //If there are any messages update the state with them else update with empty array
    if (messages.length > 0) {
      setWarningMessages([...messages]);
    } else {
      setWarningMessages([]);
    }
  }, []);

  //Remove selected file on button click and rerun module id check
  const handleRemoveFile = (file) => {
    const newFiles = [...files];
    newFiles.splice(newFiles.indexOf(file), 1);
    setFiles(newFiles);
    revalidateAlreadyInStorage(newFiles);
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
      toast.warn("Please select a file!");
      return;
    }

    //Update the localStorage for each object in the files state array and dispatch event
    files.forEach(async (file) => {
      try {
        const data = await file.text();

        //Update localeStorage and tell the window that a new storage event occurred
        localStorage.setItem(`repeatio-module-${file.id}`, data, {
          sameSite: "strict",
          secure: true,
        });
        window.dispatchEvent(new Event("storage"));

        //Toast here success
        toast.success(<ImportSuccessMessage id={file.id} />, {
          autoClose: 12000,
          closeOnClick: true,
          data: `Imported ${file.id}`,
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
      <ul className='accepted-files'>
        {files.map((file) => {
          return (
            <li key={`${file.lastModified}-${file.name}`} id={`${file.id}`} className='file'>
              <CgFileDocument className='file-icon' />
              <span className='file-info'>
                {file.name} ({file.id})
              </span>
              <button type='button' className='file-remove-btn' onClick={() => handleRemoveFile(file)}>
                <IoCloseOutline className='file-remove-icon' />
              </button>
            </li>
          );
        })}
      </ul>
      <WarningMessages errors={warningMessages} />
      <ImportModuleButton files={files} />
    </form>
  );
};

ImportModule.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
};

/* ------------------------------------------- Error Messages ----------------------------------- */
//Render list of errors if there are any in the errors object
const WarningMessages = ({ errors }) => {
  return (
    <>
      {errors?.length > 0 && (
        <div className='import-module-warnings'>
          <BsFillExclamationCircleFill className='import-module-warning-icon' />
          <ul className='import-module-warnings-list'>
            {errors.map((error, index) => {
              return (
                <li key={index} style={{ fontSize: "16px" }}>
                  {error}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

/* ------------------------------------------Import Module Button ------------------------------- */
const ImportModuleButton = ({ files }) => {
  return (
    //Disabling is not handled on the disabled prop because the warning should show onClick
    <button type='submit' className={`import-module-btn ${files?.length > 0 ? "enabled" : "disabled"}`}>
      Add
    </button>
  );
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
