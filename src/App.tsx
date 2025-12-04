import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { JobsProvider } from "@/context/JobsContext";
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
      <JobsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

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

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </JobsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
