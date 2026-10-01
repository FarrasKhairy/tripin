import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PageTransitionProvider } from './contexts/PageTransitionContext'
import { ToastProvider } from './contexts/ToastContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <PageTransitionProvider>
            <AppRoutes />
          </PageTransitionProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

