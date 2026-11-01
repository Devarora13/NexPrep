import React from 'react'
import DashboardProvider from './provider'
import { Toaster } from 'sonner'

function DashboardLayout({children}) {
  return (
    <div className="w-full">
        <DashboardProvider>
          <div className='pt-4 w-full'>
            {children}
          </div>
        </DashboardProvider>
        <Toaster />
    </div>

  )
}

export default DashboardLayout