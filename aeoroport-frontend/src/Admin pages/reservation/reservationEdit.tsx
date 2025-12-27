// src/pages/reservations/ReservationEditForm.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import FlightIcon from "@mui/icons-material/Flight";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface for update (PUT) - matches your ReservationUpdate model
interface ReservationUpdate {
  vol_num?: number;
  seatcode?: string;
  state?: string;
}

// Interface for full reservation data - matches ReservationOut model
interface ReservationOut {
  reservation_id: number;
  passenger_id: number;
  vol_num: number;
  seatcode: string;
  state: string;
  guardian_id?: number | null;
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

interface PassengerOut {
  passenger_id: number;
  prenom: string;
  nom: string;
  num_passeport: number;
  contact: string;
  nationality: string;
  age: number;
}

// Reservation states for dropdown - Updated to match your database constraints
const RESERVATION_STATES = [
  { 
    value: "Pending", 
    label: "En attente",
    description: "La réservation est en attente de confirmation",
    icon: <HourglassEmptyIcon fontSize="small" />,
    color: "warning.main"
  },
  { 
    value: "Confirmed", 
    label: "Confirmée",
    description: "La réservation est confirmée",
    icon: <CheckCircleIcon fontSize="small" />,
    color: "success.main"
  },
  { 
    value: "Cancelled", 
    label: "Annulée",
    description: "La réservation est annulée",
    icon: <CancelIcon fontSize="small" />,
    color: "error.main"
  },
  { 
    value: "Boarded", 
    label: "Embarquée",
    description: "Le passager a embarqué",
    icon: <AirplanemodeActiveIcon fontSize="small" />,
    color: "info.main"
  },
] as const;

export default function ReservationEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const passportNum = parseInt(id || "0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for reservation data
  const [reservation, setReservation] = useState<ReservationOut | null>(null);
  const [passenger, setPassenger] = useState<PassengerOut | null>(null);
  const [flights, setFlights] = useState<FlightOut[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);

  // Form state - for editing only
  const [formData, setFormData] = useState({
    vol_num: "",
    seatcode: "",
    state: "Confirmed",
  });

  // Fetch existing reservation data for editing
  useEffect(() => {
    if (passportNum) {
      fetchReservationData(passportNum);
      fetchFlights();
    }
  }, [passportNum]);

  const fetchReservationData = async (reservationId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/reservations/reservations/passport/${passportNum}`);
      const data: ReservationOut = response.data;
      setReservation(data);
      setFormData({
        vol_num: data.vol_num.toString(),
        seatcode: data.seatcode,
        state: data.state,
      });

      // Fetch passenger details
      if (data.passenger_id) {
        fetchPassengerData(data.passenger_id);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Réservation non trouvée");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les données de la réservation");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassengerData = async (passengerId: number) => {
    try {
      const response = await api.get(`/passengers/passengers/${passengerId}`);
      setPassenger(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement du passager:", err);
    }
  };

  const fetchFlights = async () => {
    setLoadingFlights(true);
    try {
      const response = await api.get("/flights/flights");
      setFlights(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des vols:", err);
    } finally {
      setLoadingFlights(false);
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
    if (!formData.vol_num) {
      return "Le vol est requis";
    }
    
    if (!formData.seatcode.trim()) {
      return "Le code siège est requis";
    }
    
    if (!formData.state) {
      return "L'état de la réservation est requis";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if seatcode has changed
    if (reservation && formData.seatcode !== reservation.seatcode) {
      if (!window.confirm(`Changer le siège de ${reservation.seatcode} à ${formData.seatcode} ?`)) {
        return;
      }
    }

    // Check if flight has changed
    if (reservation && formData.vol_num !== reservation.vol_num.toString()) {
      const newFlight = flights.find(f => f.vol_num.toString() === formData.vol_num);
      const oldFlight = flights.find(f => f.vol_num === reservation.vol_num);
      
      if (newFlight && oldFlight) {
        const message = `Changer le vol de #${oldFlight.vol_num} (${oldFlight.destination}) à #${newFlight.vol_num} (${newFlight.destination}) ?`;
        if (!window.confirm(message)) {
          return;
        }
      }
    }

    // Special confirmation for certain state changes
    if (reservation && formData.state !== reservation.state) {
      const oldState = RESERVATION_STATES.find(s => s.value === reservation.state);
      const newState = RESERVATION_STATES.find(s => s.value === formData.state);
      
      if (oldState && newState) {
        // Confirm cancellation
        if (newState.value === "Cancelled") {
          if (!window.confirm(`Êtes-vous sûr de vouloir annuler cette réservation ?\n\nCette action est irréversible.`)) {
            return;
          }
        }
        
        // Confirm boarding (usually requires check-in first)
        if (newState.value === "Boarded" && reservation.state !== "Confirmed") {
          if (!window.confirm(`Marquer la réservation comme 'Embarquée' ?\n\nAssurez-vous que le passager a bien enregistré.`)) {
            return;
          }
        }
      }
    }

    setSubmitting(true);

    try {
      // Prepare data for PUT request (update)
      const updateData: ReservationUpdate = {
        vol_num: parseInt(formData.vol_num),
        seatcode: formData.seatcode.trim(),
        state: formData.state,
      };
      
      // Send PUT request to update reservation
      const response = await api.put(`/reservations/reservations/${reservation?.reservation_id}`, updateData);
      console.log("Reservation updated:", response);
      
      setSuccess("Réservation modifiée avec succès !");

      // Redirect to details page after success
      setTimeout(() => {
        navigate(`/reservations/${reservation?.reservation_id}`);
      }, 1500);

    } catch (err: any) {
      console.error("Error updating reservation:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 404) {
            setError("Réservation non trouvée");
          } else if (err.response.status === 400) {
            setError("Erreur de validation. Vérifiez les données saisies.");
          } else if (err.response.status === 409) {
            setError("Ce siège est déjà occupé sur ce vol.");
          } else {
            setError(`Erreur serveur (${err.response.status})`);
          }
        } else if (err.request) {
          setError("Pas de réponse du serveur. Vérifiez que le serveur FastAPI est en marche");
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

  const handleCancel = () => {
    navigate(`/reservations/${reservation?.reservation_id}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  // Get selected flight info
  const selectedFlight = flights.find(f => f.vol_num.toString() === formData.vol_num);

  // Get current state info
  const currentStateInfo = RESERVATION_STATES.find(s => s.value === formData.state);

  if (loading) {
    return (
      <PageContainer
        title="Modifier la réservation"
        breadcrumbs={[
          { title: "Réservations" },
          { title: "Détails" },
          { title: "Modifier" },
        ]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!reservation) {
    return (
      <PageContainer
        title="Modifier la réservation"
        breadcrumbs={[
          { title: "Réservations" },
          { title: "Modifier" },
        ]}
      >
        <Alert severity="error">
          Réservation non trouvée
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Modifier la réservation"
      breadcrumbs={[
        { title: "Réservations" },
        { title: "Détails" },
        { title: "Modifier" },
      ]}
      actions={
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          disabled={submitting}
        >
          Retour aux détails
        </Button>
      }
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightIcon />
          Modifier la réservation #{reservation.reservation_id}
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

        {/* Reservation and Passenger Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Informations de base (non modifiables)
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>ID Réservation:</strong> {reservation.reservation_id}
            </Typography>
            
            {passenger && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  <strong>Passager:</strong> {passenger.prenom} {passenger.nom} (ID: {passenger.passenger_id})
                </Typography>
              </Box>
            )}
            
            {reservation.guardian_id && (
              <Typography variant="body2">
                <strong>Accompagnateur ID:</strong> {reservation.guardian_id}
              </Typography>
            )}
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Flight Selection */}
            <FormControl fullWidth required disabled={submitting || loadingFlights}>
              <InputLabel>Vol</InputLabel>
              <Select
                name="vol_num"
                value={formData.vol_num}
                onChange={handleSelectChange}
                label="Vol"
              >
                {loadingFlights ? (
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
                    <MenuItem key={flight.vol_num} value={flight.vol_num.toString()}>
                      Vol #{flight.vol_num} → {flight.destination} 
                      (Départ: {formatDate(flight.departure_time)})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Flight Info if selected */}
            {selectedFlight && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'info.light', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'info.main',
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informations du vol sélectionné:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2">
                    <strong>Destination:</strong> {selectedFlight.destination}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Départ:</strong> {formatDate(selectedFlight.departure_time)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Arrivée:</strong> {formatDate(selectedFlight.arrival_time)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Avion ID:</strong> {selectedFlight.avion_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>État du vol:</strong> {selectedFlight.state}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Capacité:</strong> {selectedFlight.current_capacity}
                  </Typography>
                </Box>
              </Box>
            )}

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
              InputProps={{
                startAdornment: (
                  <EventSeatIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                ),
              }}
              sx={{ maxWidth: '200px' }}
            />

            {/* State Selection */}
            <Box>
              <FormControl sx={{ maxWidth: '300px', mb: 1 }}>
                <InputLabel>État de la réservation</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleSelectChange}
                  label="État de la réservation"
                  disabled={submitting}
                >
                  {RESERVATION_STATES.map((state) => (
                    <MenuItem key={state.value} value={state.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {state.icon}
                        {state.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Current state info */}
              {currentStateInfo && (
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: 2,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: `${currentStateInfo.color}20`,
                  color: currentStateInfo.color,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}>
                  {currentStateInfo.icon}
                  <span>{currentStateInfo.description}</span>
                </Box>
              )}
            </Box>

            {/* State Information */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                États disponibles :
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {RESERVATION_STATES.map((state) => (
                  <Box 
                    key={state.value} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: state.value === formData.state ? `${state.color}10` : 'transparent',
                      border: state.value === formData.state ? `1px solid ${state.color}30` : 'none',
                    }}
                  >
                    <Box sx={{ color: state.color, mt: 0.5 }}>
                      {state.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: state.value === formData.state ? state.color : 'text.primary'
                        }}
                      >
                        {state.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {state.description}
                      </Typography>
                    </Box>
                    {state.value === formData.state && (
                      <CheckCircleIcon sx={{ color: state.color, fontSize: 16 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Changes Summary */}
            {reservation && (
              <Box sx={{ 
                p: 2, 
                bgcolor: 'warning.light', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main',
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Modifications proposées :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {formData.vol_num !== reservation.vol_num.toString() && (
                    <Typography variant="body2">
                      <strong>Vol:</strong> #{reservation.vol_num} → #{formData.vol_num}
                    </Typography>
                  )}
                  {formData.seatcode !== reservation.seatcode && (
                    <Typography variant="body2">
                      <strong>Siège:</strong> {reservation.seatcode} → {formData.seatcode}
                    </Typography>
                  )}
                  {formData.state !== reservation.state && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>État:</strong>
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        bgcolor: 'white',
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}>
                        {RESERVATION_STATES.find(s => s.value === reservation.state)?.icon}
                        <Typography variant="body2" color="text.secondary">
                          {RESERVATION_STATES.find(s => s.value === reservation.state)?.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2">→</Typography>
                      <Box sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        bgcolor: 'white',
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}>
                        {currentStateInfo?.icon}
                        <Typography variant="body2" color={currentStateInfo?.color}>
                          {currentStateInfo?.label}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {formData.vol_num === reservation.vol_num.toString() && 
                   formData.seatcode === reservation.seatcode && 
                   formData.state === reservation.state && (
                    <Typography variant="body2" color="text.secondary">
                      Aucune modification détectée
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              mt: 2
            }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
              >
                {submitting ? "En cours..." : "Mettre à jour"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </PageContainer>
  );
}