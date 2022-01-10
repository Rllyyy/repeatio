import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import isElectron from "is-electron";
import path from "path";
import "./Home.css";

//Icons
import { BsPencil, BsPlusCircle } from "react-icons/bs";
import { AiOutlinePushpin } from "react-icons/ai";
import { FaArrowRight } from "react-icons/fa";

const Home = () => {
  const [modules, setModules] = useState([]);

  //Fetch data for all modules by reading all repeatio files in documents folder / locale storage (in browser)
  useEffect(() => {
    if (isElectron()) {
      // Send a message to the main process
      window.api.request("toMain", ["getModules"]);

      // Called when message received from main process
      window.api.response("fromMain", (data) => {
        setModules(data);
      });
    } else {
      fetch(path.join(__dirname, "data.json"), { mode: "no-cors" })
        .then((res) => res.json())
        .then((jsonResponse) => setModules(jsonResponse));
    }

    return () => {
      setModules([]);
    };
  }, []);

  return (
    <>
      <div className='main-heading-wrapper'>
        <h1>Your Modules</h1>
        <div className='heading-underline'></div>
      </div>
      <div className='grid-cards'>
        {modules.map((module) => {
          const { id, name, description } = module;
          return (
            <div className='card' key={id}>
              <div className='card-info'>
                <div className='title-description-wrapper'>
                  <h3 className='card-title'>{name}</h3>
                  <p className='card-description'>{description}</p>
                </div>
                {/* <p className='card-total-questions'>Fragen: {questionsTotal}</p> */}
              </div>
              <div className='card-buttons'>
                {/* //!URL might not work with special characters (äöß/*....)*/}
                {/* <Link to={`/module/${id.split(" ").join("-").toLowerCase()}`} className='card-link'> */}
                <Link to={`/module/${id}`} className='card-link'>
                  <FaArrowRight className='buttons-arrow' />
                </Link>
                <BsPencil className='buttons-edit' />
                <AiOutlinePushpin className='buttons-pin' />
              </div>
            </div>
          );
        })}
        <div className='card-empty'>
          <BsPlusCircle className='card-empty-circle' />
          <h3>Add Module</h3>
        </div>
      </div>
    </>
  );
};

export default Home;
