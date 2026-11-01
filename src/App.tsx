import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WasteLinkLayout } from './components/WasteLinkLayout'
import ProfileSettingsRoute from './pages/ProfileSettingsRoute'
import SellerWorkspaceRoute from './pages/SellerWorkspaceRoute'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import BuyerRequirementsRoute from './pages/BuyerRequirementsRoute'
import IncomingMaterialsRoute from './pages/IncomingMaterialsRoute'
import RequirementFormRoute from './pages/RequirementFormRoute'
import {
  OverallDashboard,
  BuyerDashboard,
  WorkspaceEmptyPage,
} from './pages/WasteLinkPages'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<WasteLinkLayout />}>
            <Route index element={<OverallDashboard />} />
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/materials" element={<IncomingMaterialsRoute />} />
            <Route path="/buyer/requirements" element={<BuyerRequirementsRoute />} />
            <Route path="/buyer/requirements/new" element={<RequirementFormRoute />} />
            <Route path="/buyer/collections" element={<WorkspaceEmptyPage kind="collections" />} />
            <Route path="/buyer/transactions" element={<WorkspaceEmptyPage kind="transactions" />} />
            <Route path="/notifications" element={<WorkspaceEmptyPage kind="notifications" />} />
            <Route path="/settings" element={<ProfileSettingsRoute />} />
            <Route path="/seller" element={<SellerWorkspaceRoute />} />
            <Route path="/marketplace" element={<Navigate to="/buyer/materials" replace />} />
            <Route path="/offers" element={<Navigate to="/buyer/requirements" replace />} />
            <Route path="/my-purchases" element={<Navigate to="/buyer/transactions" replace />} />
            <Route path="*" element={<WorkspaceEmptyPage kind="not-found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
  )
}
