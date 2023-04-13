interface ISiteHeading {
  title: string;
  children?: React.ReactNode;
}

export const SiteHeading = ({ title, children }: ISiteHeading) => {
  return (
    <div className='site-heading' style={{ display: "flex", alignItems: "start" }}>
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
