import { Link } from "react-router-dom";
import "./Home.css";
import { BsPencil, BsPlusCircle } from "react-icons/bs";
import { AiOutlinePushpin } from "react-icons/ai";
import { FaArrowRight } from "react-icons/fa";

const data = [
  {
    title: "Title",
    description: "This is the description of a cart that is longer than one line",
    questionsTotal: 9,
  },
  {
    title: "Title that is too long for one line",
    description: "This is the description of a cart that is longer than one line",
    questionsTotal: 150,
  },
  {
    title: "Title 2",
    description: "This is the description of a cart that is longer than one line",
    questionsTotal: 9,
  },
  {
    title: "Title that is too long for one line 2",
    description: "This is the description of a cart that is longer than one line",
    questionsTotal: 9,
  },
];

function Home() {
  return (
    <>
      <div className='main-heading-wrapper'>
        <h1>Your Modules</h1>
        <div className='heading-underline'></div>
      </div>
      <div className='grid-cards'>
        {data.map((item) => {
          const { title, description, questionsTotal } = item;
          return (
            <div className='card' key={title}>
              <div className='card-info'>
                <div className='title-description-wrapper'>
                  <h3 className='card-title'>{title}</h3>
                  <p className='card-description'>{description}</p>
                </div>
                <p className='card-total-questions'>Fragen: {questionsTotal}</p>
              </div>
              <div className='card-buttons'>
                {/* //!URL might not work with special characters (äöß/*....)*/}
                <Link to={`/module/${title.split(" ").join("-").toLowerCase()}`} className='card-link'>
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
}

export default Home;
