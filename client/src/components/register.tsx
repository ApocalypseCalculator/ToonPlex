import * as React from "react";
import * as axios from "axios";
import { useNavigate } from "react-router-dom";
import { SessionContext } from "../util/session";
// reusing code from old codebases :)

export const Register = () => {
    const nav = useNavigate();
    const session = React.useContext(SessionContext);

    if(session.data.token) {
        nav("/");
    }

    let [username, setUsername] = React.useState("");
    let [pwd1, setPwd1] = React.useState("");
    let [pwd2, setPwd2] = React.useState("");
    let [registering, setRegistering] = React.useState(false);
    let [err, setErr] = React.useState("");
    let [userid, setUserid] = React.useState("");

    function register(ev: React.SyntheticEvent) {
        ev.preventDefault();
        setRegistering(true);
        if (!/^\w+$/.test(username) || username.length > 32) {
            setErr("Username can only contain alphanumeric characters or underscore and must be at most 32 characters");
            setRegistering(false);
        }
        else if (!/^[\w$&+,:;=?@#|'<>.^*()%!-]+$/.test(pwd1) || pwd1.length < 8) {
            setErr("Password can only contain alphanumeric characters or underscore and must be at least 8 characters");
            setRegistering(false);
        }
        else if (pwd1 !== pwd2) {
            setErr("Passwords do not match");
            setRegistering(false);
        }
        else {
            axios.default.post('/api/user/register', {
                username: username,
                password: pwd1
            }).then(res => {
                if (res.data.userid) {
                    setUserid(res.data.userid);
                }
                else {
                    setErr(res.data.error);
                }
                setRegistering(false);
            }).catch(err => {
                setErr(err.response.data.error);
                setRegistering(false);
            });
        }
    }

    return (
        <div className={"register"}>
            <div className={"jumbotron jumbotron-fluid"}>
                <div className={"container"}>
                    <h1>Register</h1>
                    <p>Register an account to read restricted toons and keep track of your read history</p>
                </div>
            </div>
            <div className={"container"}>
                {
                    userid === "" ?
                        <form className={"form-signup"}>
                            <div className="form-label-group">
                                <label htmlFor={"username"}>
                                    Username:
                                </label>
                                <input type={"text"} id={"username"} className={"form-control"} name={"username"} placeholder={"Enter your username"} onChange={text => {
                                    setUsername(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"password"}>
                                    Password:
                                </label>
                                <input type={"password"} id={"password"} className={"form-control"} name={"password"} placeholder={"Enter your password"} onChange={text => {
                                    setPwd1(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                <label htmlFor={"repeatpwd"}>
                                    Confirm password:
                                </label>
                                <input type={"password"} id={"repeatpwd"} className={"form-control"} name={"repeatpwd"} placeholder={"Confirm your password"} onChange={text => {
                                    setPwd2(text.target.value);
                                }}></input>
                            </div>
                            <div className="form-label-group">
                                {err !== "" ? <p style={{ textAlign: "center" }}>
                                    {"Error: " + err}
                                </p> : <></>}
                            </div>
                            <br></br>
                            <button className={"btn btn-lg btn-primary btn-block text-uppercase"} disabled={registering} onClick={register}>Register</button>
                            <p style={{ textAlign: "center" }}>Have an account? <a href={"/login"} onClick={(ev) => {
                                ev.preventDefault();
                                nav("/login");
                            }}>Log in</a> instead</p>
                        </form>
                        :
                        <>
                            <div className={"alert alert-success"} id={"successdiv"}>
                                <strong>Success!</strong> Your registration was successful
                            </div>
                            <div className={"container"}>
                                <p style={{ textAlign: "center" }}><a href={"/login"} onClick={(ev) => {
                                    ev.preventDefault();
                                    nav("/login");
                                }}>Log in</a></p>
                            </div>
                        </>
                }
            </div>
        </div>
    )
}