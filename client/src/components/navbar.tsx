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
                        <Link className="nav-link" to="/directory">Directory</Link>
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
                                    <Link to={"/login"} onClick={(ev) => {
                                            ev.preventDefault();
                                            nav("/login");
                                        }}>
                                            <b>Log in</b>
                                        </Link>
                                        &nbsp;or&nbsp;
                                        <Link to={"/register"} onClick={(ev) => {
                                            ev.preventDefault();
                                            nav("/register");
                                        }}>
                                            <b>Register</b>
                                        </Link></>
                            }
                        </span>
                    </li>
                </ul>
            </div>
        </nav>
    );
}