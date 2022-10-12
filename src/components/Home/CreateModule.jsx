import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import isElectron from "is-electron";
import packageJson from "../../../package.json";

//Icons
import { BsFillExclamationCircleFill } from "react-icons/bs";

//functions
import { moduleAlreadyInStorage } from "./helpers.js";

export const CreateModule = ({ handleModalClose }) => {
  //Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: "",
      name: "",
      lang: "",
      compatibility: packageJson.version,
      questions: [],
    },
  });

  //Prevent submit when hitting enter on input
  const preventSubmit = (e) => {
    if (e.code === "Enter") {
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
  const validateID = (value) => {
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

    if (spaces?.length > 0) {
      return (
        <>
          <>The ID has to be one word!</>
          <br /> Use hyphens ("-") to concat the word ({value.replace(/ /g, "-")})
        </>
      );
    }

    //4. Check for only allowed (url) characters
    //Filter out everything that is not: a-z, A-Z, 0-9, ä-Ü
    const regex = /[^a-zA-Z0-9-ß_~.\u0080-\uFFFF]/g;
    const notAllowedChars = value
      .match(regex)
      ?.map((el) => `"${el}"`)
      .join(", ");

    if (notAllowedChars?.length > 0) {
      return `The id contains non allowed characters (${notAllowedChars})`;
    }

    //5. Check if module id is duplicate
    if (moduleAlreadyInStorage({ value: value })) {
      return `ID of module ("${value}") already exists!`;
    }

    //If all check pass, return true
    return true;
  };

  //Update the localStorage on form submit
  const formSubmit = (data, event) => {
    event.preventDefault();

    //prevent using electron for this time
    //TODO add ability to use electron
    if (isElectron()) {
      toast.warn("Can't create modules in electron for this time");
      handleModalClose();
      return;
    }

    //Update localeStorage and tell the window that a new storage event occurred
    localStorage.setItem(`repeatio-module-${data.id}`, JSON.stringify(data, null, "\t"), {
      sameSite: "strict",
      secure: true,
    });
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
      <h2>Create new Module</h2>
      {/* Module ID */}
      <div className='create-module-id'>
        <label htmlFor='create-module-id-input'>ID</label>
        <input
          type='text'
          id='create-module-id-input'
          spellCheck='false'
          autoComplete='off'
          {...register("id", {
            required: "Please provide an ID for the module.",
            validate: (value) => validateID(value),
          })}
          onKeyDown={preventSubmit}
          className={`${errors.id ? "is-invalid" : ""}`}
        />
      </div>
      {/* Module Name */}
      <div className='create-module-name'>
        <label htmlFor='create-module-name-input'>Name</label>
        <input
          type='text'
          id='create-module-name-input'
          spellCheck='false'
          autoComplete='off'
          {...register("name", { required: "Please provide a name for the module." })}
          className={`${errors.name ? "is-invalid" : ""}`}
          onKeyDown={preventSubmit}
        />
      </div>
      {/* Module language */}
      <div className='create-module-language'>
        <label htmlFor='create-module-language-select'>Language</label>
        <select
          id='create-module-language-select'
          {...register("lang", {
            required: "Please select a language for the module. In the future it will be used for spellchecking.",
          })}
          className={`${errors.lang ? "is-invalid" : ""}`}
        >
          {/* language values are defined in ISO-639-1 */}
          <option value=''></option>
          <option value='de'>German</option>
          <option value='en'>English</option>
        </select>
      </div>
      {/* Compatibility Info (Version of repeatio) */}
      <div className='create-module-compatibility'>
        <label htmlFor='create-module-compatibility-input'>Compatibility Version</label>
        <input
          type='text'
          id='create-module-compatibility-input'
          spellCheck='false'
          autoComplete='off'
          {...register("compatibility", { required: "Please provide a version for the module." })}
          disabled
        />
      </div>
      {/* Errors Message */}
      <ErrorMessages errors={errors} />
      <button type='submit' className='create-module-btn'>
        Create
      </button>
    </form>
  );
};

CreateModule.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
};

/* ------------------------------------------- Error Messages ----------------------------------- */
//Render list of errors if there are any in the errors object
const ErrorMessages = ({ errors }) => {
  return (
    <>
      {Object.keys(errors).length > 0 && (
        <div className='create-module-errors'>
          <BsFillExclamationCircleFill className='create-module-errors-icon' />
          <ul className='create-module-errors-list'>
            {Object.values(errors).map((error, index) => {
              return (
                <li key={index} style={{ fontSize: "16px" }}>
                  {error.message}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

/* --------------------------------- Success message for the toast on import -------------------- */
const CreateSuccessMessage = ({ id }) => {
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

CreateSuccessMessage.propTypes = {
  id: PropTypes.string.isRequired,
};
