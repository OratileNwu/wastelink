import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WasteLinkLayout } from './components/WasteLinkLayout'
import ProfileSettingsRoute from './pages/ProfileSettingsRoute'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import {
  OverallDashboard,
  BuyerDashboard,
  IncomingMaterials,
  BuyingRequirements,
  RequirementForm,
  WorkspaceEmptyPage,
  SellerHandoff,
} from './pages/WasteLinkPages'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route element={<WasteLinkLayout />}>
            <Route index element={<OverallDashboard />} />
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/materials" element={<IncomingMaterials />} />
            <Route path="/buyer/requirements" element={<BuyingRequirements />} />
            <Route path="/buyer/requirements/new" element={<RequirementForm />} />
            <Route path="/buyer/collections" element={<WorkspaceEmptyPage kind="collections" />} />
            <Route path="/buyer/transactions" element={<WorkspaceEmptyPage kind="transactions" />} />
            <Route path="/notifications" element={<WorkspaceEmptyPage kind="notifications" />} />
            <Route path="/settings" element={<ProfileSettingsRoute />} />
            <Route path="/seller" element={<SellerHandoff />} />
            <Route path="/marketplace" element={<Navigate to="/buyer/materials" replace />} />
            <Route path="/offers" element={<Navigate to="/buyer/requirements" replace />} />
            <Route path="/my-purchases" element={<Navigate to="/buyer/transactions" replace />} />
            <Route path="*" element={<WorkspaceEmptyPage kind="not-found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
  )
}
