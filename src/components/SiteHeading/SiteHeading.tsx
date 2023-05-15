import { PropsWithChildren } from "react";

interface ISiteHeading {
  title: string;
}

export const SiteHeading: React.FC<PropsWithChildren<ISiteHeading>> = ({ title, children }) => {
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
