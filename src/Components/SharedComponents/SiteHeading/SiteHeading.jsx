import "./SiteHeading.css";
import PropTypes from "prop-types";

const SiteHeading = ({ title, children }) => {
  return (
    <div className='site-heading'>
      <h1 className='title'>{title}</h1>
      {children}
    </div>
  );
};

SiteHeading.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SiteHeading;
