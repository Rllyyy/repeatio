//Components
import Card from "../../../SharedComponents/Card/Card.js";
import Spinner from "../../../SharedComponents/Spinner/Spinner.js";
import ProgressPie from "../../../SharedComponents/Card/Components/ProgressPie.jsx";

//Hooks
import useAllModules from "../hooks/useAllModules.js";

//Component
const GridCards = () => {
  const { modules, loading } = useAllModules();

  //Display loading spinner while component loads
  //TODO switch to suspense maybe (react 18)
  if (loading) {
    return <Spinner />;
  }

  //Return grid of modules and "add module" card when the component has loaded
  return (
    <>
      <div className='grid-cards'>
        {modules.map((module) => {
          const { id, name, questions, disabled } = module;
          return (
            <Card
              key={id}
              disabled={disabled}
              type='module'
              title={`${name} (${id})`}
              description={`${questions?.length} Questions`}
              icon={<ProgressPie progress={55} />}
              leftBottom={{
                type: "link",
                linkTo: `/module/${id}`,
                linkAriaLabel: `View ${name}`,
                linkText: "View",
              }}
            />
          );
        })}
      </div>
      {/* 
      //TODO display errors with react-toastify
      //Need to check length of array?
      <div className='errors'>
        {errors &&
          errors.map((error, index) => {
            return <p key={index}>{error}</p>;
          })}
      </div> */}
    </>
  );
};

export default GridCards;
