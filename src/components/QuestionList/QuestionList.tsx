/*
Credits:
- https://docs.dndkit.com/presets/sortable
- https://docs.dndkit.com/api-documentation/draggable/drag-overlay#wrapper-nodes
- https://codesandbox.io/p/sandbox/dnd-kit-sortable-starter-template-22x1ix?file=%2Fsrc%2Fcomponents%2FSortableList%2Fcomponents%2FSortableItem%2FSortableItem.tsx
*/

//React
import { useEffect, memo, useReducer, useState, forwardRef, PropsWithChildren } from "react";
import { parseJSON } from "../../utils/parseJSON";
import { useParams, Link } from "react-router-dom";
// import { motion } from "framer-motion";

//Components
import { CircularTailSpinner } from "../Spinner";
import { ModuleNotFound } from "../module/ModuleNotFound";

// Reducer
import { ActionTypes, defaultState, reducer } from "./QuestionListReducer";

//Icons
import { IoIosArrowForward } from "react-icons/io";
// import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";

// DnD
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

//Types & Interfaces
import { IParams } from "../../utils/types";
import { IModule } from "../module/module";
import { IQuestion } from "../Question/useQuestion";
import { MdOutlineDragIndicator } from "react-icons/md";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export const QuestionList = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Reducer
  const [{ questions, error, loading }, dispatch] = useReducer(reducer, defaultState);

  //Params
  const { moduleID } = useParams<IParams>();

  /* UseEffects */
  /* Fetch the questions from the localStorage and set the questions */
  useEffect(() => {
    dispatch({ type: ActionTypes.FETCH, payload: { moduleId: moduleID } });

    return () => {
      dispatch({ type: ActionTypes.RESET });
    };
  }, [moduleID]);

  // Update the localStorage if the order of the question changes
  useEffect(() => {
    if (moduleID && questions.length >= 1) {
      const module = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${moduleID}`));
      const updatedModule = { ...module, questions: questions };
      localStorage.setItem(`repeatio-module-${moduleID}`, JSON.stringify(updatedModule, null, "\t"));
    }

    return () => {};
  }, [questions, moduleID]);

  // Move the question up
  /*  const handleMoveQuestionUp = useCallback((index: number) => {
    dispatch({ type: ActionTypes.MOVE_UP, payload: { index } });
  }, []); */

  // Move the question down
  /* const handleMoveQuestionDown = useCallback((index: number) => {
    dispatch({ type: ActionTypes.MOVE_DOWN, payload: { index } });
  }, []); */

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      dispatch({ type: ActionTypes.MOVE, payload: { activeId: active.id, overId: over.id } });
    }

    setActiveId(null);
  };

  if (loading) {
    return <CircularTailSpinner />;
  }

  if (error) {
    return <ModuleNotFound />;
  }

  return (
    <div className='relative w-full mt-4 mb-24'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={questions.map((question) => question.id)} strategy={verticalListSortingStrategy}>
          <div className='flex flex-col gap-y-2'>
            {questions.map((question, index) => {
              const { id, title } = question;
              return (
                <DragAndDropItem questionId={id} key={id} questionTitle={title} moduleId={moduleID} index={index} />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false}>
          {activeId ? (
            <BaseDragAndDropItem
              moduleId={moduleID}
              questionId={activeId as string}
              questionTitle={questions.find((question) => question.id === activeId)?.title}
              index={questions.findIndex((question) => question.id === activeId)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  // TODO reimplement sort by button
  /*  return (
    <div className='relative w-full mt-4 mb-24 flex flex-col gap-y-2'>
      {questions?.map((question, index) => {
        const { id, title } = question;
        return (
          <OrderWithButton
            key={`question-${id}`}
            questionId={id}
            questionTitle={title}
            moduleId={moduleID}
            index={index}
            handleMoveQuestionDown={handleMoveQuestionDown}
            handleMoveQuestionUp={handleMoveQuestionUp}
          />
        );
      })}
    </div>
  ); */
};

type DragAndDropItemType = BaseComponentProps;

const DragAndDropItem = memo(({ questionId, moduleId, questionTitle, index }: DragAndDropItemType) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: questionId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <BaseDragAndDropItem
      moduleId={moduleId}
      questionId={questionId}
      questionTitle={questionTitle}
      index={index}
      ref={setNodeRef}
      {...attributes}
      style={style}
      listeners={listeners}
      cy-data='question'
      id={`question-${questionId}`}
    />
  );
});

type ItemType = React.ComponentPropsWithRef<"div"> &
  BaseComponentProps & {
    listeners?: SyntheticListenerMap | undefined;
  };

export const BaseDragAndDropItem = forwardRef<HTMLDivElement, ItemType>(
  ({ moduleId, questionId, questionTitle, index, listeners, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className='grid sm:grid-cols-[min-content_1fr_max-content_max-content_max-content] grid-cols-[min-content_1fr_3rem_max-content] items-center justify-center text-lg min-h-[5rem]  bg-white rounded-md border border-gray-200 cursor-default pl-1'
      >
        <BaseComponent moduleId={moduleId} questionId={questionId} questionTitle={questionTitle} index={index}>
          <button
            className='p-1 transition-colors duration-200 rounded-lg sm:px-1 sm:py-2 cursor-grab touch-none hover:bg-gray-100'
            {...listeners}
            aria-label='Drag to reorder'
            type='button'
            cy-data='drag-handle'
          >
            <MdOutlineDragIndicator className='size-6' />
          </button>
        </BaseComponent>
      </div>
    );
  }
);

/*
type OrderWithButtonProps = BaseComponentProps & {
  handleMoveQuestionDown: (index: number) => void;
  handleMoveQuestionUp: (index: number) => void;
  index: number;
};

const OrderWithButton: React.FC<OrderWithButtonProps> = ({
  questionId,
  moduleId,
  index,
  questionTitle,
  handleMoveQuestionDown,
  handleMoveQuestionUp,
}) => {
  return (
    <motion.div
      id={`question-${questionId}`}
      layout
      style={{ position: "relative" }}
      className='grid sm:grid-cols-[min-content_1fr_max-content_max-content_max-content] grid-cols-[min-content_1fr_3rem_max-content] items-center justify-center text-lg min-h-[5rem]  bg-white rounded-md border border-gray-200 cursor-default pl-1'
    >
      <BaseComponent moduleId={moduleId} questionId={questionId} questionTitle={questionTitle} index={index}>
        <div className='flex flex-col justify-center items-center mx-2 text-gray-300'>
          <button
            style={{ backgroundColor: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            onClick={() => handleMoveQuestionUp(index)}
            aria-label={`Move ${questionId} up`}
            type='button'
          >
            <BsFillCaretUpFill className='size-5' />
          </button>
          <button
            style={{ backgroundColor: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            onClick={() => handleMoveQuestionDown(index)}
            aria-label={`Move ${questionId} down`}
            type='button'
          >
            <BsFillCaretDownFill className='size-5' />
          </button>
        </div>
      </BaseComponent>
    </motion.div>
  );
};
*/

type BaseComponentProps = {
  questionId: IQuestion["id"];
  questionTitle: IQuestion["title"];
  moduleId: IParams["moduleID"];
  index: number;
};

const BaseComponent: React.FC<PropsWithChildren<BaseComponentProps>> = memo(
  ({ questionId, questionTitle, moduleId, index, children }) => {
    return (
      <>
        {children}
        <span className='sm:px-0.5 font-medium truncate' cy-data='title'>
          {index + 1}. {questionTitle}
        </span>
        <span className='hidden pl-1 pr-2 sm:inline' style={{ fontSize: "16px" }} cy-data='id'>
          {questionId}
        </span>
        <span className='flex px-0.5 justify-around w-full gap-1'>
          <div className='bg-gray-200 rounded size-5' />
          <div className='bg-gray-200 rounded size-5' />
        </span>
        <Link
          className='flex h-full items-center justify-center w-10 sm:w-14 rounded outline-none text-gray-900 hover:text-prime focus-visible:shadow-[inset_0_0_0_3px_rgb(90,90,245)]'
          to={{
            pathname: `/module/${moduleId}/question/${questionId}`,
            search: `?mode=practice&order=chronological`,
          }}
        >
          <IoIosArrowForward className='size-8' />
        </Link>
      </>
    );
  }
);
