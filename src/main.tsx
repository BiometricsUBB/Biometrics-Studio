import React from "react";
import ReactDOM from "react-dom/client";
import RootLayout from "@/app/layout";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RootLayout>
            <App />
        </RootLayout>
    </React.StrictMode>
);
