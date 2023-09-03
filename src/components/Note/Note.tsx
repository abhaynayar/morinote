import "./Note.css";
import { formatDate } from "../Chart/Chart";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { notesInterface } from "../../types/sharedTypes";


export default function Note() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<notesInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setError("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNote = async () => {
      if (!currentUser || !id) return;

      try {
        const noteRef = doc(db, "squares", id);
        const noteSnapshot = await getDoc(noteRef);

        if (noteSnapshot.exists()) {
          const fetchedNote = noteSnapshot.data() as notesInterface;

          if (fetchedNote.userId === currentUser) {
            setNote(fetchedNote);
          } else {
            setError("This note does not belong to you");
          }
        } else {
          setError("Note not found");
        }
      } catch (err) {
        console.error("Actual error:", err);
        setError("Error fetching note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, currentUser]);

  const navigate = useNavigate();

  const deleteNote = async () => {
    if (!id) return;

    const userConfirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!userConfirmed) return;

    try {
      const noteRef = doc(db, "squares", id);
      await deleteDoc(noteRef);
      navigate("/chart"); // Redirecting to chart after deletion
    } catch (err) {
      setError("Error deleting note");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="notePage">
      <p>{formatDate(note?.timestamp || "")}</p>
      <p className="noteContent">{note?.content}</p>
      <button onClick={deleteNote}>DELETE NOTE</button>
      <button onClick={() => navigate("/chart")}>Go to Chart</button>
    </div>
  );
}
