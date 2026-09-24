import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './ThemeContext.jsx'
import Portfolio from '../Components/Portfolio.jsx'
import '../Styles/index.css'
import '../Styles/theme.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Portfolio />
    </ThemeProvider>
  </React.StrictMode>
)
