import React from "react";
import { BrowserRouter , Route, Routes } from "react-router-dom";
import './App.css';
import Authorizer from './roles/Authorizer';
import DataEntry from "./roles/DataEntry";
import Technician from "./roles/Technician";
import Login from "./Login";
import SignUp from "./SignUp";
import Reviewer from "./roles/Reviewer";
import OnlyOfficeEditor from "./components/OnlyOfficeEditor";

function App() {

  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Login/>}/>
       <Route path="/signup" element={<SignUp/>}/>
       <Route path="/authorizer" element={<Authorizer/>}/>
       <Route path="/data-entry-operator" element={<DataEntry/>}/>
       <Route path="/technician/:name" element={<Technician/>}/>
       <Route path="/reviewer" element={<Reviewer/>}/>
       <Route path="/dummy" element={<OnlyOfficeEditor />}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
