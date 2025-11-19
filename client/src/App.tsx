import { Outlet, Link } from "react-router-dom";
import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function App() {

  return (



    <div>
      <nav className="flex gap-4 mb-6 text-blue-600">

      </nav>

      <Outlet />
      <ToastContainer autoClose={3000} />
    </div>

  );
}
