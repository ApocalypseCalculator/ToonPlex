import * as React from "react";
import { useNavigate, Link } from "react-router-dom";

import { SessionContext } from "../util/session";

export const NavBar = () => {
    const nav = useNavigate();

    const session = React.useContext(SessionContext);

    const [tokenInp, setTokenInp] = React.useState("");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link to="/" className="navbar-brand">Home</Link>
            <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navb">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navb">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/blog">Blog</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/timeline">Timeline</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/PatrickLin_Resume.pdf" target="_blank" rel="noopener noreferrer">Resume</Link>
                    </li>
                </ul>
                <ul className={"navbar-nav ml-auto"}>
                    <li className={"nav-item"}>
                        <span id={"navbaruser"}>
                            {
                                session.token !== "" ? <>
                                    <a className={"nav-link dropdown-toggle"} href={"#"} data-toggle={"dropdown"}>
                                        Signed in
                                    </a>
                                    <div className={"dropdown-menu dropdown-menu-right"}>
                                        <a className={"dropdown-item"} href={"#"} onClick={(ev) => {
                                            ev.preventDefault();
                                            session.updateToken("");
                                            // window.location.reload();
                                        }}>Logout</a>
                                    </div>
                                </> :
                                    <>
                                    <form className="form-inline">
                                        <input type="text" className="form-control"
                                        placeholder="Enter your token"
                                        onChange={text => {
                                            setTokenInp(text.target.value);
                                        }}>
                                        </input>
                                        <button type="submit"
                                            className="btn btn-primary" onClick={(ev) => {
                                                ev.preventDefault();
                                                session.updateToken(tokenInp);
                                            }}>
                                                Save
                                        </button>
                                    </form></>
                            }
                        </span>
                    </li>
                </ul>
            </div>
        </nav>
    );
}