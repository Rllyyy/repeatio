import "./GridCards.css";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export const GridCards: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div layout className='grid-cards'>
      {children}
    </motion.div>
  );
};
