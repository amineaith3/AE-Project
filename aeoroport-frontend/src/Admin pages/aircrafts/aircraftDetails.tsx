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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

interface Aircraft {
  avion_id: number;
  modele: string;
  max_capacity: number;
  state: string;
}

export default function AircraftDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const aircraftId = parseInt(id || "0");

  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch aircraft details
  useEffect(() => {

    if (aircraftId) {
      fetchAircraftDetails(aircraftId);
    }
  }, [aircraftId]);

  const fetchAircraftDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/aircrafts/aircrafts/${id}`);
      setAircraft(response.data);

    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Avion non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les détails de l'avion");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/avions/${aircraftId}/edit`);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!aircraft) return;

    setDeleting(true);
    try {
      const response=await api.delete(`/aircrafts/aircrafts/${aircraftId}`);
      console.log("delete aircraft: ",response)

      setDeleteDialogOpen(false);
      navigate("/avions"); // Navigate back to list after deletion
    } catch (err: any) {
      setError("Erreur lors de la suppression de l'avion");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Get chip color based on state
  const getChipColor = (state: string): "success" | "warning" | "info" | "error" | "default" => {
    switch(state) {
      case "Ready": return "success";
      case "Maintenance": return "warning";
      case "Flying": return "info";
      case "Out of Service": return "error";
      case "Turnaround": return "info";
      default: return "default";
    }
  };

  // Get French label for state
  const getStateLabel = (state: string): string => {
    const stateLabels: Record<string, string> = {
      "Ready": "Prêt",
      "Flying": "En vol",
      "Turnaround": "Turnaround",
      "Maintenance": "En maintenance",
      "Out of Service": "Hors service"
    };
    return stateLabels[state] || state;
  };

  const handleBack = () => {
    navigate("/avions");
  };

  if (loading) {
    return (
      <PageContainer
        title="Détails de l'avion"
        breadcrumbs={[
          { title: "Avions" },
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
        title="Détails de l'avion"
        breadcrumbs={[
          { title: "Avions" },
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
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!aircraft) {
    return (
      <PageContainer
        title="Détails de l'avion"
        breadcrumbs={[
          { title: "Avions" },
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
        <Alert severity="warning">Aucun avion trouvé avec cet ID</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Avion ${aircraft.avion_id}`}
      breadcrumbs={[
        { title: "Avions" },
        { title: `Avion ${aircraft.avion_id}` },
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
          Informations détaillées de l'avion
        </Typography>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* ID Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ID Avion
                </Typography>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  {aircraft.avion_id}
                </Typography>
              </Box>

              {/* Model Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Modèle
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                  {aircraft.modele}
                </Typography>
              </Box>

              {/* Capacity Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Capacité maximale
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                    {aircraft.max_capacity} passagers
                  </Typography>
                  <Chip 
                    label={`${aircraft.max_capacity} places`} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              </Box>

              {/* Status Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Statut
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={getStateLabel(aircraft.state)} 
                    color={getChipColor(aircraft.state)}
                    size="medium"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {aircraft.state}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Informations supplémentaires
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              flex: '1 1 200px'
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Date d'ajout
              </Typography>
              <Typography variant="body2">
                Non spécifiée
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              flex: '1 1 200px'
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Dernière maintenance
              </Typography>
              <Typography variant="body2">
                Non spécifiée
              </Typography>
            </Box>
          </Box>
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
            Êtes-vous sûr de vouloir supprimer l'avion <strong>{aircraft.modele}</strong> (ID: {aircraft.avion_id}) ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible. Toutes les données associées à cet avion seront perdues.
          </Typography>
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
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}