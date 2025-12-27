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

// Interface for update (PUT) - matches your AircraftUpdate model
interface AircraftUpdate {
  modele?: string;
  max_capacity?: number;
  state?: string;
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

export default function AvionEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const aircraftId = parseInt(id || "0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - for editing only
  const [formData, setFormData] = useState({
    modele: "",
    max_capacity: "",
    state: "Ready" as AircraftState,
  });

  // Fetch existing aircraft data for editing
  useEffect(() => {
    if (aircraftId) {
      fetchAircraftData(aircraftId);
    }
  }, [aircraftId]);

  const fetchAircraftData = async (aircraftId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/aircrafts/aircrafts/${aircraftId}`);
      const data = response.data;
      setFormData({
        modele: data.modele,
        max_capacity: data.max_capacity.toString(),
        state: data.state,
      });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Avion non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les données de l'avion");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);


    setSubmitting(true);

    try {
      // Prepare data for PUT request (update)
      const updateData: AircraftUpdate = {
        modele: formData.modele,
        max_capacity: parseInt(formData.max_capacity),
        state: formData.state,
      };
      
      // Remove undefined fields (optional fields that weren't changed)
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof AircraftUpdate] === undefined) {
          delete updateData[key as keyof AircraftUpdate];
        }
      });

      // Send PUT request to update aircraft
      const response=await api.put(`/aircrafts/aircrafts/${aircraftId}`, updateData);
      console.log("updated aircraft :",response)
      setSuccess("Avion modifié avec succès !");

      // Redirect to details page after success
      setTimeout(() => {
        navigate(`/avions/${aircraftId}`);
      }, 1500);

    } catch (err: any) {
      console.error("Error updating aircraft:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle Oracle database errors from FastAPI
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 404) {
            setError("Avion non trouvé");
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
    navigate(`/avions/${aircraftId}`);
  };

  if (loading) {
    return (
      <PageContainer
        title="Modifier l'avion"
        breadcrumbs={[
          { title: "Avions" },
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
      title="Modifier l'avion"
      breadcrumbs={[
        { title: "Avions" },
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
          Modifier l'avion #{aircraftId}
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
            {/* Read-only ID field */}
            <TextField
              fullWidth
              label="ID Avion"
              value={aircraftId}
              disabled
              helperText="ID de l'avion (ne peut pas être modifié)"
              InputProps={{
                readOnly: true,
              }}
            />

            {/* Model Field - Required */}
            <TextField
              fullWidth
              required
              label="Modèle"
              name="modele"
              value={formData.modele}
              onChange={handleChange}
              placeholder="Ex: Boeing 737-800"
              disabled={submitting}
              helperText="Modèle de l'avion"
            />

            {/* Capacity Field - Required */}
            <TextField
              fullWidth
              required
              label="Capacité maximale"
              name="max_capacity"
              type="number"
              value={formData.max_capacity}
              onChange={handleChange}
              InputProps={{
                inputProps: { 
                  min: 1, 
                  max: 1000,
                  step: 1
                }
              }}
              helperText="Nombre maximum de passagers"
              disabled={submitting}
            />

            {/* State Field - Optional */}
            <TextField
              fullWidth
              select
              label="Statut"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={submitting}
              helperText="Statut actuel de l'avion"
              sx={{ maxWidth: '300px' }}
            >
              {AIRCRAFT_STATES.map((state) => (
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