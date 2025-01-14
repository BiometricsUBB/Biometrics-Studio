import React from "react";
import ReactDOM from "react-dom/client";
import RootLayout from "@/app/layout";
import { WorkingModeProvider } from "@/providers/WorkingModeProvider";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WorkingModeProvider>
            <RootLayout>
                <App />
            </RootLayout>
        </WorkingModeProvider>
    </React.StrictMode>
);
