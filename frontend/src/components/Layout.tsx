import React from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-yellow shadow-md">
        <div className="container mx-auto py-4 px-4">
          <Link to="/" className="text-2xl font-bold text-black">
            Amazon Reviews Analyzer
          </Link>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
    </div>
  )
}

export default Layout