import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import VerifyEmail from './pages/VerifyEmail.tsx';
import UserTasks from './pages/UserTasks.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { index: true, element: <Navigate to="login" /> }, // 👈 redirect default
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "verifyEmail", element: <VerifyEmail /> },
      { path: "user/tasks", element: <UserTasks /> }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
