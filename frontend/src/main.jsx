import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MessageBoard from "./pages/MessageBoard";
import Profile from "./pages/Profile";
import AIWork from "./pages/AIWork";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "messages", element: <MessageBoard /> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "ai-work", element: <AIWork /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
