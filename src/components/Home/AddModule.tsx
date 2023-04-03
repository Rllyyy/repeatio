import React, { useRef, useState, useMemo } from "react";

//Components
import { CustomModal } from "../CustomModal/CustomModal";
import { ImportModule } from "./ImportModule";
import { CreateModule } from "./CreateModule";

//hooks
import { useSize } from "../../hooks/useSize";

//CSS
import "./AddModule.css";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";

export const AddModule = () => {
  const [showModal, setShowModal] = useState(false);

  //Close modal by setting the show modal state to false
  const handleModalClose = () => {
    setShowModal(false);
  };

  //JSX
  return (
    <>
      <button className='add-module-btn' onClick={() => setShowModal(true)} type='button'>
        <p>Add Module</p>
      </button>
      {showModal && (
        <CustomModal
          handleModalClose={handleModalClose}
          title='Create or import a Module'
          desktopModalHeight='fit-content'
        >
          <ComponentChooser handleModalClose={handleModalClose} />
        </CustomModal>
      )}
    </>
  );
};

type TComponent = "create" | "import" | null;

/**
 * Render radio options to either create or import a module
 */
function ComponentChooser({ handleModalClose }: { handleModalClose: () => void }) {
  const [currentComponent, setCurrentComponent] = useState<TComponent>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);

  const controllerSize = useSize(controllerRef);

  const smallDisplay = useMemo(() => {
    if (controllerSize && controllerSize?.width <= 570) {
      return true;
    } else {
      return false;
    }
  }, [controllerSize]);

  // Update the current displayed component to
  function updateComponent(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.currentTarget;

    switch (value) {
      case "create":
        setCurrentComponent(value);
        break;
      case "import":
        setCurrentComponent(value);
        break;
      default:
        throw new Error("No matching component");
    }
  }

  //https://dribbble.com/shots/18881354-Sign-Up-Login-Screen

  return (
    <div
      className='add-module'
      style={{
        minHeight: "45vh",
        margin: "0 auto",
        width: "100%",
        height: "100%",
        maxWidth: "850px",
        display: "grid",
        gridTemplateRows: "min-content 1fr",
        gap: "1.5rem",
      }}
    >
      <FormControl sx={{ width: "100%" }} ref={controllerRef}>
        <RadioGroup
          aria-labelledby='demo-radio-buttons-group-label' //!Change this
          name='row-radio-buttons-group'
          value={currentComponent}
          onChange={updateComponent}
          row
          sx={{
            margin: "0 0 0 10px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(120px, 100%), 1fr))",
            justifyContent: "space-between",
            /* gap: if (size >=609px) 30px elseif (size >=268) 20px else 10px */
            gap:
              controllerSize && controllerSize?.width >= 609
                ? "25%"
                : controllerSize && controllerSize?.width >= 260
                ? "20px"
                : "10px",
          }}
        >
          <RadioOption component={currentComponent} optionName='create' smallDisplay={smallDisplay} />
          <RadioOption component={currentComponent} optionName='import' smallDisplay={smallDisplay} />
        </RadioGroup>
        {/* !Remove this maybe */}
        {!currentComponent && (
          <FormLabel
            id='demo-radio-buttons-group-label'
            sx={{
              marginTop: "10px",
              color: "inherit",
              "&.Mui-focused": {
                color: "inherit",
              },
            }}
          >
            Choose an Option
          </FormLabel>
        )}
      </FormControl>
      <div className='import-create-module'>
        <DisplayImportOrCreateComponent component={currentComponent} handleModalClose={handleModalClose} />
      </div>
    </div>
  );
}

interface IRadioOption {
  component: TComponent;
  optionName: TComponent;
  smallDisplay: boolean;
}

function RadioOption({ component, optionName, smallDisplay }: IRadioOption) {
  return (
    <FormControlLabel
      value={optionName}
      control={
        <Radio
          size={smallDisplay ? "small" : "medium"}
          disableRipple
          sx={{
            color: "rgb(208, 215, 222)",
            "&.Mui-checked": {
              color: "var(--custom-prime-color)",
            },
          }}
        />
      }
      label={`${optionName?.charAt(0).toUpperCase().concat(optionName.slice(1))} Module`}
      sx={{
        border: component === optionName ? "1px solid var(--custom-prime-color)" : "1px solid rgb(208, 215, 222)",
        backgroundColor: component === optionName ? "rgba(90,90,245, .05)" : "transparent",
        color: component === optionName ? "var(--custom-prime-color-dark)" : "var(--custom-secondary-color)",
        padding: smallDisplay ? "5px 5px 5px 0px" : "7px 20px 7px 10px",
        marginRight: "0",
        borderRadius: "10px",
      }}
    />
  );
}

function DisplayImportOrCreateComponent({
  component,
  handleModalClose,
}: {
  component: TComponent;
  handleModalClose: () => void;
}) {
  if (!component) {
    return <></>;
  }

  if (component === "create") {
    return <CreateModule handleModalClose={handleModalClose} />;
  }

  if (component === "import") {
    return <ImportModule handleModalClose={handleModalClose} />;
  }

  return <></>;
}
