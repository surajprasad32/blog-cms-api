import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardLayout } from './pages/dashboard/Layout'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { PostDetail } from './pages/PostDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Overview } from './pages/dashboard/Overview'
import { MyPosts } from './pages/dashboard/MyPosts'
import { PostEditor } from './pages/dashboard/PostEditor'
import { Admin } from './pages/dashboard/Admin'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><PostDetail /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Layout><DashboardLayout><Overview /></DashboardLayout></Layout>} />
      <Route path="/dashboard/posts" element={<Layout><DashboardLayout><MyPosts /></DashboardLayout></Layout>} />
      <Route path="/dashboard/new" element={<Layout><DashboardLayout><PostEditor mode="create" /></DashboardLayout></Layout>} />
      <Route path="/dashboard/edit/:slug" element={<Layout><DashboardLayout><PostEditor mode="edit" /></DashboardLayout></Layout>} />
      <Route path="/dashboard/admin" element={<Layout><DashboardLayout><Admin /></DashboardLayout></Layout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
