import ReactSwitch from "react-switch";
import { TSettings } from "../../hooks/useSetting";

interface ISwitch<K extends keyof TSettings> {
  value: boolean;
  callback: (name: K, value: TSettings[K]) => void;
  name: K;
}

export const Switch: React.FC<ISwitch<keyof TSettings>> = ({ value, callback, name }) => {
  return (
    <ReactSwitch
      checked={value}
      onChange={() => callback(name, !value)}
      onColor='#5a5af5'
      onHandleColor='#fff'
      handleDiameter={22}
      uncheckedIcon={false}
      checkedIcon={false}
      boxShadow='rgba(0, 0, 0, 0.4) 0px 1px 3px, rgba(0, 0, 0, 0.4) 0px 1px 2px'
      activeBoxShadow='0px 0px 1px 8px rgba(0, 0, 0, 0.2)'
      height={26}
      width={46}
      id={`switch-${name}`}
    />
  );
};
