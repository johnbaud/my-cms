import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import AdminSettings from "./pages/AdminSettings"
import AdminPages from "./pages/AdminPages"
import AdminPageEditor from "./pages/AdminPageEditor"


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/pages/:pageId" element={<AdminPageEditor />} />

      </Routes>
    </Router>
  )
}
