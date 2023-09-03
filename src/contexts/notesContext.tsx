import React from "react";
import { notesInterface } from "../types/sharedTypes";

const NotesContext = React.createContext<
  | {
      notes: Array<notesInterface>;
      setNotes: React.Dispatch<React.SetStateAction<Array<notesInterface>>>;
    }
  | undefined
>(undefined);

export default NotesContext;
