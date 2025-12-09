import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import AreaCapture from './pages/AreaCapture';
import History from './pages/History';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import Roles from './pages/admin/Roles';
import Permissions from './pages/admin/Permissions';
import Layout from './components/Layout';
import RoleRoute from './components/RoleRoute';

// Protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            {/* Add other routes here later */}
            <Route path="ingredientes" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <Ingredients />
              </RoleRoute>
            } />
            <Route path="almacen" element={
              <RoleRoute allowedRoles={['administrativo', 'almacen']}>
                <AreaCapture areaTitle="Almacen" areaKey="almacen" />
              </RoleRoute>
            } />
            <Route path="cocina" element={
              <RoleRoute allowedRoles={['administrativo', 'cocina']}>
                <AreaCapture areaTitle="Cocina" areaKey="cocina" />
              </RoleRoute>
            } />
            <Route path="ensalada" element={
              <RoleRoute allowedRoles={['administrativo', 'ensalada']}>
                <AreaCapture areaTitle="Ensalada" areaKey="ensalada" />
              </RoleRoute>
            } />
            <Route path="isla" element={
              <RoleRoute allowedRoles={['administrativo', 'isla']}>
                <AreaCapture areaTitle="Isla" areaKey="isla" />
              </RoleRoute>
            } />
            <Route path="historico" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <History />
              </RoleRoute>
            } />

            {/* Administrative Routes - Admin Only */}
            <Route path="admin" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <AdminDashboard />
              </RoleRoute>
            } />
            <Route path="admin/users" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <Users />
              </RoleRoute>
            } />
            <Route path="admin/roles" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <Roles />
              </RoleRoute>
            } />
            <Route path="admin/permissions" element={
              <RoleRoute allowedRoles={['administrativo']}>
                <Permissions />
              </RoleRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
