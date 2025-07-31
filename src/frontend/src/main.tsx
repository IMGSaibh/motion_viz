import "@/custom.css";
// import { App } from "./app";
// import { createRoot } from "react-dom/client";

// document.addEventListener("DOMContentLoaded", () => 
// {
//   const container = document.getElementById("root");
//   if (container)
//   {
//     const root = createRoot(container);
//     root.render(<App />);
//   }
// });


import App from './app';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
