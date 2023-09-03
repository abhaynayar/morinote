// Login.js
import "./Login.css";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig.js";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/chart");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const setCookie = (name: string, value: string, days: number): void => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Fetch user data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Store lifeExpectancy and dateOfBirth in cookies
          setCookie("lifeExpectancy", userDoc.data().lifeExpectancy, 365); // 365 days expiration
          setCookie("dateOfBirth", userDoc.data().dateOfBirth, 365); // 365 days expiration
        } else {
          console.error("No such document!");
        }

        navigate("/chart");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (loading) return null;

  return (
    <div>
      <pre>Login:</pre>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
