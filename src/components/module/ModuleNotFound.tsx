import { useState, useLayoutEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { IParams } from "../../utils/types";
import { IModule } from "../Home/CreateModule";

//Css
import "./ModuleNotFound.css";

//Get all items from localStorage and filter out everything that is not a module
//inspired by: https://ui.mantine.dev/category/error-pages
export const ModuleNotFound = () => {
  const { moduleID } = useParams<IParams>();
  let history = useHistory();

  return (
    <div className='module-not-found'>
      <h1>404</h1>
      <h2>Couldn't find a module with the id of: {moduleID}!</h2>
      <div className='message'>
        <p>
          The module you are trying to open does not exist. You may have mistyped the address, or the page has been
          moved to different URL. This is likely the result of deleting or renaming a module and then navigating back.
        </p>
        <p>
          If this isn't the case, please create an issue on{" "}
          <a href='https://github.com/Rllyyy/repeatio/issues' target='_blank' rel='noreferrer'>
            GitHub
          </a>
          !
        </p>
      </div>
      <div className='navigation-links'>
        <Link to={"/"} id='back-home'>
          Home
        </Link>
        <button onClick={() => history.goBack()}>Previous URL</button>
      </div>
      <UserModulesList />
    </div>
  );
};

type TOrder = "alphabetical";
type ModuleItem = Pick<IModule, "id" | "name">;

//Render list of users modules
export const UserModulesList = () => {
  const [modules, setModules] = useState<ModuleItem[]>([]);

  //Update the order of the users modules
  const updateModuleOrder = (order: TOrder) => {
    //Take all elements from the localStorage that include module and then return a new object with the id and name
    let idAndNameOfModules = Object.entries(localStorage)
      .filter(([key, _]) => key.includes("module"))
      .map(([_, value]) => {
        const { id, name } = JSON.parse(value);
        return { id, name };
      });

    //Decide how to order the modules
    //TODO add more options (caution the filter and map method from above will be called on each onChange)
    switch (order) {
      case "alphabetical":
        //sort the array alphabetically by the name prop
        idAndNameOfModules = idAndNameOfModules.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        //throw error if no condition is met
        throw new Error("Missing order value for updateModuleOrder!");
    }

    //Update state
    setModules(idAndNameOfModules);
  };

  //On initial render order the modules from the localStorage alphabetically
  useLayoutEffect(() => {
    updateModuleOrder("alphabetical");

    return () => {
      setModules([]);
    };
  }, []);

  //JSX
  return (
    <div className='user-modules'>
      <h3>Your Modules:</h3>
      <ul>
        {modules?.map(({ id, name }) => {
          return (
            <li key={`list-item-${id}`}>
              <Link to={`/module/${id}`}>
                {name} ({id})
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
