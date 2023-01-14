import "katex/dist/katex.min.css";
import { IGapTextDropdown, textWithBlanks } from "./GapTextDropdown";

export const AnswerCorrection = ({ text, dropdowns }: IGapTextDropdown) => {
  return (
    <div
      className='correction-gap-text-with-dropdown'
      dangerouslySetInnerHTML={{ __html: textWithBlanks(text, "correction", dropdowns) }}
    />
  );
};
