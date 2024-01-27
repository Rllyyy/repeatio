import { DeleteConfirmationModal } from "@components/CustomModal/DeleteConfirmationModal";
import { PropsWithChildren, memo, useState } from "react";
import styles from "./settings.module.css";
import { CircularBarsSpinner } from "@components/Spinner";

export const DeleteAllFiles = () => {
  const handleDeleteAllData = () => {
    // Delete all localStorage items starting with "repeatio-"
    // Could also use localStorage.clear but this would delete all items in the localStorage for this url which is annoying for development where the url is often localhost:3000
    Object.keys(localStorage)
      .filter((key) => key.startsWith("repeatio-"))
      .forEach((key) => {
        localStorage.removeItem(key);
      });

    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  return (
    <DeleteItem
      heading='Delete all Files'
      subHeading='Delete all local files including modules, bookmarked questions and settings. This action can not be undone.'
      modalMessage='Are you sure you want to delete all files including modules, bookmarked questions and settings? This action can not be undone.'
      onDeleteConfirmation={handleDeleteAllData}
    />
  );
};

export const DeleteAllModules = () => {
  const [checked, setChecked] = useState(true);

  const handleDeleteAllModules = () => {
    if (checked) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("repeatio-module-") || key.startsWith("repeatio-marked-"))
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    } else {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("repeatio-module-"))
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    }
  };

  return (
    <DeleteItem
      heading='Delete all Modules'
      subHeading='Delete all modules. This action can not be undone.'
      modalMessage='Are you sure you want to delete all modules? This action can not be undone..'
      buttonAriaLabel={checked ? "Delete all modules and bookmarked files" : "Delete all modules"}
      onDeleteConfirmation={handleDeleteAllModules}
    >
      <div className='flex flex-row gap-2 align-baseline'>
        <input
          type='checkbox'
          id='deleteBookmarkedFilesWithModules'
          checked={checked}
          onChange={() => setChecked(!checked)}
          aria-label='Also delete the bookmarked files'
        />
        <label className='text-base text-slate-600' htmlFor='deleteBookmarkedFilesWithModules'>
          Delete bookmarked questions file
        </label>
      </div>
    </DeleteItem>
  );
};

export const DeleteBookmarkedFiles = () => {
  const deleteBookmarkedFiles = () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("repeatio-marked-"))
      .forEach((key) => {
        localStorage.removeItem(key);
      });

    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  return (
    <DeleteItem
      heading='Delete Bookmarked Files'
      subHeading='Delete files containing the ids of the bookmarked questions. This action can not be undone.'
      modalMessage='Are you sure you want to delete the bookmarked files? This action can not be undone.'
      onDeleteConfirmation={deleteBookmarkedFiles}
    />
  );
};

export const DeleteSettings = () => {
  const handleDeleteSettings = () => {
    localStorage.removeItem("repeatio-settings");
    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  return (
    <DeleteItem
      heading='Delete Settings'
      subHeading='Delete settings file and reset all settings to their default values'
      modalMessage='Are you sure you want to delete the settings? This action can not be undone.'
      onDeleteConfirmation={handleDeleteSettings}
    />
  );
};

type IDeleteItem = {
  heading: string;
  subHeading: string;
  modalMessage: string;
  onDeleteConfirmation: () => void;
  buttonAriaLabel?: string;
};

export const DeleteItem: React.FC<PropsWithChildren<IDeleteItem>> = memo(
  ({ heading, subHeading, modalMessage, onDeleteConfirmation, children, buttonAriaLabel }) => {
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
      setShowDeleteConfirmationModal(false);
      setLoading(true);
      onDeleteConfirmation();

      await new Promise((resolve) => setTimeout(resolve, 800));

      setLoading(false);
    };

    return (
      <form className={styles.categoryItem}>
        <p className={styles.settingName}>{heading}</p>
        <button
          className='relative self-center col-start-2 row-start-1 row-end-4 px-4 py-2 text-sm font-semibold text-red-700 transition-colors duration-100 ease-in-out border rounded cursor-pointer bg-slate-50 hover:bg-red-700 hover:border-red-700 hover:text-white border-slate-200'
          type='button'
          aria-label={buttonAriaLabel ?? heading}
          onClick={() => setShowDeleteConfirmationModal(true)}
          name={heading.toLowerCase().replaceAll(" ", "-")}
        >
          <span className={loading ? "text-transparent" : ""} style={{ fontSize: "inherit" }}>
            Delete
          </span>
          {loading && <CircularBarsSpinner size='m' />}
        </button>
        <p className={styles.settingDescription}>{subHeading}</p>
        {children}
        <DeleteConfirmationModal
          deleteButtonText={heading}
          handleCloseModal={() => setShowDeleteConfirmationModal(false)}
          showModal={showDeleteConfirmationModal}
          message={modalMessage}
          onConfirmDelete={handleDelete}
          title={`${heading}?`}
        />
      </form>
    );
  }
);
