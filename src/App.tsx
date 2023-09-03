import Chart from "./components/Chart/Chart.tsx";
import Profile from "./components/Profile/Profile.tsx";
import Login from "./components/Login/Login.tsx";
import AddNote from "./components/AddNote/AddNote.tsx";
import Note from "./components/Note/Note.tsx"; // Import the Note component
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NotesContext from "./contexts/notesContext";
import { useState } from "react";
import { notesInterface } from "./types/sharedTypes.ts";

export default function App() {
  const [notes, setNotes] = useState<Array<notesInterface>>([]);
  return (
    <>
      <Router>
        <NotesContext.Provider value={{ notes, setNotes }}>
          <Routes>
            <Route path="/chart" element={<Chart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/addnote" element={<AddNote />} />
            <Route path="/note/:id" element={<Note />} /> {/* Add this line */}
            <Route path="/" element={<Login />} />
          </Routes>
        </NotesContext.Provider>
      </Router>
    </>
  );
}
