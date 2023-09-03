import { formatDate, getCookie } from "../Chart/Chart";
import { auth } from "../../firebaseConfig";
import { notesInterface } from "../../types/sharedTypes";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import NotesContext from "../../contexts/notesContext";

export default function Profile() {
  const notesContext = useContext(NotesContext);
  if (!notesContext) {
    throw new Error(
      "SomeComponent must be wrapped within NotesContext.Provider"
    );
  }

  const { notes } = notesContext;

  function downloadCSV() {
    const csvContent = generateCSV(notes);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateCSV(notes: Array<notesInterface>): string {
    let csv = "Date, Content\n"; // Header
    notes.forEach((note) => {
      csv += `${formatDate(note.timestamp)},"${note.content.replace(
        /"/g,
        '""'
      )}"\n`;
    });
    return csv;
  }

  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("handleLogout: User logged out successfully");
        // Redirect to login page after successful log out
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const dateOfBirth = getCookie("dateOfBirth");
  const lifeExpectancy = Number(getCookie("lifeExpectancy")) || 80;

  return (
    <>
      <p>Date of Birth: {dateOfBirth}</p>
      <p>Life Expectancy: {lifeExpectancy} years</p>

      <button onClick={handleLogout}>Logout</button>
      <br />
      <button onClick={downloadCSV}>Export CSV</button>
      <br />
      <button
        onClick={() => {
          navigate("/chart");
        }}
      >
        Go to chart
      </button>
    </>
  );
}
