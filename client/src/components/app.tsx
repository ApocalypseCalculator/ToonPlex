import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SessionProvider } from "../util/session";

// import "./index.scss";

import { NavBar } from "./navbar";
import { Home } from "./home";
import { Directory } from "./directory";
import { Toon } from "./toon";

export const _App = () => {
    return (
        <div className="page">
            <NavBar />
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/toon/:toonslug" element={<Toon />} />
                    <Route path="/reader/:toonslug/:chapter" element={<Toon />} />
                    <Route path="/directory" element={<Directory />} />
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