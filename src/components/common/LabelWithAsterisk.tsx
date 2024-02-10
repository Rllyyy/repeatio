import { PropsWithChildren } from "react";

type AsteriskProps = {
  showAsterisk?: boolean;
};

type LabelWithAsteriskProps = React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> &
  AsteriskProps & {
    htmlFor: string;
  };

/**
 * Functional component representing a label with an optional asterisk.
 *
 * @example
 * // Example usage with asterisk
 * <LabelWithAsterisk>Required Field</LabelWithAsterisk>
 *
 * @param {boolean} props.showAsterisk - Optional params to indicate whether to show the asterisk (*) next to the label. Default = true
 */
const LabelWithAsterisk: React.FC<PropsWithChildren<LabelWithAsteriskProps>> = ({
  showAsterisk,
  children,
  ...props
}) => {
  return (
    <label {...props}>
      {children}
      <Asterisk showAsterisk={showAsterisk} />
    </label>
  );
};

const Asterisk: React.FC<AsteriskProps> = ({ showAsterisk = true }) => {
  if (!showAsterisk) return null;

  return <span style={{ fontSize: "14px", color: "red", verticalAlign: "text-top", marginLeft: "2px" }}>*</span>;
};

export default LabelWithAsterisk;
