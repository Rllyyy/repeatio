import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import isElectron from "is-electron";
import packageJson from "../../../package.json";

//functions
import { moduleAlreadyInStorage } from "./helpers";

//interfaces
import { IModule } from "../module/module";

interface ICreateModule {
  handleModalClose: () => void;
}

export const CreateModule = ({ handleModalClose }: ICreateModule) => {
  //Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IModule>({
    defaultValues: {
      id: "",
      name: "",
      type: "module",
      lang: "",
      compatibility: packageJson.version,
      questions: [],
    },
  });

  //Prevent submit when hitting enter on input
  const preventSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Validate id else return with error message.
  //Runs only after first submit and after that on every onChange
  //The ID:
  // - 1. should not include word module
  // - 2. should not equal types_1
  // - 3. should not include any space character
  // - 4. should match url requirements
  // - 5. should not already exist (be unique)
  const validateID = (value: string) => {
    //1. Check if id includes the word module as it is a reserved keyword (to split the )
    if (value.includes("module")) {
      return `The word "module" is a reserved keyword and can't be used inside an ID!`;
    }

    //2. Check if id is reserved "types_1" (represents example ids)
    if (value === "types_1") {
      return `The word "${value}" is a reserved keyword!`;
    }

    //3. Filter out space character
    const spaceRegex = / /g;
    const spaces = value.match(spaceRegex)?.join("");

    if (spaces && spaces?.length > 0) {
      return `The ID has to be one word! Use hyphens ("-") to concat the word (${value.replace(/ /g, "-")})`;
      /*
      return (
        <>
          <>The ID has to be one word!</>
          <br /> Use hyphens ("-") to concat the word ({value.replace(/ /g, "-")})
        </>
      );
      */
    }

    //4. Check for only allowed (url) characters
    //Filter out everything that is not: a-z, A-Z, 0-9, ä-Ü
    const regex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;
    const notAllowedChars = value
      .match(regex)
      ?.map((el) => `"${el}"`)
      .join(", ");

    if (notAllowedChars && notAllowedChars?.length > 0) {
      return `The id contains non allowed characters (${notAllowedChars})`;
    }

    //5. Check if module id is duplicate
    if (moduleAlreadyInStorage(value)) {
      return `ID of module ("${value}") already exists!`;
    }

    //If all check pass, return true
    return true;
  };

  //Update the localStorage on form submit
  const formSubmit = (data: IModule) => {
    //prevent using electron for this time
    //TODO add ability to use electron
    if (isElectron()) {
      toast.warn("Can't create modules in electron for this time");
      handleModalClose();
      return;
    }

    //Update localeStorage and tell the window that a new storage event occurred
    localStorage.setItem(`repeatio-module-${data.id}`, JSON.stringify(data, null, "\t"));
    window.dispatchEvent(new Event("storage"));

    //Show toast on successful module creation
    toast.success(<CreateSuccessMessage id={data.id} />, {
      autoClose: 12000,
      closeOnClick: true,
      data: `Created ${data.id}`,
    });

    handleModalClose();
  };

  //JSX
  return (
    <form className='create-module' onSubmit={handleSubmit(formSubmit)}>
      {/* Module ID */}
      <div className='create-module-id'>
        <label htmlFor='create-module-id-input'>ID</label>
        <input
          type='text'
          id='create-module-id-input'
          spellCheck='false'
          autoComplete='off'
          {...register("id", {
            required: "Provide an ID for the module.",
            validate: (value) => validateID(value),
          })}
          onKeyDown={preventSubmit}
          className={`${errors.id ? "is-invalid" : ""}`}
        />
        {errors.id && <p className='error-message'>{errors.id?.message}</p>}
      </div>
      {/* Module Name */}
      <div className='create-module-name'>
        <label htmlFor='create-module-name-input'>Name</label>
        <input
          type='text'
          id='create-module-name-input'
          spellCheck='false'
          autoComplete='off'
          {...register("name", { required: "Provide a name for the module." })}
          className={`${errors.name ? "is-invalid" : ""}`}
          onKeyDown={preventSubmit}
        />
        {errors.name && <p className='error-message'>{errors.name?.message}</p>}
      </div>
      {/* Module language */}
      <div className='create-module-language'>
        <label htmlFor='create-module-language-select'>Language</label>
        <select
          id='create-module-language-select'
          {...register("lang", {
            required: "Select a language for the module..",
          })}
          className={`${errors.lang ? "is-invalid" : ""}`}
        >
          {/* language values are defined in ISO-639-1 */}
          <option value=''></option>
          <option value='en'>English</option>
          <option value='de'>German</option>
        </select>
        {errors.lang && <p className='error-message'>{errors.lang?.message}</p>}
      </div>
      {/* Compatibility Info (Version of repeatio) */}
      <div className='create-module-compatibility'>
        <label htmlFor='create-module-compatibility-input'>Compatibility Version</label>
        <input
          type='text'
          id='create-module-compatibility-input'
          spellCheck='false'
          autoComplete='off'
          {...register("compatibility", { required: "Provide a version for the module." })}
          disabled
        />
      </div>
      <button type='submit' className='create-module-btn' disabled={Object.keys(errors).length >= 1}>
        Create
      </button>
    </form>
  );
};

/* --------------------------------- Success message for the toast on import -------------------- */
const CreateSuccessMessage = ({ id }: { id: IModule["id"] }) => {
  return (
    <>
      <p>
        Successfully created{" "}
        <b>
          <Link to={`/module/${id}`}>{id}</Link>
        </b>
        .
      </p>
      <p>Click on the ID to view the module.</p>
    </>
  );
};
