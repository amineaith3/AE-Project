// src/pages/enregistrement/PassengerCreate.tsx
import * as React from "react";
import { useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface matching your POST endpoint
interface PassengerCreate {
  passenger_id: number;
  prenom: string;
  nom: string;
  num_passeport: number;
  contact: string;
  nationality: string;
  age: number;
}

export default function PassengerCreate() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - initial values
  const [formData, setFormData] = useState({
    passenger_id: "",
    prenom: "",
    nom: "",
    num_passeport: "",
    contact: "",
    nationality: "",
    age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.passenger_id) return "L'ID passager est requis";
    if (!formData.prenom.trim()) return "Le prénom est requis";
    if (!formData.nom.trim()) return "Le nom est requis";
    if (!formData.num_passeport) return "Le numéro de passeport est requis";
    if (!formData.contact) return "Le contact est requis";
    if (!formData.age) return "L'âge est requis";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact)) {
      return "Veuillez entrer une adresse email valide";
    }
    
    // Age validation
    const age = parseInt(formData.age);
    if (age < 0 || age > 120) {
      return "L'âge doit être compris entre 0 et 120 ans";
    }
    
    // Passport number validation
    const passport = parseInt(formData.num_passeport);
    if (isNaN(passport) || passport <= 0) {
      return "Le numéro de passeport doit être un nombre positif";
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
      const createData: PassengerCreate = {
        passenger_id: parseInt(formData.passenger_id),
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        num_passeport: parseInt(formData.num_passeport),
        contact: formData.contact.trim(),
        nationality: formData.nationality.trim(),
        age: parseInt(formData.age),
      };

      // Send POST request to your FastAPI backend
      const response = await api.post("/passengers/passengers/", createData);
      
      console.log("Passenger created: ", response);

      setSuccess("Passager créé avec succès !");
      
      // Reset form on success
      setTimeout(() => {
        setFormData({
          passenger_id: "",
          prenom: "",
          nom: "",
          num_passeport: "",
          contact: "",
          nationality: "",
          age: "",
        });
      }, 1500);

      // Redirect to passengers list after success
      setTimeout(() => {
        navigate("/passagers");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting passenger:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle database errors from FastAPI
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

  const handleReset = () => {
    setFormData({
      passenger_id: "",
      prenom: "",
      nom: "",
      num_passeport: "",
      contact: "",
      nationality: "",
      age: "",
    });
  };

  const handleCancel = () => {
    navigate("/passagers");
  };

  return (
    <PageContainer
      title="Nouveau passager"
      breadcrumbs={[
        { title: "Passagers" },
        { title: "Nouveau" },
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
          Ajouter un nouveau passager
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
            {/* Passenger ID Field - Required */}
            <TextField
              fullWidth
              required
              label="ID Passager"
              name="passenger_id"
              value={formData.passenger_id}
              onChange={handleChange}
              placeholder="Ex: 1001"
              disabled={submitting}
              helperText="Numéro unique identifiant le passager"
              error={!!error && error.includes("ID")}
            />

            {/* First Name and Last Name in row */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Ex: Jean"
                disabled={submitting}
                helperText="Prénom du passager"
                error={!!error && error.includes("prénom")}
              />
              <TextField
                fullWidth
                required
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Dupont"
                disabled={submitting}
                helperText="Nom du passager"
                error={!!error && error.includes("nom")}
              />
            </Stack>

            {/* Passport Number and Age in row */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                required
                label="Numéro de passeport"
                name="num_passeport"
                value={formData.num_passeport}
                onChange={handleChange}
                placeholder="Ex: 123456789"
                disabled={submitting}
                helperText="Numéro unique du passeport"
                error={!!error && error.includes("passeport")}
              />
              <TextField
                fullWidth
                required
                label="Âge"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                disabled={submitting}
                helperText="Âge du passager"
                InputProps={{
                  inputProps: { 
                    min: 0, 
                    max: 120
                  }
                }}
                error={!!error && error.includes("âge")}
              />
            </Stack>

            {/* Contact (Email) Field - Required */}
            <TextField
              fullWidth
              required
              label="Email"
              name="contact"
              type="email"
              value={formData.contact}
              onChange={handleChange}
              placeholder="exemple@email.com"
              disabled={submitting}
              helperText="Adresse email du passager"
              error={!!error && error.includes("contact")}
            />

            {/* Nationality Field - Optional */}
            <TextField
              fullWidth
              label="Nationalité"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="Ex: Français"
              disabled={submitting}
              helperText="Nationalité du passager"
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleReset}
                disabled={submitting}
              >
                Réinitialiser
              </Button>
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
                sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
              >
                {submitting ? "En cours..." : "Créer le passager"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </PageContainer>
  );
}