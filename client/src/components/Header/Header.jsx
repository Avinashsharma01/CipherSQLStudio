import { Link } from 'react-router-dom';
import './Header.scss';

function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">&#60;/&#62;</span>
          <span className="header__logo-text">CipherSQLStudio</span>
        </Link>
        <nav className="header__nav">
          <Link to="/" className="header__nav-link">Assignments</Link>
          {/* TODO: maybe add a dark mode toggle here later */}
        </nav>
      </div>
    </header>
  );
}

export default Header;
