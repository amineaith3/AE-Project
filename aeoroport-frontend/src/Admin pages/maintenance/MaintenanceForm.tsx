// src/pages/maintenance/MaintenanceForm.tsx
import * as React from "react";
import { useState, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';  // Corrected import
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface matching your POST endpoint
interface MaintenanceCreate {
  avion_id: number;
  operation_date: string; // Format: "YYYY-MM-DD"
  typee: string;
}

// Interface for aircraft
interface Aircraft {
  avion_id: number;
  modele: string;
  max_capacity: number;
  state: string;
}

// Aircraft states from your Pydantic Literal type
const AIRCRAFT_STATES = [
  "Ready",
  "Flying",
  "Turnaround",
  "Maintenance",
  "Out of Service"
] as const;

type AircraftState = typeof AIRCRAFT_STATES[number];

// Maintenance types
const MAINTENANCE_TYPES = ["Inspection", "Repair", "Cleaning"] as const;

export default function MaintenanceForm() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [loadingAircraft, setLoadingAircraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Available aircraft
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

  // Form state - initial values
  const [formData, setFormData] = useState<{
    avion_id: string;
    operation_date: Date | null;
    typee: typeof MAINTENANCE_TYPES[number];
  }>({
    avion_id: "",
    operation_date: null,
    typee: "Inspection",
  });

  // Charger les avions disponibles
  useEffect(() => {
    fetchAircrafts();
  }, []);

  const fetchAircrafts = async () => {
    setLoadingAircraft(true);
    try {
      const response = await api.get("/aircrafts/aircrafts/");
      const allAircrafts: Aircraft[] = response.data;
      
      // Filtrer les avions qui peuvent être en maintenance
      const availableAircrafts = allAircrafts.filter((a: Aircraft) => 
        a.state === "Ready" || a.state === "Out of Service"
      );
      
      setAircrafts(availableAircrafts);
    } catch (err) {
      console.error("Erreur chargement avions:", err);
      setError("Impossible de charger la liste des avions");
    } finally {
      setLoadingAircraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "typee") {
      setFormData(prev => ({
        ...prev,
        typee: value as typeof MAINTENANCE_TYPES[number]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      operation_date: value
    }));
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    

    setSubmitting(true);

    try {
      // Format date for API (YYYY-MM-DD)
      const operationDate = formData.operation_date!.toISOString().split('T')[0];

      // Prepare data for POST request
      const createData: MaintenanceCreate = {
        avion_id: parseInt(formData.avion_id),
        operation_date: operationDate,
        typee: formData.typee,
      };

      // Send POST request to your FastAPI backend
      const response = await api.post("/maintenance/maintenance/", createData);
      
      console.log("Maintenance créée :", response);

      setSuccess("Maintenance planifiée avec succès !");
      
      // Reset form on success
      setTimeout(() => {
        setFormData({
          avion_id: "",
          operation_date: null,
          typee: "Inspection",
        });
      }, 1500);

      // Redirect to maintenance list after success
      setTimeout(() => {
        navigate("/maintenance");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting maintenance:", err);
      
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
    navigate("/maintenance");
  };

  // Get aircraft state color
  const getAircraftStateColor = (state: string) => {
    switch (state) {
      case "Ready": return "success";
      case "Out of Service": return "error";
      case "Maintenance": return "warning";
      case "Flying": return "info";
      case "Turnaround": return "secondary";
      default: return "default";
    }
  };

  return (
    <PageContainer
      title="Nouvelle maintenance"
      breadcrumbs={[
        { title: "Maintenance" },
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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Planifier une nouvelle maintenance
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
              {/* Aircraft Selection Field - Required */}
              <TextField
                fullWidth
                select
                required
                label="Avion"
                name="avion_id"
                value={formData.avion_id}
                onChange={handleChange}
                disabled={submitting || loadingAircraft}
                helperText="Sélectionnez un avion disponible pour maintenance"
                error={!!error && error.includes("avion")}
                sx={{ maxWidth: '400px' }}
              >
                <MenuItem value="">
                  <em>Sélectionner un avion...</em>
                </MenuItem>
                {aircrafts.map((aircraft) => (
                  <MenuItem key={aircraft.avion_id} value={aircraft.avion_id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>
                        {aircraft.modele} (ID: {aircraft.avion_id})
                      </Typography>
                      <Chip 
                        label={aircraft.state} 
                        size="small" 
                        color={getAircraftStateColor(aircraft.state) as any}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Operation Date - Required */}
              <DatePicker
                label="Date d'opération"
                value={formData.operation_date}
                onChange={handleDateChange}
                disabled={submitting}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "Date prévue pour la maintenance",
                    error: !!error && error.includes("date"),
                    sx: { maxWidth: '300px' }
                  }
                }}
              />

              {/* Maintenance Type Field - Required */}
              <TextField
                fullWidth
                select
                required
                label="Type de maintenance"
                name="typee"
                value={formData.typee}
                onChange={handleChange}
                disabled={submitting}
                helperText="Type de maintenance à effectuer"
                error={!!error && error.includes("type")}
                sx={{ maxWidth: '300px' }}
              >
                {MAINTENANCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              {/* Selected Aircraft Information */}
              {formData.avion_id && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Information sur l'avion sélectionné:
                  </Typography>
                  {aircrafts
                    .filter(a => a.avion_id === parseInt(formData.avion_id))
                    .map(aircraft => (
                      <Box key={aircraft.avion_id} sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Modèle
                          </Typography>
                          <Typography variant="body1">
                            {aircraft.modele}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            État
                          </Typography>
                          <Chip 
                            label={aircraft.state} 
                            size="small" 
                            color={getAircraftStateColor(aircraft.state) as any}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Capacité maximale
                          </Typography>
                          <Typography variant="body1">
                            {aircraft.max_capacity} passagers
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Paper>
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
                  {submitting ? "En cours..." : "Créer la maintenance"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </LocalizationProvider>
    </PageContainer>
  );
}