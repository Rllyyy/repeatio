import "./Home.css";
import { BsPencil, BsPlusCircle } from "react-icons/bs";
import { AiOutlinePushpin, AiOutlinePlusCircle } from "react-icons/ai";
import { FaArrowRight } from "react-icons/fa";

function Home() {
  return (
    <div>
      <h2>Hello World</h2>
      <div className='grid-cards'>
        {/* Add onclick event */}
        <div className='card'>
          <div className='card-info'>
            <div className='title-description-wrapper'>
              <h3 className='card-title'>Title that is too long</h3>
              <p className='card-description'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi magnam asperiores</p>
            </div>
            <div className='updated-total-questions-wrapper'>
              <p className='card-total-questions'>Fragen: 9</p>
            </div>
          </div>
          <div className='card-buttons'>
            <FaArrowRight className='buttons-arrow' />
            <BsPencil className='buttons-edit' />
            <AiOutlinePushpin className='buttons-pin' />
          </div>
        </div>
        <div className='card'>
          <div className='card-info'>
            <div className='title-description-wrapper'>
              <h3 className='card-title'>Title</h3>
              <p className='card-description'>This is the description of a cart</p>
            </div>
            <div className='updated-total-questions-wrapper'>
              <p className='card-total-questions'>Fragen: 9</p>
            </div>
          </div>
          <div className='card-buttons'>
            <FaArrowRight className='buttons-arrow' />
            <BsPencil className='buttons-edit' />
            <AiOutlinePushpin className='buttons-pin' />
          </div>
        </div>
        <div className='card'>
          <div className='card-info'>
            <div className='title-description-wrapper'>
              <h3 className='card-title'>Title</h3>
              <p className='card-description'>This is the description of a cart</p>
            </div>
            <div className='updated-total-questions-wrapper'>
              <p className='card-total-questions'>Fragen: 9</p>
            </div>
          </div>
          <div className='card-buttons'>
            <FaArrowRight className='buttons-arrow' />
            <BsPencil className='buttons-edit' />
            <AiOutlinePushpin className='buttons-pin' />
          </div>
        </div>
        <div className='card-empty'>
          <BsPlusCircle className='card-empty-circle' />
          <h3>Add Item</h3>
        </div>
      </div>
    </div>
  );
}

export default Home;
