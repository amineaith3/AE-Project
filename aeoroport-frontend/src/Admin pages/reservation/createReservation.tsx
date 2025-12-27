// src/pages/reservations/ReservationCreate.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FlightIcon from "@mui/icons-material/Flight";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interfaces matching your models
interface ReservationCreate {
  reservation_id: number;
  passenger_id: number;
  vol_num: number;
  seatcode: string;
  state: string;
  guardian_id?: number | null;
}

interface PassengerOut {
  passenger_id: number;
  prenom: string;
  nom: string;
  num_passeport: number;
  contact: string;
  nationality: string;
  age: number;
}

interface FlightOut {
  vol_num: number;
  destination: string;
  departure_time: string;
  arrival_time: string;
  avion_id: number;
  state: string;
  current_capacity: number;
}

export default function ReservationCreate() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for dropdown data
  const [passengers, setPassengers] = useState<PassengerOut[]>([]);
  const [flights, setFlights] = useState<FlightOut[]>([]);
  const [loadingData, setLoadingData] = useState({
    passengers: true,
    flights: true,
  });

  // Form state - initial values
  const [formData, setFormData] = useState({
    reservation_id: "",
    passenger_id: "",
    vol_num: "",
    seatcode: "",
    state: "Confirmed",
    guardian_id: "",
  });

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Fetch passengers
      const passengersResponse = await api.get("/passengers/passengers");
      setPassengers(passengersResponse.data);
      setLoadingData(prev => ({ ...prev, passengers: false }));

      // Fetch flights
      const flightsResponse = await api.get("/flights/flights");
      setFlights(flightsResponse.data);
      setLoadingData(prev => ({ ...prev, flights: false }));
    } catch (err: any) {
      console.error("Error fetching dropdown data:", err);
      setError("Erreur lors du chargement des données");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.reservation_id) return "L'ID réservation est requis";
    if (!formData.passenger_id) return "Le passager est requis";
    if (!formData.vol_num) return "Le vol est requis";
    if (!formData.seatcode.trim()) return "Le code siège est requis";
    
    // Reservation ID validation
    const reservationId = parseInt(formData.reservation_id);
    if (isNaN(reservationId) || reservationId <= 0) {
      return "L'ID réservation doit être un nombre positif";
    }
    
    // Guardian ID validation (optional)
    if (formData.guardian_id && isNaN(parseInt(formData.guardian_id))) {
      return "L'ID accompagnateur doit être un nombre";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for POST request
      const createData: ReservationCreate = {
        reservation_id: parseInt(formData.reservation_id),
        passenger_id: parseInt(formData.passenger_id),
        vol_num: parseInt(formData.vol_num),
        seatcode: formData.seatcode.trim(),
        state: formData.state,
        guardian_id: formData.guardian_id ? parseInt(formData.guardian_id) : null,
      };

      // Send POST request
      const response = await api.post("/reservations/reservations", createData);
      
      console.log("Reservation created: ", response);

      setSuccess("Réservation créée avec succès !");
      
      // Reset form on success
      setTimeout(() => {
        setFormData({
          reservation_id: "",
          passenger_id: "",
          vol_num: "",
          seatcode: "",
          state: "Confirmed",
          guardian_id: "",
        });
      }, 1500);

      // Redirect to reservations list after success
      setTimeout(() => {
        navigate("/reservations");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting reservation:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle database errors from FastAPI
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 400) {
            setError("Erreur de validation. Vérifiez les données saisies.");
          } else if (err.response.status === 409) {
            setError("Ce siège est déjà réservé pour ce vol.");
          } else {
            setError(`Erreur serveur (${err.response.status})`);
          }
        } else if (err.request) {
          setError("Pas de réponse du serveur. Vérifiez que le serveur FastAPI est en marche.");
        } else {
          setError(`Erreur: ${err.message}`);
        }
      } else {
        setError("Une erreur inattendue s'est produite");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      reservation_id: "",
      passenger_id: "",
      vol_num: "",
      seatcode: "",
      state: "Confirmed",
      guardian_id: "",
    });
  };

  const handleCancel = () => {
    navigate("/reservations");
  };

  const handleCreatePassenger = () => {
    navigate("/passagers/nouveau");
  };

  const handleRowClick = (type: 'passenger' | 'flight', id: number) => {
    console.log(`${type} clicked:`, id);
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <PageContainer
      title="Nouvelle réservation"
      breadcrumbs={[
        { title: "Réservations" },
        { title: "Nouvelle" },
      ]}
      actions={
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          disabled={submitting}
        >
          Retour
        </Button>
      }
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Créer une nouvelle réservation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Reservation ID Field - Required */}
            <TextField
              fullWidth
              required
              label="ID Réservation"
              name="reservation_id"
              value={formData.reservation_id}
              onChange={handleChange}
              placeholder="Ex: 5001"
              disabled={submitting}
              helperText="Numéro unique identifiant la réservation"
              error={!!error && error.includes("réservation")}
            />

            {/* Passenger Selection */}
            <Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth required disabled={submitting || loadingData.passengers}>
                  <InputLabel>Passager</InputLabel>
                  <Select
                    name="passenger_id"
                    value={formData.passenger_id}
                    onChange={handleSelectChange}
                    label="Passager"
                  >
                    {loadingData.passengers ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Chargement des passagers...
                      </MenuItem>
                    ) : passengers.length === 0 ? (
                      <MenuItem disabled>
                        Aucun passager disponible
                      </MenuItem>
                    ) : (
                      passengers.map((passenger) => (
                        <MenuItem 
                          key={passenger.passenger_id} 
                          value={passenger.passenger_id.toString()}
                          onClick={() => handleRowClick('passenger', passenger.passenger_id)}
                        >
                          {passenger.prenom} {passenger.nom} (ID: {passenger.passenger_id})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={handleCreatePassenger}
                  disabled={submitting}
                  title="Créer un nouveau passager"
                  sx={{ height: '56px', minWidth: '120px' }}
                >
                  Nouveau
                </Button>
              </Box>
            </Box>

            {/* Flight Selection */}
            <FormControl fullWidth required disabled={submitting || loadingData.flights}>
              <InputLabel>Vol</InputLabel>
              <Select
                name="vol_num"
                value={formData.vol_num}
                onChange={handleSelectChange}
                label="Vol"
              >
                {loadingData.flights ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Chargement des vols...
                  </MenuItem>
                ) : flights.length === 0 ? (
                  <MenuItem disabled>
                    Aucun vol disponible
                  </MenuItem>
                ) : (
                  flights.map((flight) => (
                    <MenuItem 
                      key={flight.vol_num} 
                      value={flight.vol_num.toString()}
                      onClick={() => handleRowClick('flight', flight.vol_num)}
                    >
                      Vol #{flight.vol_num} → {flight.destination} 
                      (Départ: {formatDate(flight.departure_time)})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Seat Code */}
            <TextField
              fullWidth
              required
              label="Code siège"
              name="seatcode"
              value={formData.seatcode}
              onChange={handleChange}
              placeholder="Ex: 12A"
              disabled={submitting}
              helperText="Code du siège (ex: 12A, 15C, etc.)"
              error={!!error && error.includes("siège")}
            />

            {/* State and Guardian in row */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>État de la réservation</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleSelectChange}
                  label="État de la réservation"
                  disabled={submitting}
                >
                  <MenuItem value="Confirmed">Confirmée</MenuItem>
                  <MenuItem value="Pending">En attente</MenuItem>
                  <MenuItem value="Cancelled">Annulée</MenuItem>
                  <MenuItem value="Checked-in">Enregistrée</MenuItem>
                </Select>
              </FormControl>

              <TextField
                sx={{ flex: 1 }}
                label="ID Accompagnateur (optionnel)"
                name="guardian_id"
                value={formData.guardian_id}
                onChange={handleChange}
                placeholder="Ex: 1002"
                disabled={submitting}
                helperText="ID d'un autre passager qui accompagne"
                error={!!error && error.includes("accompagnateur")}
              />
            </Box>

            {/* Summary Section */}
            {formData.passenger_id && formData.vol_num && (
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Récapitulatif
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {formData.passenger_id && (
                    <Typography variant="body2">
                      <strong>Passager ID:</strong> {formData.passenger_id}
                    </Typography>
                  )}
                  {formData.vol_num && (
                    <Typography variant="body2">
                      <strong>Vol #:</strong> {formData.vol_num}
                    </Typography>
                  )}
                  {formData.seatcode && (
                    <Typography variant="body2">
                      <strong>Siège:</strong> {formData.seatcode}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>État:</strong> {formData.state}
                  </Typography>
                  {formData.guardian_id && (
                    <Typography variant="body2">
                      <strong>Accompagnateur ID:</strong> {formData.guardian_id}
                    </Typography>
                  )}
                </Box>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              justifyContent: 'flex-end', 
              mt: 2 
            }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleReset}
                disabled={submitting}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Réinitialiser
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={submitting}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
                sx={{ 
                  minWidth: { xs: '100%', sm: 'auto' },
                  bgcolor: "#1976d2", 
                  "&:hover": { bgcolor: "#1565c0" } 
                }}
              >
                {submitting ? "En cours..." : "Créer la réservation"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </PageContainer>
  );
}