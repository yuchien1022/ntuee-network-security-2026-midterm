import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import "./index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "users", element: <Users /> },
      { path: "users/create", element: <CreateUser /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
