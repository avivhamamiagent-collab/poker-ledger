import * as React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ToastsProvider } from '../components/ui/use-toast'
import { Toaster } from '../components/ui/toaster'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { StoreProvider } from './store-context'
import { AuthProvider } from './auth/auth-context'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './shell/AppShell'
import { SessionErrorBoundary } from './pages/SessionErrorBoundary'

const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const HomePage = React.lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const SessionsPage = React.lazy(() => import('./pages/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

const RosterPage = React.lazy(() => import('./pages/RosterPage').then((m) => ({ default: m.RosterPage })))
const GroupsPage = React.lazy(() => import('./pages/groups/GroupsPage').then((m) => ({ default: m.GroupsPage })))
const CreateGroupPage = React.lazy(() =>
  import('./pages/groups/CreateGroupPage').then((m) => ({ default: m.CreateGroupPage })),
)
const GroupPage = React.lazy(() => import('./pages/groups/GroupPage').then((m) => ({ default: m.GroupPage })))
const GamePage = React.lazy(() => import('./pages/groups/GamePage').then((m) => ({ default: m.GamePage })))

const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const SessionLayout = React.lazy(() => import('./pages/session/SessionLayout').then((m) => ({ default: m.SessionLayout })))
const SessionParticipantsPage = React.lazy(() =>
  import('./pages/session/SessionParticipantsPage').then((m) => ({ default: m.SessionParticipantsPage })),
)
const SessionEntriesPage = React.lazy(() =>
  import('./pages/session/SessionEntriesPage').then((m) => ({ default: m.SessionEntriesPage })),
)
const SessionCashoutsPage = React.lazy(() =>
  import('./pages/session/SessionCashoutsPage').then((m) => ({ default: m.SessionCashoutsPage })),
)
const SessionSettlementPage = React.lazy(() =>
  import('./pages/session/SessionSettlementPage').then((m) => ({ default: m.SessionSettlementPage })),
)
const SessionExportPage = React.lazy(() =>
  import('./pages/session/SessionExportPage').then((m) => ({ default: m.SessionExportPage })),
)
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const SessionAuditPage = React.lazy(() => import('./pages/session/SessionAuditPage').then((m) => ({ default: m.SessionAuditPage })))

export function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <StoreProvider>
        <ToastsProvider>
          <React.Suspense fallback={<div className="px-container-padding py-6 text-sm text-on-surface-variant">טוען…</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/roster" element={<RosterPage />} />

                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/new" element={<CreateGroupPage />} />
                <Route path="/group/:id" element={<GroupPage />} />
                <Route path="/groups/:id" element={<GroupPage />} />
                <Route path="/game/:id" element={<GamePage />} />
                <Route path="/games/:id" element={<GamePage />} />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                <Route path="/notifications" element={<NotificationsPage />} />

                <Route path="/session/:id" element={<SessionErrorBoundary><SessionLayout /></SessionErrorBoundary>}>
                  <Route index element={<Navigate to="entries" replace />} />
                  <Route path="participants" element={<SessionParticipantsPage />} />
                  <Route path="entries" element={<SessionEntriesPage />} />
                  <Route path="cashout" element={<SessionCashoutsPage />} />
                  <Route path="settlement" element={<SessionSettlementPage />} />
                  <Route path="export" element={<SessionExportPage />} />
                  <Route path="audit" element={<SessionAuditPage />} />
                </Route>
                <Route path="/sessions/:id" element={<SessionErrorBoundary><SessionLayout /></SessionErrorBoundary>}>
                  <Route index element={<Navigate to="entries" replace />} />
                  <Route path="participants" element={<SessionParticipantsPage />} />
                  <Route path="entries" element={<SessionEntriesPage />} />
                  <Route path="cashouts" element={<SessionCashoutsPage />} />
                  <Route path="cashout" element={<SessionCashoutsPage />} />
                  <Route path="settlement" element={<SessionSettlementPage />} />
                  <Route path="export" element={<SessionExportPage />} />
                  <Route path="audit" element={<SessionAuditPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </React.Suspense>
          <Toaster />
        </ToastsProvider>
      </StoreProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}
