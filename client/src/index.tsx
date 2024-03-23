import * as React from "react";
import { createRoot } from 'react-dom/client';
import { App } from "./components/app";

const htmlroot = document.getElementById("root");
createRoot(htmlroot!).render(<App />);