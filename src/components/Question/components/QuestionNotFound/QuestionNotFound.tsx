import { useParams, useNavigate } from "react-router-dom";
import { IParams } from "../../../../utils/types";

//css
import "./QuestionNotFound.css";

//Component
export const QuestionNotFound = () => {
  const params = useParams<IParams>();
  let navigate = useNavigate();

  //Go back in history
  const handleNavigateToPreviousUrl = () => {
    navigate(-1);
  };

  //
  const handleNavigateToModuleHome = () => {
    navigate(`/module/${params.moduleID}`);
  };

  const handleNavigateToViewAllQuestions = () => {
    navigate(`/module/${params.moduleID}/all-questions`);
  };

  return (
    <div className='question-not-found'>
      <h1>Question not found!</h1>
      <p className='question-not-found-text'>
        Couldn't find the question with the id of "{params.questionID}"! The question was probably deleted or the id of
        the question changed.
      </p>
      <svg
        // Source: https://www.highlights.design
        xmlns='http://www.w3.org/2000/svg'
        width='190'
        height='661'
        viewBox='0 0 190 661'
        fill='none'
        className='question-mark'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M89.5442 322.211C95.4529 304.531 110.543 278.214 115.224 270.805C115.639 270.1 115.95 269.367 116.234 268.696C116.573 267.896 116.874 267.184 117.27 266.715C118.799 264.303 120.349 261.865 121.914 259.403C137.524 234.85 154.726 207.793 168.812 179.084C170.71 175.45 172.213 171.529 173.704 167.64C173.891 167.151 174.078 166.663 174.266 166.176L174.437 165.727C176.05 161.5 177.65 157.308 178.876 152.908C180.775 148.784 182.178 144.526 183.22 140.132C183.514 138.513 183.791 136.895 184.067 135.281C184.558 132.407 185.047 129.547 185.629 126.723C186.309 124.005 186.631 121.202 186.954 118.401C187.106 117.081 187.258 115.762 187.447 114.451C187.608 112.986 187.804 111.538 187.999 110.091C188.354 107.453 188.71 104.818 188.856 102.089C189.402 93.7254 189.311 85.1805 188.311 76.5447C187.22 67.9089 185.266 59.1367 181.72 50.7281C178.311 42.3195 173.039 34.2746 166.767 27.5477C156.404 16.5484 143.314 8.95794 129.587 4.64002C115.861 0.276655 101.316 -1.04145 87.0443 0.822076C58.137 4.73093 33.5931 21.0481 15.8215 41.2741C14.6353 42.6265 13.385 43.9576 12.1285 45.2953C5.82632 52.0049 -0.632438 58.8811 0.0496964 69.4542V70.0905C-0.0428714 72.6824 1.54035 73.808 3.12133 74.932C3.86918 75.4637 4.61653 75.995 5.18577 76.681C9.18552 81.4535 12.5489 83.4079 15.3669 82.8625C18.1849 82.2716 20.4121 79.2263 23.0938 73.6812C24.2301 71.2723 26.2754 69.2724 28.2298 67.3634C29.2448 66.3276 30.397 65.1279 31.6271 63.8471C35.7408 59.5641 40.7263 54.3734 44.3652 51.3644C45.9502 49.9759 47.5353 48.4627 49.1323 46.9381C53.0764 43.1729 57.0936 39.338 61.3641 37.138C67.6364 33.8655 74.2724 31.4566 80.9992 30.0475C87.5898 28.684 94.3167 28.3204 100.953 28.9113C114.27 30.0475 127.042 34.82 136.95 42.0923C142.768 46.2738 147.495 51.319 150.995 57.2277C154.586 63.2273 157.085 70.2723 158.449 77.9991C161.267 93.4073 159.631 111.088 155.177 127.86C150.45 145.813 142.541 163.221 133.269 180.266C126.541 192.632 119.072 204.831 111.503 217.193C108.641 221.869 105.764 226.568 102.907 231.308C101.864 233.038 100.817 234.771 99.7677 236.506C89.1595 254.058 78.3471 271.947 69.4545 291.304C59.6369 312.621 52.501 335.529 51.2738 360.254C51.092 368.845 51.6828 378.026 54.4099 387.162C57.0916 396.161 61.9095 404.615 67.8183 411.57C79.8175 425.569 94.9529 434.432 109.679 441.295C122.088 446.931 132.132 443.477 135.814 433.523C138.942 425.021 130.465 420.907 124.274 417.902C123.448 417.501 122.663 417.12 121.951 416.751C112.179 411.797 102.998 406.479 95.8166 400.252C88.4988 394.071 83.7264 387.207 81.4993 379.799C79.2267 372.572 79.5448 363.345 81.3174 353.073L84.7263 337.574C85.3615 335.58 85.9693 333.587 86.5762 331.596C87.5328 328.457 88.4875 325.326 89.5442 322.211ZM130.172 603.375C131.036 603.42 131.991 603.647 132.4 603.784C132.511 603.812 132.657 603.669 132.774 603.554C132.847 603.481 132.91 603.42 132.945 603.42L133.125 603.524C134.585 604.363 136.266 605.331 137.445 606.465C138.536 607.42 139.581 608.92 139.99 611.056C140.075 611.396 140.213 611.736 140.36 612.098C140.449 612.317 140.541 612.544 140.626 612.783C140.945 613.374 141.217 614.056 141.354 614.738C140.779 615.513 141.076 616.378 141.383 617.278C141.563 617.802 141.746 618.338 141.763 618.874C141.808 621.51 140.854 624.01 139.49 625.828C138.126 627.646 136.445 628.782 134.672 629.6C131.854 631.009 127.582 630.918 123.446 629.328C120.701 628.283 118.171 626.612 116.114 624.636C116.479 623.79 116.835 622.955 117.186 622.134C118.749 618.474 120.191 615.097 121.673 612.283C123.855 607.829 126.082 605.284 127.582 604.193C128.218 603.738 129.491 603.329 130.172 603.375ZM89.2352 618.012C88.7638 618.133 88.3502 618.282 87.9933 618.465C85.9479 619.465 85.5843 621.646 87.1297 624.373C87.753 625.386 87.7753 626.599 87.7975 627.813C87.8012 628.015 87.8049 628.217 87.8114 628.419C87.9478 630.009 88.5841 632.055 89.3568 634.009C90.2658 635.827 91.2203 637.691 92.0839 638.963C93.341 640.919 95.3708 642.291 97.2552 643.564C98.4366 644.362 99.5608 645.122 100.402 645.963C105.128 650.735 110.628 654.917 117.219 657.735C123.718 660.508 131.536 661.871 139.445 660.235C148.626 658.371 157.034 652.508 161.989 645.372C167.079 638.236 169.625 630.418 170.806 622.646C171.897 614.374 171.352 605.738 168.034 597.42C164.67 589.148 157.943 581.603 150.171 577.74C145.808 575.513 141.126 573.876 136.081 573.149C131.081 572.422 125.582 572.649 120.537 574.24C115.582 575.604 110.901 578.467 107.219 581.831C103.492 585.239 100.947 589.285 99.2652 593.284C98.0132 596.241 96.7769 599.214 95.5378 602.193C94.6627 604.296 93.7862 606.404 92.902 608.511C91.5637 611.693 90.3032 614.856 89.2352 618.012Z'
          fill='black'
        />
      </svg>
      <div className='buttons'>
        <button type='button' onClick={handleNavigateToPreviousUrl} id='navigate-to-previous-url-btn'>
          <span>Try previous url</span>
        </button>
        <button type='button' onClick={handleNavigateToModuleHome} id='navigate-to-module-home-btn'>
          <span>Module Overview</span>
        </button>
        <button type='button' onClick={handleNavigateToViewAllQuestions} id='navigate-to-view-all-questions'>
          <span>All Questions</span>
        </button>
      </div>
    </div>
  );
};
