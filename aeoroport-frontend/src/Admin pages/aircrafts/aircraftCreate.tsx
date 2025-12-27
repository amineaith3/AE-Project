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
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface matching your POST endpoint
interface AircraftCreate {
  avion_id: number;
  modele: string;
  max_capacity: number;
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

export default function AvionForm() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - initial values
  const [formData, setFormData] = useState({
    avion_id: "",
    modele: "",
    max_capacity: "150",
    state: "Ready" as AircraftState,
  });

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
      // Prepare data for POST request
      const createData: AircraftCreate = {
        avion_id: parseInt(formData.avion_id),
        modele: formData.modele,
        max_capacity: parseInt(formData.max_capacity),
        state: formData.state,
      };

      // Send POST request to your FastAPI backend
      // Using the exact endpoint from your router: POST /aircrafts/
      const response=await api.post("/aircrafts/aircrafts/", createData);
      
      console.log("post aircraft: ",response)

      setSuccess("Avion ajouté avec succès !");
      
      // Reset form on success
      setTimeout(() => {
        setFormData({
          avion_id: "",
          modele: "",
          max_capacity: "150",
          state: "Ready",
        });
      }, 1500);

      // Redirect to aircraft list after success
      setTimeout(() => {
        navigate("/avions");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting aircraft:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle Oracle database errors from FastAPI
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
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
    navigate("/avions");
  };

  return (
    <PageContainer
      title="Nouvel avion"
      breadcrumbs={[
        { title: "Avions" },  // Fixed: removed onClick
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
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ajouter un nouvel avion
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
            {/* ID Field - Required */}
            <TextField
              fullWidth
              required
              label="ID Avion"
              name="avion_id"
              value={formData.avion_id}
              onChange={handleChange}
              placeholder="Ex: 1001"
              disabled={submitting}
              helperText="Numéro unique identifiant l'avion"
              error={!!error && error.includes("ID")}
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
              error={!!error && error.includes("modèle")}
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
              error={!!error && error.includes("capacité")}
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
                {submitting ? "En cours..." : "Ajouter"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </PageContainer>
  );
}