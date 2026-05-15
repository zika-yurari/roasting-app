import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Google Fonts (Noto Sans JP)
const link = document.createElement("link");
link.rel  = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap";
document.head.appendChild(link);

// グローバルスタイルリセット
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f0f; }
  input::placeholder { color: #555; }
  select option { background: #1a1a1a; }
  a { color: inherit; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
