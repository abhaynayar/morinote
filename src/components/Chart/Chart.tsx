import "./Chart.css";
import Square from "../Square/Square.jsx";
import { User } from "firebase/auth";
import { db, auth } from "../../firebaseConfig.js";
import { notesInterface } from "../../types/sharedTypes.js";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NotesContext from "../../contexts/notesContext";
import React from "react";

export default function Chart() {
  const notesContext = useContext(NotesContext);

  if (!notesContext) {
    throw new Error(
      "SomeComponent must be wrapped within NotesContext.Provider"
    );
  }

  const { notes, setNotes } = notesContext;

  const navigate = useNavigate();
  const dateOfBirth = getCookie("dateOfBirth");
  const lifeExpectancy = Number(getCookie("lifeExpectancy")) || 80;

  let weeksPassed: number;
  weeksPassed = getWeeksPassedSince(dateOfBirth);

  const numberOfSquares = lifeExpectancy * 52;
  let fiveYearsWeeks: number = 52 * 5;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [notedSquares, setNotedSquares] = useState<Map<number, number>>(
    new Map()
  );
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const tooltipStyles = tooltipPosition
    ? {
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }
    : {};

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  /*************************
    SCROLL CODE STARTS HERE.
  *************************/

  const [viewportedSquares, setViewportedSquares] = useState<number[]>([]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const nodes: HTMLDivElement[] = Array.from(
      container.children as HTMLCollectionOf<HTMLDivElement>
    );

    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    const visibleIndices = nodes
      .filter((node) => {
        const nodeRect = node.getBoundingClientRect();
        const nodeTop = nodeRect.top;
        const nodeBottom = nodeRect.bottom;

        // Calculate the visible portion of the node
        const visibleTop = Math.max(nodeTop, containerTop);
        const visibleBottom = Math.min(nodeBottom, containerBottom);
        const visibleHeight = visibleBottom - visibleTop;

        // Check if more than 50% of the node is visible
        return visibleHeight >= 0.9 * nodeRect.height;
      })
      .map((node) => parseInt(node.getAttribute("data-index") || ""));

    setViewportedSquares(visibleIndices);
  };

  useEffect(() => {
    if (viewportedSquares.length > 0) {
      const firstVisibleSquareIndex = viewportedSquares[0];
      const squareElement = document.querySelector(
        `.square[data-index="${firstVisibleSquareIndex}"]`
      );
      squareElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [viewportedSquares]);
  
  
  /***********************
    SCROLL CODE ENDS HERE.
  ***********************/

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        console.log("onAuthStateChanged: No user is signed in.");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchNotes(user.uid).then((fetchedNotes) => {
        setNotes(fetchedNotes);

        const weeks = new Map<number, number>();
        for (let note of fetchedNotes) {
          if (dateOfBirth) {
            const weekNumber = getWeeksPassedSince(dateOfBirth, note.timestamp);
            weeks.set(weekNumber, (weeks.get(weekNumber) ?? 0) + 1);
          }
        }
        setNotedSquares(weeks);
        setIsLoading(false);
      });
    }
  }, [user]);

  const fetchNotes = async (userId: string) => {
    const notes: notesInterface[] = [];
    const notesCount: Map<number, number> = new Map();

    const notesCollection = collection(db, "squares");
    const q = query(notesCollection, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const noteData = doc.data() as notesInterface;
      notes.push({
        ...noteData,
        id: doc.id,
      });

      if (dateOfBirth) {
        const weekNumber = getWeeksPassedSince(dateOfBirth, noteData.timestamp);
        if (notesCount.has(weekNumber)) {
          notesCount.set(weekNumber, notesCount.get(weekNumber)! + 1);
        } else {
          notesCount.set(weekNumber, 1);
        }
      }
    });

    setNotedSquares(notesCount);
    return notes;
  };

  function handleSquareClick(index: number) {
    setSelectedWeek(index);
  }

  useEffect(() => {
    const currentSquare = document.querySelector(
      `.square[data-index="${weeksPassed}"]`
    );

    currentSquare?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []); // <-- The empty dependency array ensures this runs only once when the component mounts.

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) {
    if (dateOfBirth) {
      const dateForSquare = new Date(
        new Date(dateOfBirth).getTime() + index * 7 * 24 * 60 * 60 * 1000
      );
      setTooltipContent(formatDate(dateForSquare.toISOString()));

      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left, y: rect.top - 30 }); // Adjust as needed
    }
  }

  function handleMouseLeave() {
    setTooltipContent(null);
    setTooltipPosition(null);
  }

  function getShadeClass(count?: number) {
    if (!count) return "";
    return "shade1";
  }

  return (
    <div className="container">
      <p>
        You've already lived{" "}
        <b>
          <u>
            <i>{+((weeksPassed / numberOfSquares) * 100).toFixed(2)}%</i>
          </u>
        </b>
        {" "}of your life.
      </p>

      <div className="chart-container" ref={chartContainerRef}>
        <div className="chart">
          {Array.from({ length: numberOfSquares }).map((_, index) => (
            <React.Fragment key={index}>
              {index % fiveYearsWeeks === 0 ? (
                <div className="year-text">
                  <p>{`~${(index / fiveYearsWeeks) * 5} Years Old`}</p>
                </div>
              ) : null}

              <Square
                data-index={index}
                onClick={() => handleSquareClick(index)}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                onMouseLeave={handleMouseLeave}
                className={`square
                ${(index + 1) % fiveYearsWeeks === 0 ? "margin-bottom" : ""}
                ${index <= weeksPassed ? "filled" : ""}
                ${selectedWeek === index ? "viewported" : ""}
                ${notedSquares.has(index) ? "noted" : ""}
                ${getShadeClass(notedSquares.get(index))}
                ${isBirthWeek(index, dateOfBirth) ? "birthweek" : ""}
                ${viewportedSquares.includes(index) ? "viewported" : ""}
              `}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="notes-list" onScroll={handleScroll}>
        {isLoading ? (
          <p>Loading notes...</p>
        ) : (
          notes
            .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
            .map((note) => (
              <div
                onClick={() => navigate(`/note/${note.id}`)}
                key={note.id}
                data-index={getWeeksPassedSince(dateOfBirth, note.timestamp)}
                className="note"
              >
                <div>
                  <p>{formatDate(note.timestamp)}</p>
                </div>
                <div>
                  <p>{note.content.slice(0, 50)} ...</p>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="chartButton">
        <button onClick={() => navigate("/addnote")}>Add Note</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>

      <div
        className={`tooltip ${tooltipContent ? "visible" : ""}`}
        style={tooltipStyles}
      >
        {tooltipContent}
      </div>
    </div>
  );
}

function getWeeksPassedSince(
  dob: string | null,
  currentDateStr: string = new Date().toISOString()
): number {
  if (dob == null) {
    dob = "2000-01-01";
  }
  const dobDate = new Date(dob);
  const currentDate = new Date(currentDateStr);

  const differenceInMilliseconds = currentDate.getTime() - dobDate.getTime();
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

  return Math.floor(differenceInMilliseconds / oneWeekInMilliseconds);
}

export function formatDate(inputString: string): string {
  const dateObj = new Date(inputString);
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const day = dateObj.getDate();
  return `${year}, ${month} ${day}`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function isBirthWeek(index: number, dateOfBirth: string | null): boolean {
  if (dateOfBirth === null) {
    return false;
  }

  // Parse the dateOfBirth string to a Date object
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day); // month is 0-indexed

  // Calculate the start and end of the week represented by index
  const startOfWeek = new Date(birthDate);
  startOfWeek.setDate(birthDate.getDate() + 7 * index);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Check if birth month and date fall within the week
  return (
    startOfWeek.getMonth() <= birthDate.getMonth() &&
    startOfWeek.getDate() <= birthDate.getDate() &&
    endOfWeek.getMonth() >= birthDate.getMonth() &&
    endOfWeek.getDate() >= birthDate.getDate()
  );
}
