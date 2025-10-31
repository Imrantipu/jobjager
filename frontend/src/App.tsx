import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Applications from '@/pages/Applications';
import Kanban from '@/pages/Kanban';
import CVBuilder from '@/pages/CVBuilder';
import CVCreate from '@/pages/CVCreate';
import CVEdit from '@/pages/CVEdit';
import Anschreiben from '@/pages/Anschreiben';
import AnschreibenView from '@/pages/AnschreibenView';
import AnschreibenEdit from '@/pages/AnschreibenEdit';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kanban"
          element={
            <ProtectedRoute>
              <Kanban />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv"
          element={
            <ProtectedRoute>
              <CVBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv/new"
          element={
            <ProtectedRoute>
              <CVCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv/:id/edit"
          element={
            <ProtectedRoute>
              <CVEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/anschreiben"
          element={
            <ProtectedRoute>
              <Anschreiben />
            </ProtectedRoute>
          }
        />

        <Route
          path="/anschreiben/:id"
          element={
            <ProtectedRoute>
              <AnschreibenView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/anschreiben/:id/edit"
          element={
            <ProtectedRoute>
              <AnschreibenEdit />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
