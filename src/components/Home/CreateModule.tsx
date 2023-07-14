import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import packageJson from "../../../package.json";

//functions
import { createModuleSchema } from "./helpers";

//interfaces
import { IModule } from "../module/module";

type IModuleSchema = z.infer<typeof createModuleSchema>;

interface ICreateModule {
  handleModalClose: () => void;
}

export const CreateModule = ({ handleModalClose }: ICreateModule) => {
  //Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "module",
      lang: "",
      compatibility: packageJson.version || "",
      questions: [],
    },
  });

  //Prevent submit when hitting enter on input
  const preventSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  //Update the localStorage on form submit
  const formSubmit = (data: IModuleSchema) => {
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

  // log any errors to console
  errors && Object.keys(errors).length >= 1 && console.error(errors);

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
          {...register("id")}
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
          {...register("name")}
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
          {...register("lang")}
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
          {...register("compatibility")}
          disabled
        />
        {errors.compatibility && <p className='error-message'>{errors.compatibility?.message}</p>}
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
