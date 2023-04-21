import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IQuestionIdsContext, QuestionIdsContext } from "../../../module/questionIdsContext";
import { IModule } from "../../../module/module";
import { TBookmarkedQuestionID } from "./BookmarkQuestion";

//Icons
import { BiShuffle } from "react-icons/bi";
import { BsDot } from "react-icons/bs";

interface IShuffleButton {
  disabled: boolean;
  moduleID: IModule["id"] | undefined;
  questionID: TBookmarkedQuestionID | undefined;
}

export const ShuffleQuestionsButton: React.FC<IShuffleButton> = ({ disabled, moduleID, questionID }) => {
  const { setQuestionIds } = useContext<IQuestionIdsContext>(QuestionIdsContext);

  //Location (Search url=?...)
  const { search } = useLocation();
  const order = new URLSearchParams(search).get("order") || "chronological"; //Fallback to chronological order if urlSearchParams is undefined

  //navigate
  let navigate = useNavigate();

  const handleShuffleClick = () => {
    const mode = new URLSearchParams(search).get("mode") || "practice"; //Fallback to practice if urlSearchParams is undefined

    const newOrder = order === "chronological" ? "random" : "chronological";

    navigate({
      pathname: `/module/${moduleID}/question/${questionID}`,
      search: `?mode=${mode}&order=${newOrder}`,
    });

    // Invalide the ids in context to trigger a rebuild of the ids
    setQuestionIds([]);
  };

  return (
    <button
      onClick={handleShuffleClick}
      type='button'
      style={{ position: "relative" }}
      role='switch'
      aria-label={order === "chronological" ? "Enable shuffle" : "Disable shuffle"}
      aria-checked={order === "random" ? true : false}
      disabled={disabled}
    >
      <BiShuffle style={{ color: order === "random" ? "var(--custom-prime-color)" : undefined, padding: 2 }} />
      {order === "random" && (
        <BsDot
          style={{
            padding: "4px",
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translate(-55%, 40%)",
            color: "var(--custom-prime-color)",
          }}
        />
      )}
    </button>
  );
};
