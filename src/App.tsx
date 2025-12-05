import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CreateJobPage from "@/pages/admin/CreateJobPage";
import AdminJobDetailPage from "@/pages/admin/AdminJobDetailPage";
import TechJobsList from "@/pages/tech/TechJobsList";
import JobWorkflowPage from "@/pages/tech/JobWorkflowPage";
import TechProfilePage from "@/pages/tech/TechProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<LoginPage />} />
            <Route path="/invite" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'semiadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'semiadmin']}>
                  <Routes>
                    <Route path="create-job" element={<CreateJobPage />} />
                    <Route path="jobs/:jobId" element={<AdminJobDetailPage />} />
                  </Routes>
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
              path="/tech/jobs/:jobId"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <JobWorkflowPage />
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

            {/* Viewer Routes */}
            <Route
              path="/viewer"
              element={
                <ProtectedRoute allowedRoles={['viewer']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
