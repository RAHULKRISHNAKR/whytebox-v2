/**
 * Main Layout Component
 *
 * Primary layout with sidebar, header, and content area
 */

import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'
import { TutorialOverlay } from '../tutorial/TutorialOverlay'

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Tutorial overlay — renders via Portal at document body level when a tutorial is active */}
      <TutorialOverlay />
    </Box>
  )
}

// Made with Bob
