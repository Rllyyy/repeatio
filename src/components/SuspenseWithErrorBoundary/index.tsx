import { PropsWithChildren, Suspense, SuspenseProps } from "react";
import { ErrorBoundary, ErrorBoundaryProps, FallbackProps } from "react-error-boundary";
import { CircularTailSpinner } from "../Spinner";
import { Link, useNavigate } from "react-router-dom";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";

// CSS
import styles from "./index.module.css";

// Icons
import { FaHome } from "react-icons/fa";
import { MdEmail, MdExpandMore, MdRefresh } from "react-icons/md";
import { AiOutlineGithub } from "react-icons/ai";

interface ISuspenseWithErrorBoundary {
  errorBoundaryProps?: ErrorBoundarySharedProps | ErrorBoundaryProps;
  suspenseProps?: SuspenseProps;
}

export const SuspenseWithErrorBoundary: React.FC<PropsWithChildren<ISuspenseWithErrorBoundary>> = ({
  children,
  errorBoundaryProps,
  suspenseProps,
}) => {
  let defaultErrorBoundaryProps = errorBoundaryProps as ErrorBoundaryProps;

  // Use default spinner if no fallback is passed
  const defaultSuspenseProps: SuspenseProps = {
    fallback: <CircularTailSpinner />,
    ...suspenseProps,
  };

  // Add the default Fallback component if no fallback, FallbackComponent or fallbackRender is passed
  if (
    !defaultErrorBoundaryProps?.fallback &&
    !defaultErrorBoundaryProps?.FallbackComponent &&
    !defaultErrorBoundaryProps?.fallbackRender
  ) {
    defaultErrorBoundaryProps = {
      FallbackComponent: DefaultFallbackComponent,
      ...(errorBoundaryProps as ErrorBoundarySharedProps),
    };
  }

  return (
    <ErrorBoundary {...defaultErrorBoundaryProps}>
      <Suspense {...defaultSuspenseProps}>{children}</Suspense>
    </ErrorBoundary>
  );
};

const DefaultFallbackComponent: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  // Reload page
  const refreshPage = () => {
    navigate(0);
  };

  //JSX
  return (
    <div className={styles.error}>
      <p style={{ color: "#4b5563", fontWeight: 500, fontSize: "larger" }}>Something went Wrong!</p>
      <h1 className={styles["error-heading"]}>
        {error.name}: {error.message}
      </h1>
      <p className={styles["error-message"]}>
        Try reloading this page. If this issue persists, please{" "}
        <a href='mailto:contact@repeatio.de'>contact a developer</a> (contact@repeatio.de) or{" "}
        <a
          href='https://github.com/Rllyyy/repeatio/issues/new?assignees=Rllyyy&labels=bug&projects=&template=bug_report.md&title=%5BBUG%5D+'
          target='_blank'
          rel='noreferrer'
        >
          create an issue on GitHub
        </a>
        . Please attach the Error Stack from below in your message and describe how the error ocurred.
      </p>
      <Accordion
        sx={{ backgroundColor: "lightgray", boxShadow: "none", width: "100%", borderRadius: "4px" }}
        disableGutters={true}
      >
        <AccordionSummary expandIcon={<MdExpandMore size='32px' />} aria-controls='panel-content' id='panel1a-header'>
          <Typography sx={{ fontWeight: "600", fontSize: "larger" }}>View Error Stack</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            component='pre'
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "Consolas,monospace" }}
          >
            {error.stack}
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* Reload page */}
      <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" }}>
        {/* Navigate home */}
        <Link to={"/"} id='back-home' className={styles["error-actions"]}>
          <FaHome size='24px' />
          <span style={{ lineHeight: 1 }}>Home</span>
        </Link>
        {/* Refresh page */}
        <button type='button' onClick={refreshPage} className={styles["error-actions"]}>
          <MdRefresh size={24} />
          <span>Reload Page</span>
        </button>
        {/* Create Issue on GitHub */}
        <a
          href='https://github.com/Rllyyy/repeatio/issues/new?assignees=Rllyyy&labels=bug&projects=&template=bug_report.md&title=%5BBUG%5D+'
          target='_blank'
          rel='noreferrer'
          className={styles["error-actions"]}
        >
          <AiOutlineGithub size={24} />
          <span>Create issue on GitHub</span>
        </a>
        {/* Contact through Email */}
        <a href='mailto:contact@repeatio.de' className={styles["error-actions"]}>
          <MdEmail size={24} />
          <span>Write E-Mail</span>
        </a>
      </div>
    </div>
  );
};

// This type is from react-error-boundary but doesn't get exported
type ErrorBoundarySharedProps = {
  onError?: (
    error: Error,
    info: {
      componentStack: string;
    }
  ) => void;
  onReset?: (
    details:
      | {
          reason: "imperative-api";
          args: any[];
        }
      | {
          reason: "keys";
          prev: any[] | undefined;
          next: any[] | undefined;
        }
  ) => void;
  resetKeys?: any[];
};

/* const LoadingComponent = () => {
  throw new Promise(() => {});

};

const ErrorComponent = () => {
  throw new Error("Uncaught Promise in ");
}; */
