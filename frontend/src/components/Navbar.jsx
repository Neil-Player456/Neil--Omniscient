import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarData } from "../SidebarData.js";
import "../navbar.css";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
  const [sidebar, setsidbar] = useState(false);

  const { store, dispatch, getUserById } = useGlobalReducer();
  const navigate = useNavigate();

  const showSideBar = () => {
    setsidbar(!sidebar);
  };

 useEffect(() => {
  if (store.access_token && !store.user) {
    getUserById();
  }
}, [store.access_token]);
 
return (
    <>
      <div className="navbar navbar-expand-lg container-fluid d-flex align-items-center px-3">
        <div className="d-flex align-items-center">
          <Link to="#" className="menu-bars me-3" onClick={showSideBar}>
            <i className="fa-solid fa-bars"></i>
          </Link>
          <span
            className="navbar-brand mb-0"
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              color: "black",
            }}
          >
            OMNISCIENT
          </span>
        </div>
        <div className="flex-grow-1"></div>
        <div className="d-flex flex-wrap align-items-center">
          {!store.user ? (
            <>
              <Link to="/signup" className="me-2 mb-2 mb-lg-0">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
              <Link to="/login" className="me-2 mb-2 mb-lg-0">
                <button className="btn btn-primary">Log In</button>
              </Link>
            </>
          ) : (
            <button
              className="btn btn-danger me-2 mb-2 mb-lg-0"
              onClick={() => {
                dispatch({ type: "logout" });
                navigate("/must-login");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <ul className="nav-menu-items" onClick={showSideBar}>
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <i className="fa-solid fa-xmark"></i>
            </Link>
          </li>
          {SidebarData.map((item, index) => (
            <li key={index} className={item.cName}>
              <Link to={item.path}>
                <i className={item.icon}></i>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {sidebar && <div className="overlay" onClick={showSideBar}></div>}
    </>
  );
};
