import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './ThemeContext.jsx'
import { ProfileProvider } from './ProfileContext.jsx'
import Portfolio from '../Components/Portfolio.jsx'
import AdminPanel from '../Components/AdminPanel.jsx'
import '../Styles/index.css'
import '../Styles/theme.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        {window.location.pathname === '/admin' ? <AdminPanel /> : <Portfolio />}
      </ProfileProvider>
    </ThemeProvider>
  </React.StrictMode>
)
