import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/LoginPage";
import AuthCallback from "@/pages/auth/AuthCallback";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CreateJobPage from "@/pages/admin/CreateJobPage";
import AdminJobDetailPage from "@/pages/admin/AdminJobDetailPage";

// Technician Pages
import TechJobsList from "@/pages/tech/TechJobsList";
import TechProfilePage from "@/pages/tech/TechProfilePage";
import JobWorkflowPage from "@/pages/tech/JobWorkflowPage";

// Viewer Pages
import ViewerDashboard from "@/pages/viewer/ViewerDashboard";

// SemiAdmin Pages
import SemiAdminDashboard from "@/pages/semiadmin/SemiAdminDashboard";
import TechniciansPage from "@/pages/semiadmin/TechniciansPage";
import AssignJobPage from "@/pages/semiadmin/AssignJobPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/invite" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-job"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CreateJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:jobId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminJobDetailPage />
                </ProtectedRoute>
              }
            />

            {/* SemiAdmin Routes */}
            <Route
              path="/semiadmin"
              element={
                <ProtectedRoute allowedRoles={['semiadmin', 'admin']}>
                  <SemiAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/semiadmin/technicians"
              element={
                <ProtectedRoute allowedRoles={['semiadmin', 'admin']}>
                  <TechniciansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/semiadmin/assign/:jobId"
              element={
                <ProtectedRoute allowedRoles={['semiadmin', 'admin']}>
                  <AssignJobPage />
                </ProtectedRoute>
              }
            />

            {/* Technician Routes */}
            <Route
              path="/tech"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechJobsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/profile"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/jobs/:jobId"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <JobWorkflowPage />
                </ProtectedRoute>
              }
            />

            {/* Viewer Routes */}
            <Route
              path="/viewer"
              element={
                <ProtectedRoute allowedRoles={['viewer', 'admin', 'semiadmin', 'technician']}>
                  <ViewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Not Authorized */}
            <Route path="/not-authorized" element={<NotFound />} />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;