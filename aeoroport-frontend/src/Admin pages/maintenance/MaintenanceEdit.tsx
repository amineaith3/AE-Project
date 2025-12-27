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
import BuildIcon from "@mui/icons-material/Build";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface for update (PUT) - matches your MaintenanceUpdate model
interface MaintenanceUpdate {
  operation_date?: string;
  typee?: string;
  state?: string;
}

// Maintenance types (adjust according to your Pydantic model)
const MAINTENANCE_TYPES = [
  "Inspection",
  "Repair",
  "Cleaning",
  "Overhaul",
  "Check"
] as const;

type MaintenanceType = typeof MAINTENANCE_TYPES[number];

// NEW: Maintenance states in English as per your requirement
const MAINTENANCE_STATES = [
  "Scheduled",
  "In Progress", 
  "Completed"
] as const;

type MaintenanceState = typeof MAINTENANCE_STATES[number];

// Type guard to check if a string is a valid MaintenanceType
function isMaintenanceType(typee: string): typee is MaintenanceType {
  return MAINTENANCE_TYPES.includes(typee as MaintenanceType);
}

// Type guard to check if a string is a valid MaintenanceState
function isMaintenanceState(state: string): state is MaintenanceState {
  return MAINTENANCE_STATES.includes(state as MaintenanceState);
}

// Get default type or validate existing type
function getValidMaintenanceType(typee: string): MaintenanceType {
  return isMaintenanceType(typee) ? typee : "Inspection";
}

// Get default state or validate existing state
function getValidMaintenanceState(state: string): MaintenanceState {
  return isMaintenanceState(state) ? state : "Scheduled";
}

// Map English states to French for display
const stateToFrench: Record<MaintenanceState, string> = {
  "Scheduled": "Planifiée",
  "In Progress": "En cours",
  "Completed": "Terminée"
};

// Map French to English for API (inverse mapping)
const frenchToEnglish: Record<string, MaintenanceState> = {
  "Planifiée": "Scheduled",
  "En cours": "In Progress",
  "Terminée": "Completed"
};

// Map types to French for display
const typeToFrench: Record<string, string> = {
  "Inspection": "Inspection",
  "Repair": "Réparation", 
  "Cleaning": "Nettoyage",
  "Overhaul": "Révision",
  "Check": "Contrôle"
};

// Map French to English for API
const frenchTypeToEnglish: Record<string, string> = {
  "Inspection": "Inspection",
  "Réparation": "Repair",
  "Nettoyage": "Cleaning", 
  "Révision": "Overhaul",
  "Contrôle": "Check"
};

// Interface for existing maintenance data
interface MaintenanceData {
  maintenance_id: number;
  avion_id: number;
  operation_date: string;
  typee: string;
  state: string;
  modele?: string;
}

export default function MaintenanceEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const maintenanceId = parseInt(id || "0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Available aircraft for reference (display only)
  const [aircraftInfo, setAircraftInfo] = useState<{id: number, modele: string} | null>(null);
  const [loadingAircraft, setLoadingAircraft] = useState(false);

  // Form state - storing English values internally
  const [formData, setFormData] = useState({
    operation_date: "",
    typee: "Inspection" as MaintenanceType,
    state: "Scheduled" as MaintenanceState,
  });

  // Fetch existing maintenance data
  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenanceData(maintenanceId);
    }
  }, [maintenanceId]);

  const fetchMaintenanceData = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/maintenance/maintenance/${id}`);
      const data: MaintenanceData = response.data;
      
      // Format date for date input
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        } catch (e) {
          return dateString;
        }
      };

      // Convert any state value to valid MaintenanceState
      let validState: MaintenanceState;
      if (isMaintenanceState(data.state)) {
        validState = data.state;
      } else {
        // Try to convert from French or default to Scheduled
        const englishState = frenchToEnglish[data.state] || "Scheduled";
        validState = getValidMaintenanceState(englishState);
      }

      setFormData({
        operation_date: data.operation_date ? formatDateForInput(data.operation_date) : "",
        typee: getValidMaintenanceType(data.typee || "Inspection"),
        state: validState,
      });

      // Store aircraft info for display
      if (data.avion_id) {
        fetchAircraftDetails(data.avion_id);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Maintenance non trouvée");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les données de la maintenance");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAircraftDetails = async (aircraftId: number) => {
    setLoadingAircraft(true);
    try {
      const response = await api.get(`/aircrafts/aircrafts/${aircraftId}`);
      setAircraftInfo({
        id: response.data.avion_id,
        modele: response.data.modele || `Avion ${response.data.avion_id}`
      });
    } catch (err) {
      console.error("Erreur lors du chargement des détails de l'avion:", err);
      // Don't set error, just show default info
      setAircraftInfo({
        id: aircraftId,
        modele: `Avion ${aircraftId}`
      });
    } finally {
      setLoadingAircraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "typee") {
      // Convert French back to English for storage
      const englishType = frenchTypeToEnglish[value] || value;
      setFormData(prev => ({
        ...prev,
        typee: getValidMaintenanceType(englishType)
      }));
    } else if (name === "state") {
      // Convert French display value back to English for storage
      const englishState = frenchToEnglish[value] || value;
      setFormData(prev => ({
        ...prev,
        state: getValidMaintenanceState(englishState)
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
    if (!formData.operation_date) {
      setError("La date d'opération est requise");
      return;
    }

    const operationDate = new Date(formData.operation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow past dates for Completed or In Progress states
    if (formData.state === "Scheduled" && operationDate < today) {
      setError("La date d'opération ne peut pas être dans le passé pour une maintenance planifiée");
      return;
    }

    if (!formData.typee) {
      setError("Le type de maintenance est requis");
      return;
    }

    if (!formData.state) {
      setError("L'état de la maintenance est requis");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for PUT request - only fields from MaintenanceUpdate
      const updateData: MaintenanceUpdate = {
        operation_date: formData.operation_date,
        typee: formData.typee,
        state: formData.state,
      };

      // Send PUT request to update maintenance
      const response = await api.put(
        `/maintenance/maintenance/${maintenanceId}`,
        updateData
      );
      
      console.log("Maintenance mise à jour :", response);
      setSuccess("Maintenance modifiée avec succès !");

      // Redirect to details page after success
      setTimeout(() => {
        navigate(`/maintenance/${maintenanceId}`);
      }, 1500);

    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la maintenance:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 404) {
            setError("Maintenance non trouvée");
          } else if (err.response.status === 400) {
            setError("Erreur de validation. Vérifiez les données saisies.");
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
    navigate(`/maintenance/${maintenanceId}`);
  };

  // Get color for state chip
  const getStateColor = (state: MaintenanceState): "success" | "warning" | "info" | "error" | "default" => {
    switch(state) {
      case "Scheduled": return "info";
      case "In Progress": return "warning";
      case "Completed": return "success";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <PageContainer
        title="Modifier la maintenance"
        breadcrumbs={[
          { title: "Maintenances" },
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
      title="Modifier la maintenance"
      breadcrumbs={[
        { title: "Maintenances" },
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
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Modifier la maintenance #{maintenanceId}
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
            {/* Read-only Maintenance ID */}
            <TextField
              fullWidth
              label="ID Maintenance"
              value={maintenanceId}
              disabled
              helperText="Identifiant de la maintenance (ne peut pas être modifié)"
              InputProps={{
                readOnly: true,
              }}
            />

            {/* Read-only Aircraft Info */}
            {aircraftInfo && (
              <TextField
                fullWidth
                label="Avion assigné"
                value={`${aircraftInfo.modele} (ID: ${aircraftInfo.id})`}
                disabled
                helperText="L'avion assigné à cette maintenance (ne peut pas être modifié)"
                InputProps={{
                  readOnly: true,
                  startAdornment: loadingAircraft ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : null,
                }}
              />
            )}

            {/* Operation Date Field */}
            <TextField
              fullWidth
              required
              label="Date d'opération"
              name="operation_date"
              type="date"
              value={formData.operation_date}
              onChange={handleChange}
              disabled={submitting}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Date prévue pour l'opération de maintenance"
              sx={{ maxWidth: '300px' }}
            />

            {/* Maintenance Type Field */}
            <TextField
              fullWidth
              select
              required
              label="Type de maintenance"
              name="typee"
              value={typeToFrench[formData.typee] || formData.typee}
              onChange={handleChange}
              disabled={submitting}
              helperText="Type d'opération de maintenance"
              sx={{ maxWidth: '300px' }}
            >
              {MAINTENANCE_TYPES.map((type) => (
                <MenuItem key={type} value={typeToFrench[type] || type}>
                  {typeToFrench[type] || type}
                </MenuItem>
              ))}
            </TextField>

            {/* Maintenance State Field */}
            <TextField
              fullWidth
              select
              required
              label="État de la maintenance"
              name="state"
              value={stateToFrench[formData.state] || formData.state}
              onChange={handleChange}
              disabled={submitting}
              helperText="État actuel de la maintenance"
              sx={{ maxWidth: '300px' }}
              // Display current state with chip
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 
                          formData.state === "Scheduled" ? '#0288d1' :
                          formData.state === "In Progress" ? '#f57c00' :
                          '#2e7d32',
                        mr: 1
                      }}
                    />
                  </Box>
                ),
              }}
            >
              {MAINTENANCE_STATES.map((state) => (
                <MenuItem key={state} value={stateToFrench[state]}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 
                          state === "Scheduled" ? '#0288d1' :
                          state === "In Progress" ? '#f57c00' :
                          '#2e7d32'
                      }}
                    />
                    <Typography>{stateToFrench[state]}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      ({state})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* State Information Display */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Signification des états :
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#0288d1' }} />
                  <Typography variant="body2">Planifiée (Scheduled)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f57c00' }} />
                  <Typography variant="body2">En cours (In Progress)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                  <Typography variant="body2">Terminée (Completed)</Typography>
                </Box>
              </Box>
            </Box>

            {/* Additional Information Section */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Règles de validation :
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Une maintenance <strong>planifiée</strong> ne peut pas avoir une date passée
                <br />
                • Une maintenance <strong>en cours</strong> peut avoir une date dans le passé
                <br />
                • Une maintenance <strong>terminée</strong> peut avoir une date dans le passé
                <br />
                • L'avion assigné ne peut pas être modifié via cette interface
              </Typography>
            </Box>

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