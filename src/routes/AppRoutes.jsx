import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AppLayout } from '../layouts/AppLayout'

import { ProtectedRoute } from '../components/ProtectedRoute'

// Pages
import { Home } from '../pages/Home'
import { Destinations } from '../pages/Destinations'
import { DestinationDetail } from '../pages/DestinationDetail'
import { CreateTrip } from '../pages/CreateTrip'
import { BudgetPlanner } from '../pages/BudgetPlanner'
import { Expenses } from '../pages/Expenses'
import { TripDashboard } from '../pages/TripDashboard'
import { Wishlist } from '../pages/Wishlist'
import { TripHistory } from '../pages/TripHistory'
import { Profile } from '../pages/Profile'
import { SmartPlanner } from '../pages/SmartPlanner'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public pages share the top navigation shell. */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/destinasi" element={<Destinations />} />
        <Route path="/destinasi/:id" element={<DestinationDetail />} />
      </Route>

      {/* Navbar destinations keep the same shell after authentication. */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/plan" element={<SmartPlanner />} />
        <Route path="/plan/result" element={<SmartPlanner />} />
        <Route path="/riwayat" element={<TripHistory />} />
        <Route path="/dashboard" element={<Navigate to="/riwayat" replace />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Trip management pages use the focused workspace sidebar. */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/trip/buat" element={<CreateTrip />} />
        <Route path="/trip/:id" element={<TripDashboard />} />
        <Route path="/trip/:id/budget" element={<BudgetPlanner />} />
        <Route path="/trip/:id/pengeluaran" element={<Expenses />} />
      </Route>

      <Route path="/login" element={<AuthLayout />} />
      <Route path="/register" element={<AuthLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
