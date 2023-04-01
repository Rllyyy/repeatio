import React, { useState, useCallback, useMemo } from "react";
import { useDropzone, FileRejection, DropzoneOptions, FileError } from "react-dropzone";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import isElectron from "is-electron";
import { moduleAlreadyInStorage, getFileTypeAndID } from "./helpers";
import { Tooltip } from "@mui/material";

//Icons
import { CgFileDocument } from "react-icons/cg";
import { IoCloseOutline, IoWarning } from "react-icons/io5";
import { AiFillFolderOpen } from "react-icons/ai";

interface IImportModule {
  handleModalClose: () => void;
}

export interface IFile extends File {
  id: string;
  alreadyExistInLS?: boolean;
  fileType?: "marked" | "module" | "bookmark";
}

export const ImportModule = ({ handleModalClose }: IImportModule) => {
  const [files, setFiles] = useState<IFile[]>([]);

  //Update the prev files states on drop/upload with the new selected files and update warnings
  const onDropAccepted = useCallback<NonNullable<DropzoneOptions["onDropAccepted"]>>(
    async (acceptedFiles) => {
      let acceptedFilesWithID: IFile[] = [];
      let warnings: Array<string> = [];

      //Loop through accepted files to add id prop to file and add warning if module is already in storage
      for await (const acceptedFile of acceptedFiles) {
        //get id and type from the file
        const fileTypeAndID = await getFileTypeAndID(acceptedFile);

        //Check if the imported file is a bookmark file and show error if so
        if (fileTypeAndID.fileType === "marked" || fileTypeAndID.fileType === "bookmark") {
          toast.error(
            `Failed to import the bookmarked questions for "${fileTypeAndID.id}"! Navigate to the module and click import inside the 3 dots found at 'Bookmarked Questions' to import bookmarked Questions!`,
            { autoClose: 12000 }
          );
          continue;
        }

        //Check if file is a old repeatio version
        if (!fileTypeAndID.id) {
          toast.error("The version of this file is incompatible with this version of repeatio! ", { autoClose: 12000 });
          continue;
        }

        //Combine the imported file with the information from inside (id and type)
        let newFile: IFile = Object.assign(acceptedFile, fileTypeAndID);

        //This doesn't work if the user import the same file (but with a different name) at the same time but this isn't really a problem as it will be added to the storage only once (edge case)
        if (!files.find((file) => file.id === newFile.id)) {
          //Check Storage if the file is already in the localStorage
          if (moduleAlreadyInStorage(newFile.id)) {
            newFile = Object.assign(newFile, { alreadyExistInLS: true });
            warnings.push(`${newFile.id}`);
          }
          acceptedFilesWithID.push(newFile);
        } else {
          toast.error(
            `A file with the same ID (${newFile.id}) is already in your imports! Remove it, to add this file!`
          );
        }
      }

      //Update files state if there are any new files added else escape function
      if (acceptedFilesWithID.length > 0) {
        setFiles([...files, ...acceptedFilesWithID]);
      }
    },
    [files]
  );

  //Show warning if there is an error
  const onDropRejected = useCallback((dropFileRejections: FileRejection[]) => {
    dropFileRejections?.forEach(({ errors }) => {
      errors.forEach((error) => {
        toast.error(error.message);
      });
    });
  }, []);

  //Check if the file is already in the state by checking name and lastModified prop
  //Sadly the validator can't read the content because it seems to not support async
  const validateSameFile = (file: File): FileError | FileError[] | null => {
    if (file === undefined) {
      return null;
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

    return null;
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

  //Remove selected file on button click and rerun module id check
  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    //Remove the file with the correct id from the files array and update the state
    const filteredFiles = files.filter((file) => file.id !== e.currentTarget.getAttribute("data-id"));

    setFiles(filteredFiles);
  };

  //Update the localStorage on submit
  const handleImportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //prevent using electron for this time
    //TODO add ability to use electron
    if (isElectron()) {
      toast.warn("Can't import modules in electron for this time!");
      handleModalClose();
      return;
    }

    if (files.length < 1) {
      toast.warn("Please select a file!");
      return;
    }

    //Update the localStorage for each object in the files state array and dispatch event
    files.forEach(async (file) => {
      try {
        const data = await file.text();

        //Update localeStorage and tell the window that a new storage event occurred
        localStorage.setItem(`repeatio-module-${file.id}`, data);
        window.dispatchEvent(new Event("storage"));

        //Toast success
        toast.success(<ImportSuccessMessage id={file.id} />, {
          autoClose: 12000,
          closeOnClick: true,
          data: `Imported ${file.id}`,
        });
      } catch (error) {
        if (error instanceof Error) {
          //Notify user of import error and console log error
          toast.error(<ImportErrorMessage errorMessage={error.message} />, {
            autoClose: 18000,
            data: `Failed to import the module.\n ${error.message}`,
          });
        }
      }
    });

    handleModalClose();
  };

  //Return boolean if a file has the alreadyExistInLS property (useMemo might be useless but idc)
  const showLocalStorageOverwriteWarning = useMemo(() => files.some((file) => file.alreadyExistInLS), [files]);

  //JSX
  return (
    <form className='import-module' onSubmit={handleImportSubmit}>
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
              {file.alreadyExistInLS && (
                <Tooltip title='This file will replace the existing module!' placement='bottom' arrow>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <IoWarning color='rgb(241, 196, 15)' fontSize='1.4rem' />
                  </div>
                </Tooltip>
              )}
              <button type='button' className='file-remove-btn' data-id={file.id} onClick={handleRemoveFile}>
                <IoCloseOutline className='file-remove-icon' />
              </button>
            </li>
          );
        })}
      </ul>
      <WarningMessage showWarning={showLocalStorageOverwriteWarning} />
      <ImportModuleButton filesLength={files.length} />
    </form>
  );
};

/* ------------------------------------------- Error Messages ----------------------------------- */
//Render warning
const WarningMessage = React.memo(({ showWarning }: { showWarning: boolean }) => {
  return (
    <>
      {showWarning && (
        <div className='import-module-warnings'>
          <p style={{ fontSize: "16px" }}>
            Importing an existing module will replace that module with the imported one!
          </p>
        </div>
      )}
    </>
  );
});

/* ------------------------------------------Import Module Button ------------------------------- */
const ImportModuleButton = React.memo(({ filesLength }: { filesLength: number }) => {
  return (
    //Disabling is not handled on the disabled prop because the warning should show onClick
    <button type='submit' className={`import-module-btn ${filesLength > 0 ? "enabled" : "disabled"}`}>
      Import
    </button>
  );
});

/* ------------------------------- Success message for the toast -------------------------------- */
const ImportSuccessMessage = ({ id }: { id: IFile["id"] }) => {
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

/* ------------------------------- Error message for the toast ---------------------------------- */
//TODO make this interface more dynamic
const ImportErrorMessage = ({ errorMessage }: { errorMessage: Error["message"] }) => {
  return (
    <>
      <p>Failed to import the module.</p>
      <p>{errorMessage}</p>
    </>
  );
};
