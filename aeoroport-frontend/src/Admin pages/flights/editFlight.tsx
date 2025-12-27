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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface for update (PUT) - matches your FlightUpdate model
interface FlightUpdate {
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  avion_id?: number;
  state?: string;
}

// Flight states (adjust according to your Pydantic Literal type)
const FLIGHT_STATES = [
  "Scheduled",
  "Boarding",
  "Departed",
  "In Air",
  "Landed",
  "Cancelled",
  "Delayed"
] as const;

type FlightState = typeof FLIGHT_STATES[number];

// Type guard to check if a string is a valid FlightState
function isFlightState(state: string): state is FlightState {
  return FLIGHT_STATES.includes(state as FlightState);
}

// Get default state or validate existing state
function getValidFlightState(state: string): FlightState {
  return isFlightState(state) ? state : "Scheduled";
}

// Interface for existing flight data
interface FlightData {
  vol_num: number;
  destination: string;
  departure_time: string;
  arrival_time: string;
  avion_id: number;
  state: string;
}

export default function VolEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const flightNum = parseInt(id || "0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Available aircraft for selection
  const [availableAircraft, setAvailableAircraft] = useState<Array<{id: number, modele: string}>>([]);
  const [loadingAircraft, setLoadingAircraft] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    destination: "",
    departure_time: "",
    arrival_time: "",
    avion_id: "",
    state: "Scheduled" as FlightState,
  });

  // Fetch existing flight data and available aircraft
  useEffect(() => {
    if (flightNum) {
      fetchFlightData(flightNum);
      fetchAvailableAircraft();
    }
  }, [flightNum]);

  const fetchFlightData = async (flightNum: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/flights/flights/${flightNum}`);
      const data: FlightData = response.data;
      
      // Format dates for datetime-local input
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      };

      setFormData({
        destination: data.destination || "",
        departure_time: data.departure_time ? formatDateForInput(data.departure_time) : "",
        arrival_time: data.arrival_time ? formatDateForInput(data.arrival_time) : "",
        avion_id: data.avion_id?.toString() || "",
        state: getValidFlightState(data.state),
      });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Vol non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les données du vol");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAircraft = async () => {
    setLoadingAircraft(true);
    try {
      const response = await api.get("/aircrafts/aircrafts");
      setAvailableAircraft(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des avions:", err);
      setError("Impossible de charger la liste des avions disponibles");
    } finally {
      setLoadingAircraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle state field specially to ensure type safety
    if (name === "state") {
      setFormData(prev => ({
        ...prev,
        state: getValidFlightState(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (formData.departure_time && formData.arrival_time) {
      const departure = new Date(formData.departure_time);
      const arrival = new Date(formData.arrival_time);
      
      if (arrival <= departure) {
        setError("L'heure d'arrivée doit être postérieure à l'heure de départ");
        return;
      }
    }

    setSubmitting(true);

    try {
      // Prepare data for PUT request
      const updateData: FlightUpdate = {};
      
      // Only include changed fields
      if (formData.destination) updateData.destination = formData.destination;
      if (formData.departure_time) updateData.departure_time = formData.departure_time;
      if (formData.arrival_time) updateData.arrival_time = formData.arrival_time;
      if (formData.avion_id) updateData.avion_id = parseInt(formData.avion_id);
      if (formData.state) updateData.state = formData.state;

      // Send PUT request to update flight
      const response = await api.put(
        `/flights/flights/${flightNum}`,
        updateData
      );
      
      console.log("Vol mis à jour :", response);
      setSuccess("Vol modifié avec succès !");

      // Redirect to details page after success
      setTimeout(() => {
        navigate(`/vols/${flightNum}`);
      }, 1500);

    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du vol:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 404) {
            setError("Vol non trouvé");
          } else if (err.response.status === 400) {
            setError("Erreur de validation. Vérifiez les données saisies.");
          } else {
            setError(`Erreur serveur (${err.response.status})`);
          }
        } else if (err.request) {
          setError("Pas de réponse du serveur. Vérifiez que le serveur FastAPI est en marche sur http://localhost:8000");
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
    navigate(`/vols/${flightNum}`);
  };

  if (loading) {
    return (
      <PageContainer
        title="Modifier le vol"
        breadcrumbs={[
          { title: "Vols" },
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

  return (
    <PageContainer
      title="Modifier le vol"
      breadcrumbs={[
        { title: "Vols" },
        { title: "Détails" },
        { title: "Modifier" },
      ]}
      actions={
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          Retour aux détails
        </Button>
      }
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Modifier le vol #{flightNum}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Read-only Flight Number */}
            <TextField
              fullWidth
              label="Numéro de vol"
              value={flightNum}
              disabled
              helperText="Numéro du vol (ne peut pas être modifié)"
              InputProps={{
                readOnly: true,
              }}
            />

            {/* Destination Field */}
            <TextField
              fullWidth
              label="Destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Ex: Paris, New York, Tokyo"
              disabled={submitting}
              helperText="Destination du vol"
            />

            {/* Departure Time Field */}
            <TextField
              fullWidth
              label="Heure de départ"
              name="departure_time"
              type="datetime-local"
              value={formData.departure_time}
              onChange={handleChange}
              disabled={submitting}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Date et heure de départ"
            />

            {/* Arrival Time Field */}
            <TextField
              fullWidth
              label="Heure d'arrivée"
              name="arrival_time"
              type="datetime-local"
              value={formData.arrival_time}
              onChange={handleChange}
              disabled={submitting}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Date et heure d'arrivée"
            />

            {/* Aircraft Selection */}
            <TextField
              fullWidth
              select
              label="Avion"
              name="avion_id"
              value={formData.avion_id}
              onChange={handleChange}
              disabled={submitting || loadingAircraft}
              helperText="Sélectionnez l'avion pour ce vol"
            >
              <MenuItem value="">
                <em>Aucun</em>
              </MenuItem>
              {availableAircraft.map((aircraft) => (
                <MenuItem key={aircraft.id} value={aircraft.id}>
                  {aircraft.modele} (ID: {aircraft.id})
                </MenuItem>
              ))}
            </TextField>

            {/* Flight State Field */}
            <TextField
              fullWidth
              select
              label="Statut du vol"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={submitting}
              helperText="Statut actuel du vol"
              sx={{ maxWidth: '300px' }}
            >
              {FLIGHT_STATES.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>

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