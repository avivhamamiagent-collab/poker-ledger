import { Navigate, Route, Routes } from 'react-router-dom'

import { ToastsProvider } from '../components/ui/use-toast'
import { Toaster } from '../components/ui/toaster'
import { StoreProvider } from './store-context'
import { AuthProvider } from './auth/auth-context'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './shell/AppShell'
import { LoginPage } from './pages/LoginPage'
import { SessionsPage } from './pages/SessionsPage'
import { RosterPage } from './pages/RosterPage'
import { GroupsPage } from './pages/groups/GroupsPage'
import { GroupPage } from './pages/groups/GroupPage'
import { GamePage } from './pages/groups/GamePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SessionLayout } from './pages/session/SessionLayout'
import { SessionParticipantsPage } from './pages/session/SessionParticipantsPage'
import { SessionEntriesPage } from './pages/session/SessionEntriesPage'
import { SessionCashoutsPage } from './pages/session/SessionCashoutsPage'
import { SessionSettlementPage } from './pages/session/SessionSettlementPage'
import { SessionExportPage } from './pages/session/SessionExportPage'
import { SessionAuditPage } from './pages/session/SessionAuditPage'

export function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastsProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/" element={<SessionsPage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/group/:id" element={<GroupPage />} />
              <Route path="/game/:id" element={<GamePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              <Route path="/session/:id" element={<SessionLayout />}>
                <Route index element={<Navigate to="participants" replace />} />
                <Route path="participants" element={<SessionParticipantsPage />} />
                <Route path="entries" element={<SessionEntriesPage />} />
                <Route path="cashout" element={<SessionCashoutsPage />} />
                <Route path="settlement" element={<SessionSettlementPage />} />
                <Route path="export" element={<SessionExportPage />} />
                <Route path="audit" element={<SessionAuditPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster />
        </ToastsProvider>
      </StoreProvider>
    </AuthProvider>
  )
}

