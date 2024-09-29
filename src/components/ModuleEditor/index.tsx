import React from "react";
import packageJson from "../../../package.json";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

// Functions
import { parseJSON } from "../../utils/parseJSON";

// Components
import { FixedModal } from "../CustomModal/FixedModal";
import { toast } from "react-toastify";
import LabelWithAsterisk from "../common/LabelWithAsterisk";

// css
import styles from "./index.module.css";

// Interfaces
import { IParams } from "../../utils/types";
import { IModule } from "../module/module";
import { IModuleSchema, isNotDuplicate, moduleEditorSchema } from "./schema";

type ModuleEditorProps = {
  handleModalClose: () => void;
  mode: "edit" | "create";
  showModal: boolean;
  moduleId: IParams["moduleID"] | null;
  navigateOnSuccess: boolean;
};

export const ModuleEditor: React.FC<ModuleEditorProps> = ({
  handleModalClose,
  mode,
  showModal,
  moduleId,
  navigateOnSuccess,
}) => {
  return (
    <FixedModal showModal={showModal} handleModalClose={handleModalClose} title='Edit Module'>
      <ModuleEditorForm
        moduleId={moduleId}
        handleModalClose={handleModalClose}
        mode={mode}
        navigateOnSuccess={navigateOnSuccess}
      />
    </FixedModal>
  );
};

function getValues(moduleId: IParams["moduleID"] | null) {
  // Get module from localStorage
  const module = localStorage.getItem(`repeatio-module-${moduleId}`);
  const moduleJSON = parseJSON<IModuleSchema>(module);

  if (moduleJSON !== undefined && moduleJSON !== null) {
    // Return the module (with the type for older versions of repeatio)
    return Object.assign({}, { type: "module", compatibility: "0.4.0" }, moduleJSON);
    //return moduleJSON as IModuleSchema;
  } else {
    console.error("Failed to fetch module");
    const obj: IModuleSchema = {
      id: "",
      name: "",
      type: "module",
      lang: "" as "en" | "de",
      compatibility: packageJson.version,
      questions: [],
    };
    return obj;
  }
}

function getDefaultValues(): IModuleSchema {
  return {
    id: "",
    name: "",
    type: "module",
    lang: "" as "en" | "de",
    compatibility: packageJson.version,
    questions: [],
  };
}

interface IModuleEditorFormBasicProps {
  handleModalClose: () => void;
  navigateOnSuccess: boolean;
}

interface IModuleEditorFormEdit extends IModuleEditorFormBasicProps {
  mode: "edit";
  moduleId: IParams["moduleID"] | null;
}

interface IModuleEditorFormCreate extends IModuleEditorFormBasicProps {
  mode: "create";
}

type IModuleEditorForm = IModuleEditorFormEdit | IModuleEditorFormCreate;

export const ModuleEditorForm: React.FC<IModuleEditorForm> = (props) => {
  //Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      moduleEditorSchema.refine(
        (data) => {
          // Check if the module id already exists when creating a new module
          if (props.mode === "create") {
            return isNotDuplicate(data.id);
          }

          // Check if the id already exists if changing the id
          if (props.mode === "edit" && props.moduleId !== data.id) {
            return isNotDuplicate(data.id);
          }

          return true;
        },
        (data) => ({ path: ["id"], message: `ID of module ("${data.id}") already exists!` })
      )
    ),
    // although this isn't an async function, there a type errors if using just the anonymous function
    defaultValues: props.mode === "edit" ? async () => getValues(props.moduleId) : async () => getDefaultValues(),
  });

  // navigate
  let navigate = useNavigate();

  //Prevent submit when hitting enter on input
  const preventSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Update the localStorage on form submit //IModuleSchema
  const formSubmit = (data: IModuleSchema) => {
    if (props.mode === "edit") {
      // delete old item
      localStorage.removeItem(`repeatio-module-${props.moduleId}`);

      //Update localeStorage and tell the window that a new storage event occurred
      localStorage.setItem(`repeatio-module-${data.id}`, JSON.stringify(data, null, "\t"));

      // Update bookmarked localStorage
      const oldValue = localStorage.getItem(`repeatio-marked-${props.moduleId}`);

      //Update bookmarked file if the id was edited
      if (oldValue && props.moduleId !== data.id) {
        // Update property id
        const value = JSON.parse(oldValue);

        localStorage.removeItem(`repeatio-marked-${props.moduleId}`);

        localStorage.setItem(`repeatio-marked-${data.id}`, JSON.stringify({ ...value, id: data.id }, null, "\t"));
      }

      if (props.navigateOnSuccess) navigate(`/module/${data.id}`, { replace: true, state: { name: data.name } });

      window.dispatchEvent(new Event("storage"));
    } else {
      //Update localeStorage and tell the window that a new storage event occurred
      localStorage.setItem(`repeatio-module-${data.id}`, JSON.stringify(data, null, "\t"));
      window.dispatchEvent(new Event("storage"));

      //Show toast on successful module creation
      toast.success(<CreateSuccessMessage id={data.id} name={data.name} />, {
        autoClose: 12000,
        closeOnClick: true,
        data: `Created ${data.id}`,
      });
    }

    props.handleModalClose();
  };

  // log any errors to console
  errors && Object.keys(errors).length >= 1 && console.error(errors);

  //JSX
  return (
    <form className={styles["module-editor"]} onSubmit={handleSubmit(formSubmit)}>
      {/* Module ID */}
      <div className='module-editor-id'>
        <LabelWithAsterisk htmlFor='module-editor-id-input'>ID</LabelWithAsterisk>
        <input
          type='text'
          id='module-editor-id-input'
          spellCheck='false'
          autoComplete='off'
          {...register("id")}
          onKeyDown={preventSubmit}
          style={errors.id ? { borderColor: "rgb(231, 76, 60)", backgroundColor: "rgba(231, 76, 60, 0.08)" } : {}}
          aria-invalid={!!errors.id}
        />
        {errors.id && (
          <p className={styles["error-message"]} data-cy='error-message'>
            {errors.id?.message}
          </p>
        )}
      </div>
      {/* Module Name */}
      <div className='module-editor-name'>
        <LabelWithAsterisk htmlFor='module-editor-name-input'>Name</LabelWithAsterisk>
        <input
          type='text'
          id='module-editor-name-input'
          spellCheck='false'
          autoComplete='off'
          {...register("name")}
          style={errors.name ? { borderColor: "rgb(231, 76, 60)", backgroundColor: "rgba(231, 76, 60, 0.08)" } : {}}
          aria-invalid={!!errors.name}
          onKeyDown={preventSubmit}
        />
        {errors.name && (
          <p className={styles["error-message"]} data-cy='error-message'>
            {errors.name?.message}
          </p>
        )}
      </div>
      {/* Module language */}
      <div className='module-editor-language'>
        <LabelWithAsterisk htmlFor='module-editor-language-select'>Language</LabelWithAsterisk>
        <select
          id='module-editor-language-select'
          {...register("lang")}
          style={errors.lang ? { borderColor: "rgb(231, 76, 60)", backgroundColor: "rgba(231, 76, 60, 0.08)" } : {}}
          aria-invalid={!!errors.lang}
        >
          {/* language values are defined in ISO-639-1 */}
          <option value=''></option>
          <option value='en'>English</option>
          <option value='de'>German</option>
        </select>
        {errors.lang && (
          <p className={styles["error-message"]} data-cy='error-message'>
            {errors.lang?.message}
          </p>
        )}
      </div>
      {/* Compatibility Info (Version of repeatio) */}
      <div className='module-editor-compatibility'>
        <label htmlFor='module-editor-compatibility-input'>Compatibility Version</label>
        <input
          type='text'
          id='module-editor-compatibility-input'
          style={
            errors.compatibility
              ? { borderColor: "rgb(231, 76, 60)", backgroundColor: "rgba(231, 76, 60, 0.08)" }
              : { backgroundColor: "whitesmoke" }
          }
          aria-invalid={!!errors.compatibility}
          spellCheck='false'
          autoComplete='off'
          {...register("compatibility")}
          disabled
        />
        {errors.compatibility && (
          <p className={styles["error-message"]} data-cy='error-message'>
            {errors.compatibility?.message}
          </p>
        )}
      </div>
      <button type='submit' className={styles["module-editor-btn"]} disabled={Object.keys(errors).length >= 1}>
        {props.mode === "edit" ? "Update" : "Create"}
      </button>
    </form>
  );
};

/* ----------------------- Success message for the toast on module creation -------------------- */
interface ICreateSuccessMessage {
  id: IModule["id"];
  name: IModule["name"];
}

const CreateSuccessMessage: React.FC<ICreateSuccessMessage> = ({ id, name }) => {
  return (
    <>
      <p>
        Successfully created{" "}
        <b>
          <Link to={`/module/${id}`} state={{ name }}>
            {id}
          </Link>
        </b>
        .
      </p>
      <p>Click on the ID to view the module.</p>
    </>
  );
};
