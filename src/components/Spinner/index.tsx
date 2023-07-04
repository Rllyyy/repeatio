import "./Spinner.css";

//Inspired by https://youtu.be/BxpjA9t4dJE?t=629
export const CircularTailSpinner = () => {
  return (
    <div className='spinner-wrapper'>
      <div className='spinner' />
    </div>
  );
};

/* Circular Bars */

/* https://github.com/samselikoff/2022-02-09-removing-loading-spinners/blob/main/src/components/spinner.js */
const sizes = {
  s: 14,
  m: 20,
  l: 26,
};

interface ICircularBarsSpinner extends React.SVGProps<SVGSVGElement> {
  size?: keyof typeof sizes;
}

export const CircularBarsSpinner: React.FC<ICircularBarsSpinner> = ({ size = "m", ...rest }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <svg
        viewBox='0 0 2400 2400'
        width={sizes[size as keyof typeof sizes]}
        height={sizes[size as keyof typeof sizes]}
        {...rest}
      >
        <g strokeWidth={200} strokeLinecap='round' stroke='currentColor' fill='none'>
          <path d='M1200 600L1200 100' />
          <path opacity={0.5} d='M1200 2300L1200 1800' />
          <path opacity={0.917} d='M900 680.4L650 247.4' />
          <path opacity={0.417} d='M1750 2152.6L1500 1719.6' />
          <path opacity={0.833} d='M680.4 900L247.4 650' />
          <path opacity={0.333} d='M2152.6 1750L1719.6 1500' />
          <path opacity={0.75} d='M600 1200L100 1200' />
          <path opacity={0.25} d='M2300 1200L1800 1200' />
          <path opacity={0.667} d='M680.4 1500L247.4 1750' />
          <path opacity={0.167} d='M2152.6 650L1719.6 900' />
          <path opacity={0.583} d='M900 1719.6L650 2152.6' />
          <path opacity={0.083} d='M1750 247.4L1500 680.4' />
          <animateTransform
            attributeName='transform'
            attributeType='XML'
            type='rotate'
            keyTimes='0;0.08333;0.16667;0.25;0.33333;0.41667;0.5;0.58333;0.66667;0.75;0.83333;0.91667'
            values='0 1199 1199;30 1199 1199;60 1199 1199;90 1199 1199;120 1199 1199;150 1199 1199;180 1199 1199;210 1199 1199;240 1199 1199;270 1199 1199;300 1199 1199;330 1199 1199'
            dur='0.83333s'
            begin='0s'
            repeatCount='indefinite'
            calcMode='discrete'
          />
        </g>
      </svg>
    </div>
  );
};
