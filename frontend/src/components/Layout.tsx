import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-white mx-auto">
      <header className="bg-yellow shadow-md">
        <div className="container mx-auto py-4 px-4 flex justify-center">
        </div>
      </header>
      <main className="container mx-auto py-6 px-4 overflow-y-auto">
        {children}
      </main>
      <footer className="bg-yellow shadow-md fixed bottom-0 left-0 w-full">
        <div className="container mx-auto py-2 px-2">
        </div>
      </footer>
    </div>
  )
}

export default Layout