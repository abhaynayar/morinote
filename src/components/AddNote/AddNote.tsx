import { useState, FormEvent, useEffect } from "react"; // <-- Import useEffect
import { db, auth } from "../../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AddNote() {
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());
  const [content, setContent] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login"); // Redirect to login if user is not authenticated
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Content cannot be empty!");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("User not authenticated!");
      return;
    }

    try {
      await addDoc(collection(db, "squares"), {
        timestamp,
        content,
        userId: currentUser.uid,
      });

      alert("Note added successfully!");
      setContent(""); // Clear the content after successful addition
    } catch (error) {
      console.error("Error adding note: ", error);
      alert("Failed to add the note.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            rows={10}
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <input
            type="datetime-local"
            id="datetime"
            value={timestamp.slice(0, 16)} // slice to match the format "YYYY-MM-DDTHH:MM"
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <button type="submit">Add Note</button>
        <br />
        <button onClick={() => navigate("/chart")}>Go to chart</button>
      </form>
    </div>
  );
}
