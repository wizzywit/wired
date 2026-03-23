import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { GalleryScreen } from './screens/GalleryScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { CanvasScreen } from './screens/CanvasScreen'
import { ShareScreen } from './screens/ShareScreen'
import { CanvasSyncingScreen } from './screens/CanvasSyncingScreen'
import { ExportSettingsScreen } from './screens/ExportSettingsScreen'
import { LoadingScreen } from './screens/LoadingScreen'
import { LandingPageScreen } from './screens/LandingPageScreen'
import { LoginScreen } from './screens/LoginScreen'
import { SignUpScreen } from './screens/SignUpScreen'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GalleryScreen />} />
          <Route path="/landing" element={<LandingPageScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/canvas" element={<CanvasScreen />} />
          <Route path="/share" element={<ShareScreen />} />
          <Route path="/syncing" element={<CanvasSyncingScreen />} />
          <Route path="/export" element={<ExportSettingsScreen />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
