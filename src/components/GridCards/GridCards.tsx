import "./GridCards.css";
import { PropsWithChildren } from "react";

export const GridCards: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className='grid-cards'>{children}</div>;
};
