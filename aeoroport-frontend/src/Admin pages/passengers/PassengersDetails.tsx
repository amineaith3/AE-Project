// src/pages/enregistrement/PassengerDetails.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import FlagIcon from "@mui/icons-material/Flag";
import PassportIcon from "@mui/icons-material/CardTravel";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

interface Passenger {
  passenger_id: number;
  prenom: string;
  nom: string;
  contact: string;
  nationality: string;
  age: number;
}

export default function PassengerDetails() {
  const navigate = useNavigate();
  const { num_passeport } = useParams<{ num_passeport: string }>();
  const passportNum = parseInt(num_passeport || "0");

  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch passenger details
  useEffect(() => {
    if (passportNum) {
      fetchPassengerDetails(passportNum);
    }
  }, [passportNum]);

  const fetchPassengerDetails = async (passportNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      // Note: Your endpoint uses /passport/{num_passeport} not /passengers/{passport}
      const response = await api.get(`/passengers/passengers/passport/${passportNumber}`);
      setPassenger(response.data);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Passager non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les détails du passager");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    // Navigate to edit page - you'll need to create this route
    // Or edit by passport number if that's your identifier
    navigate(`/passagers/${passportNum}/edit`);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!passenger) return;

    setDeleting(true);
    try {
      // Assuming you have a DELETE endpoint by passenger_id
      // If your delete endpoint uses passport number, adjust accordingly
     const response= await api.delete(`/passengers/passengers/${passenger.passenger_id}`);
      console.log("passenger delete: ", response)
      
      setDeleteDialogOpen(false);
      navigate("/passagers"); // Navigate back to list after deletion
    } catch (err: any) {
      setError("Erreur lors de la suppression du passager");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Get age group color
  const getAgeGroupColor = (age: number): "success" | "warning" | "info" | "error" | "default" => {
    if (age < 18) return "info";
    if (age >= 18 && age <= 60) return "success";
    if (age > 60) return "warning";
    return "default";
  };

  // Get age group label
  const getAgeGroupLabel = (age: number): string => {
    if (age < 18) return "Mineur";
    if (age >= 18 && age <= 60) return "Adulte";
    if (age > 60) return "Senior";
    return "N/A";
  };

  const handleBack = () => {
    navigate("/passagers");
  };

  const refreshDetails = () => {
    if (passportNum) {
      fetchPassengerDetails(passportNum);
    }
  };

  if (loading) {
    return (
      <PageContainer
        title="Détails du passager"
        breadcrumbs={[
          { title: "Passagers" },
          { title: "Détails" },
        ]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        title="Détails du passager"
        breadcrumbs={[
          { title: "Passagers" },
          { title: "Détails" },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
        }
      >
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={refreshDetails}>
            Réessayer
          </Button>
        }>
          {error}
        </Alert>
      </PageContainer>
    );
  }

  if (!passenger) {
    return (
      <PageContainer
        title="Détails du passager"
        breadcrumbs={[
          { title: "Passagers" },
          { title: "Détails" },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
        }
      >
        <Alert severity="warning">Aucun passager trouvé avec ce numéro de passeport</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Passager ${passenger.prenom} ${passenger.nom}`}
      breadcrumbs={[
        { title: "Passagers" },
        { title: `${passenger.prenom} ${passenger.nom}` },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Supprimer
          </Button>
        </Box>
      }
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Informations détaillées du passager
        </Typography>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              {/* Name and ID Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nom complet
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {passenger.prenom} {passenger.nom}
                  </Typography>
                </Box>
                <Chip 
                  icon={<PersonIcon />}
                  label={`ID: ${passenger.passenger_id}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider />

              {/* Passport and Age Section */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Âge et catégorie
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">
                      {passenger.age} ans
                    </Typography>
                    <Chip 
                      label={getAgeGroupLabel(passenger.age)}
                      color={getAgeGroupColor(passenger.age)}
                      size="medium"
                    />
                  </Box>
                </Box>
              </Stack>

              {/* Contact Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Contact
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                    {passenger.contact}
                  </Typography>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => window.location.href = `mailto:${passenger.contact}`}
                  >
                    Envoyer un email
                  </Button>
                </Box>
              </Box>

              {/* Nationality Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <FlagIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Nationalité
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                    {passenger.nationality}
                  </Typography>
                  <Chip 
                    label="Citoyen"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Informations supplémentaires
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Paper variant="outlined" sx={{ 
              p: 2, 
              flex: '1 1 250px',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Date d'enregistrement
              </Typography>
              <Typography variant="body2">
                Non spécifiée dans le système
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ 
              p: 2, 
              flex: '1 1 250px',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dernière réservation
              </Typography>
              <Typography variant="body2">
                Aucune réservation récente
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ 
              p: 2, 
              flex: '1 1 250px',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Vols pris
              </Typography>
              <Typography variant="body2">
                Information non disponible
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => {
              // You can add a "View Flights" functionality here
              console.log("View passenger's flights");
            }}
          >
            Voir les réservations
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => {
              // Copy passenger info to clipboard
              navigator.clipboard.writeText(
                `Passager: ${passenger.prenom} ${passenger.nom}\n` +
                `Contact: ${passenger.contact}\n` +
                `Nationalité: ${passenger.nationality}\n` +
                `Âge: ${passenger.age}`
              ).then(() => alert("Informations copiées"));
            }}
          >
            Copier les informations
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le passager <strong>{passenger.prenom} {passenger.nom}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible. Toutes les données associées à ce passager seront perdues.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Informations du passager:</strong><br />
              • Contact: {passenger.contact}<br />
              • Nationalité: {passenger.nationality}<br />
              • Âge: {passenger.age} ans
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}