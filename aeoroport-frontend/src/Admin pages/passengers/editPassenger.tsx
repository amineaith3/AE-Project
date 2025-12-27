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
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PublicIcon from "@mui/icons-material/Public";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface for update (PUT) - matches your PassengerUpdate model
interface PassengerUpdate {
  prenom?: string;
  nom?: string;
  contact?: string;
  nationality?: string;
  age?: number;
}

// Common nationalities for dropdown
const NATIONALITIES = [
  "Française",
  "Belge",
  "Suisse",
  "Canadienne",
  "Espagnole",
  "Italienne",
  "Allemande",
  "Britannique",
  "Américaine",
  "Marocaine",
  "Tunisienne",
  "Algérienne",
  "Chinoise",
  "Japonaise",
  "Autre"
] as const;

type Nationality = typeof NATIONALITIES[number];

export default function PassengerEditForm() {
  const navigate = useNavigate();
  const { num_passeport } = useParams<{ num_passeport: string }>();
  const passeportNum = parseInt(num_passeport || "0");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - for editing only
  const [formData, setFormData] = useState({
    passenger_id: null,
    prenom: "",
    nom: "",
    contact: "",
    nationality: "Française" as Nationality,
    age: "",
  });

  // Fetch existing passenger data for editing
  useEffect(() => {
    if (passeportNum) {
      fetchPassengerData(passeportNum);
    }
  }, [passeportNum]);

  const fetchPassengerData = async (passeportNum: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/passengers/passengers/passport/${passeportNum}`);
      const data = response.data;
      
      setFormData({
        passenger_id:data.passenger_id || null,
        prenom: data.prenom || "",
        nom: data.nom || "",
        contact: data.contact || "",
        nationality: data.nationality || "Française",
        age: data.age?.toString() || "",
      });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Passager non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les données du passager");
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

    // Validation
    if (!formData.prenom.trim()) {
      setError("Le prénom est requis");
      return;
    }

    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!formData.contact.trim()) {
      setError("L'adresse email est requise");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (!formData.nationality) {
      setError("La nationalité est requise");
      return;
    }

    if (!formData.age) {
      setError("L'âge est requis");
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      setError("Veuillez entrer un âge valide (0-150)");
      return;
    }

    if (age < 18 && !window.confirm("Le passager est mineur. Confirmer l'enregistrement ?")) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for PUT request (update)
      const updateData: PassengerUpdate = {
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        contact: formData.contact.trim(),
        nationality: formData.nationality,
        age: parseInt(formData.age),
      };
      
      // Remove undefined fields (optional fields that weren't changed)
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof PassengerUpdate] === undefined) {
          delete updateData[key as keyof PassengerUpdate];
        }
      });

      // Send PUT request to update passenger
      const response = await api.put(`/passengers/passengers/${formData.passenger_id}`, updateData);
      console.log("Passenger updated:", response);
      
      setSuccess("Passager modifié avec succès !");

      // Redirect to details page after success
      setTimeout(() => {
        navigate(`/passagers/${passeportNum}`);
      }, 1500);

    } catch (err: any) {
      console.error("Error updating passenger:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data?.detail) {
            setError(`Erreur: ${err.response.data.detail}`);
          } else if (err.response.status === 404) {
            setError("Passager non trouvé");
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
    navigate(`/passengers/${passeportNum}`);
  };

  if (loading) {
    return (
      <PageContainer
        title="Modifier le passager"
        breadcrumbs={[
          { title: "Passagers" },
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

  // Helper function for age category
  const getAgeCategory = (age: string): string => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "";
    if (ageNum < 18) return "Enfant";
    if (ageNum >= 18 && ageNum <= 65) return "Adulte";
    return "Sénior";
  };

  const ageCategory = getAgeCategory(formData.age);

  return (
    <PageContainer
      title="Modifier le passager"
      breadcrumbs={[
        { title: "Passagers" },
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
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Modifier le passager #{formData.passenger_id}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Read-only ID field */}
            <TextField
              fullWidth
              label="ID Passager"
              value={formData.passenger_id}
              disabled
              helperText="ID du passager (ne peut pas être modifié)"
              InputProps={{
                readOnly: true,
              }}
            />

            {/* First Name Field - Required */}
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
              sx={{ maxWidth: '300px' }}
            />

            {/* Last Name Field - Required */}
            <TextField
              fullWidth
              required
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Dupont"
              disabled={submitting}
              helperText="Nom de famille du passager"
              sx={{ maxWidth: '300px' }}
            />

            {/* Email Field - Required */}
            <TextField
              fullWidth
              required
              label="Adresse email"
              name="contact"
              type="email"
              value={formData.contact}
              onChange={handleChange}
              placeholder="exemple@email.com"
              disabled={submitting}
              helperText="Adresse email de contact"
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                ),
              }}
              sx={{ maxWidth: '350px' }}
            />

            {/* Nationality Field - Required */}
            <TextField
              fullWidth
              select
              required
              label="Nationalité"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              disabled={submitting}
              helperText="Nationalité du passager"
              sx={{ maxWidth: '300px' }}
              InputProps={{
                startAdornment: (
                  <PublicIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                ),
              }}
            >
              {NATIONALITIES.map((nationality) => (
                <MenuItem key={nationality} value={nationality}>
                  {nationality}
                </MenuItem>
              ))}
            </TextField>

            {/* Age Field - Required */}
            <Box>
              <TextField
                fullWidth
                required
                label="Âge"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Ex: 30"
                disabled={submitting}
                helperText={`Âge du passager ${ageCategory ? `(${ageCategory})` : ''}`}
                InputProps={{
                  inputProps: { 
                    min: 0, 
                    max: 150,
                    step: 1
                  },
                }}
                sx={{ maxWidth: '200px', mb: 1 }}
              />
              {ageCategory && (
                <Box sx={{ 
                  display: 'inline-block',
                  ml: 2,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 
                    ageCategory === 'Enfant' ? 'info.light' :
                    ageCategory === 'Adulte' ? 'success.light' : 'warning.light',
                  color: 
                    ageCategory === 'Enfant' ? 'info.dark' :
                    ageCategory === 'Adulte' ? 'success.dark' : 'warning.dark',
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}>
                  {ageCategory}
                </Box>
              )}
            </Box>

            {/* Age Information Box */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              mt: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Catégories d'âge :
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                  <Typography variant="body2">Enfant (0-17 ans)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="body2">Adulte (18-65 ans)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                  <Typography variant="body2">Sénior (66+ ans)</Typography>
                </Box>
              </Box>
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