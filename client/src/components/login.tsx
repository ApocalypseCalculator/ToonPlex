import * as React from "react";
import * as axios from "axios";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../util/session";

export const Login = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);

    if(session.data.token) {
        nav("/");
    }

    let [username, setUsername] = React.useState("");
    let [pwd, setPwd] = React.useState("");
    let [logging, setLogging] = React.useState(false);
    let [err, setErr] = React.useState("");

    React.useEffect(() => {
        document.body.style.backgroundColor = "#007bff";
        document.body.style.background = "linear-gradient(to right, #0062E6, #33AEFF)";
        return () => {
            document.body.style.backgroundColor = "";
            document.body.style.background = "";
        }
    }, []);

    function login(e: React.SyntheticEvent) {
        e.preventDefault();
        setLogging(true);
        axios.default.post('/api/user/login', {
            username: username,
            password: pwd
        }).then((res) => {
            if (res.data.token) {
                session.updateData({
                    username: res.data.username,
                    token: res.data.token
                });
                nav("/");
            }
            else {
                setErr(res.data.error);
                setLogging(false);
            }
        }).catch(err => {
            setErr(err.response.data.error);
            setLogging(false);
        });
    }

    return (
        <div className={"login"}>
            <div className={"row"}>
                <div className={"col-sm-9 col-md-7 col-lg-5 mx-auto"}>
                    <div className={"card card-signin my-5"}>
                        <div className={"card-body"}>
                            <h5 className={"card-title text-center"}>Sign In</h5>
                            <form className={"form-signin"}>
                                <div className={"form-label-group loginformlblgrp"}>
                                    <input type={"username"} id="username" className={"form-control"} name={"username"}
                                        placeholder={"Username"} required={true} autoFocus={true} onChange={text => {
                                            setUsername(text.target.value);
                                        }}></input>
                                    <label htmlFor={"username"}>Username</label>
                                </div>
                                <div className={"form-label-group loginformlblgrp"}>
                                    <input type={"password"} id={"password"} className={"form-control"} name={"password"}
                                        placeholder={"Password"} required={true} onChange={text => {
                                            setPwd(text.target.value);
                                        }}></input>
                                    <label htmlFor={"password"}>Password</label>
                                </div>
                                <br></br>
                                {err !== "" ? <p style={{ textAlign: "center" }}>Error: {err}</p> : <></>}
                                <button className={"btn btn-lg btn-primary btn-block text-uppercase"} type={"submit"} disabled={logging} onClick={login}>Sign
                                    in</button>
                                <hr className={"my-4"}></hr>
                                <p style={{ textAlign: "center" }}>Don't have an account? <a href={"/login"} onClick={(ev) => {
                                    ev.preventDefault();
                                    nav("/register");
                                }}>Register</a> instead</p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* too lazy to restructure this, throw login.css into public to be served statically */}
            <link rel="stylesheet" href="/login.css" as="style"></link>
        </div>
    )
}