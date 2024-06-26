import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SessionProvider } from "../util/session";

import "./index.scss";

import { NavBar } from "./navbar";
import { Home } from "./home";
import { Directory } from "./directory";
import { Toon } from "./toon";
import { Reader } from "./reader";
import { Login } from "./login";
import { Register } from "./register";

export const _App = () => {
    return (
        <div className="page">
            <NavBar />
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/toon/:toonslug" element={<Toon />} />
                    <Route path="/reader/:toonslug/:chapter" element={<Reader />} />
                    <Route path="/directory" element={<Directory />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
        </div>
    );
}

export const App = () => {
    return (
        <BrowserRouter>
            <SessionProvider>
                <_App />
            </SessionProvider>
        </BrowserRouter>
    );
}