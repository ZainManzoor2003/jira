import { Outlet, Link } from "react-router-dom";
import './App.css'
import { DragDropContext } from "react-beautiful-dnd";

export default function App() {

  return (
    <DragDropContext onDragEnd={() => { }}>


    <div>
      <nav className="flex gap-4 mb-6 text-blue-600">
        
      </nav>

      <Outlet />
    </div>
    </DragDropContext>
  );
}
