import "./GridCards.css";
import { motion } from "framer-motion";

export const GridCards = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div layout className='grid-cards'>
      {children}
    </motion.div>
  );
};
