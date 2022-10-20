import PropTypes from "prop-types";

export const SiteHeading = ({ title, children }) => {
  return (
    <div className='site-heading' style={{ display: "flex", alignItems: "center" }}>
      <h1
        className='title'
        style={{ marginRight: "auto", display: "inline", lineHeight: 1.4, fontSize: "28px", fontWeight: 500 }}
      >
        {title}
      </h1>
      {children}
    </div>
  );
};

SiteHeading.propTypes = {
  title: PropTypes.string.isRequired,
};
