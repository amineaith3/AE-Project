import { useState } from 'react'
import AirportSidebar from './components/Sidebar';
import PassengerList from './Admin pages/passengers/passengersList';
import PassengerEditForm from './Admin pages/passengers/editPassenger';
import PassengerDetails from './Admin pages/passengers/PassengersDetails';
import ReservationList from './Admin pages/reservation/reservationsList';
import PassengerCreate from './Admin pages/passengers/createPassenger';
import ReservationDetails from './Admin pages/reservation/reservationDetails';
import ReservationEditForm from './Admin pages/reservation/reservationEdit';
import ReservationCreate from './Admin pages/reservation/createReservation';
import FlightDetails from './Admin pages/flights/flightsDetails';
import AircraftList from './Admin pages/aircrafts/aircraftsList';
import VolList from './Admin pages/flights/flightsList';
import MaintenanceForm from './Admin pages/maintenance/MaintenanceForm';
import MaintenanceList from './Admin pages/maintenance/MaintenanceList';
import AircraftMaintenanceList from './Admin pages/maintenance/MaintenanceForm';
import MaintenanceDetails from './Admin pages/maintenance/MaintenanceDetails';
import MaintenanceEditForm from './Admin pages/maintenance/MaintenanceEdit';
import AvionForm from './Admin pages/aircrafts/aircraftCreate'
import AircraftDetails from './Admin pages/aircrafts/aircraftDetails'
import AvionEditForm from './Admin pages/aircrafts/aircraftEdit'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import FlightForm from './Admin pages/flights/flightsCreate'
import VolEditForm from './Admin pages/flights/editFlight'
import LoginPage from './Admin pages/auth/login';
import { AuthProvider } from './contexts/AuthContex';
import ProtectedRoute from './Admin pages/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with sidebar */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Layout component with sidebar for protected routes
function MainLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar visible on all protected pages */}
      <AirportSidebar />
      
      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/passagers" replace />} />
          
          {/* Enregistrement routes */}
          <Route path='/passagers' element={<PassengerList />} />
          <Route path='/reservations' element={<ReservationList />} />
          <Route path="/passagers/nouveau" element={<PassengerCreate />} /> 
          <Route path="/passagers/:num_passeport/edit" element={<PassengerEditForm />} /> 
          <Route path="/passagers/:num_passeport" element={<PassengerDetails />} /> 
          <Route path='/reservations/nouvelle' element={<ReservationCreate />} />
          <Route path='/reservations/:passport_num/edit' element={<ReservationEditForm />} />
          <Route path='/reservations/:passport_num' element={<ReservationDetails />} />
          <Route path='/vols' element={<VolList />} />
          <Route path="/vols/nouveau" element={<FlightForm />} />
          <Route path="/vols/:id" element={<FlightDetails />} />
          <Route path="/vols/:id/edit" element={<VolEditForm />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance/nouveau" element={<MaintenanceForm />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetails />} />
          <Route path="/maintenance/:id/edit" element={<MaintenanceEditForm />} />
          <Route path="/maintenance/avions" element={<AircraftMaintenanceList />} />
          <Route path="/avions" element={<AircraftList />} />
          <Route path="/avions/nouvelle" element={<AvionForm />} />
          <Route path="/avions/:id/edit" element={<AvionEditForm />} />
          <Route path="/avions/:id" element={<AircraftDetails />} />
          
          {/* 404 route */}
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;