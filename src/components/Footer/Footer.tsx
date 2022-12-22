import { Link } from "react-router-dom";

import { navbarCategories } from "../Sidebar/Categories";

//CSS
import "./Footer.css";

export const Footer = () => {
  return (
    <footer>
      <section>
        <h4>Navigation</h4>
        <ul className='footer-navigation-categories'>
          {navbarCategories.map((category) => {
            return (
              <li key={category.text.toLowerCase()}>
                <Link to={`/${category.linkTo}`}>{category.text}</Link>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h4>Rechtliches</h4>
        <ul>
          <li>
            <Link to='/legal-notice'>Impressum</Link>
          </li>
          <li>
            <Link to='/privacy'>Datenschutz</Link>
          </li>
          <li>
            <a href='https://github.com/Rllyyy/repeatio/blob/main/LICENSE' target='_blank' rel='noreferrer'>
              Lizenz
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h4>Community</h4>
        <ul className='footer-misc'>
          <li>
            <a href='https://github.com/Rllyyy/repeatio' target='_blank' rel='noreferrer'>
              GitHub
            </a>
          </li>
          <li>
            <a href='https://github.com/Rllyyy/repeatio/issues/new/choose' target='_blank' rel='noreferrer'>
              Bug melden
            </a>
          </li>
        </ul>
      </section>
    </footer>
  );
};
