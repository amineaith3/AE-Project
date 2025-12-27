import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface matching your POST endpoint
interface FlightCreate {
  vol_num: number;
  destination: string;
  departure_time: Date;
  arrival_time: Date;
  avion_id: number;
  state: string;
}

// Flight states (assuming from your models)
const FLIGHT_STATES = [
  "Scheduled",
  "Boarding",
  "In Flight",
  "Landed",
  "Cancelled",
  "Delayed"
] as const;

type FlightState = typeof FLIGHT_STATES[number];

export default function FlightForm() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - initial values
  const [formData, setFormData] = useState<{
    vol_num: string;
    destination: string;
    departure_time: Date | null;
    arrival_time: Date | null;
    avion_id: string;
    state: FlightState;
  }>({
    vol_num: "",
    destination: "",
    departure_time: null,
    arrival_time: null,
    avion_id: "",
    state: "Scheduled",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateTimeChange = (field: 'departure_time' | 'arrival_time') => (value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.vol_num) return "Le numéro de vol est requis";
    if (!formData.destination.trim()) return "La destination est requise";
    if (!formData.departure_time) return "L'heure de départ est requise";
    if (!formData.arrival_time) return "L'heure d'arrivée est requise";
    if (!formData.avion_id) return "L'ID de l'avion est requis";
    
    if (formData.arrival_time <= formData.departure_time) {
      return "L'heure d'arrivée doit être après l'heure de départ";
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
      const createData = {
        vol_num: parseInt(formData.vol_num),
        destination: formData.destination.trim(),
        departure_time: formData.departure_time!.toISOString(),
        arrival_time: formData.arrival_time!.toISOString(),
        avion_id: parseInt(formData.avion_id),
        state: formData.state,
      };
      

      // Send POST request to your FastAPI backend
      const response = await api.post("/flights/flights/", createData);
      
      console.log("Flight created: ", response);

      setSuccess("Vol créé avec succès !");
      
      // Reset form on success
      setTimeout(() => {
        setFormData({
          vol_num: "",
          destination: "",
          departure_time: null,
          arrival_time: null,
          avion_id: "",
          state: "Scheduled",
        });
      }, 1500);

      // Redirect to flights list after success
      setTimeout(() => {
        navigate("/vols");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting flight:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle database errors from FastAPI
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 400) {
            setError("Erreur de validation. Vérifiez les données saisies.");
          } else if (err.response.status === 404) {
            setError("Avion non trouvé. Vérifiez l'ID de l'avion.");
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
    navigate("/flights");
  };

  return (
    <PageContainer
      title="Nouveau vol"
      breadcrumbs={[
        { title: "Vols" },
        { title: "Nouveau" },
      ]}
      actions={
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          Retour
        </Button>
      }
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Créer un nouveau vol
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Flight Number Field - Required */}
              <TextField
                fullWidth
                required
                label="Numéro de vol"
                name="vol_num"
                value={formData.vol_num}
                onChange={handleChange}
                placeholder="Ex: 1234"
                disabled={submitting}
                helperText="Numéro unique identifiant le vol"
                error={!!error && error.includes("vol_num")}
                sx={{ maxWidth: '300px' }}
              />

              {/* Destination Field - Required */}
              <TextField
                fullWidth
                required
                label="Destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Ex: Paris CDG"
                disabled={submitting}
                helperText="Aéroport de destination"
                error={!!error && error.includes("destination")}
                sx={{ maxWidth: '400px' }}
              />

              {/* Aircraft ID Field - Required */}
              <TextField
                fullWidth
                required
                label="ID Avion"
                name="avion_id"
                type="number"
                value={formData.avion_id}
                onChange={handleChange}
                placeholder="Ex: 1001"
                disabled={submitting}
                helperText="ID de l'avion assigné à ce vol"
                error={!!error && error.includes("avion_id")}
                sx={{ maxWidth: '300px' }}
                InputProps={{
                  inputProps: { 
                    min: 1,
                    step: 1
                  }
                }}
              />

              {/* Departure Time - Required */}
              <DateTimePicker
                label="Heure de départ"
                value={formData.departure_time}
                onChange={handleDateTimeChange('departure_time')}
                disabled={submitting}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "Date et heure de départ",
                    error: !!error && error.includes("départ"),
                    sx: { maxWidth: '400px' }
                  }
                }}
              />

              {/* Arrival Time - Required */}
              <DateTimePicker
                label="Heure d'arrivée"
                value={formData.arrival_time}
                onChange={handleDateTimeChange('arrival_time')}
                disabled={submitting}
                minDateTime={formData.departure_time || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "Date et heure d'arrivée (doit être après le départ)",
                    error: !!error && error.includes("arrivée"),
                    sx: { maxWidth: '400px' }
                  }
                }}
              />

              {/* State Field - Optional with default */}
              <TextField
                fullWidth
                select
                label="Statut"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={submitting}
                helperText="Statut initial du vol"
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
                  {submitting ? "En cours..." : "Créer le vol"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </LocalizationProvider>
    </PageContainer>
  );
}