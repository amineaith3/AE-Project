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
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import PeopleIcon from "@mui/icons-material/People";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface correspondant à votre modèle FlightOut
interface Flight {
  vol_num: number;
  destination: string;
  departure_time: string;
  arrival_time: string;
  avion_id: number;
  state: string;
  current_capacity?: number;
}

export default function FlightDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const flightNumber = parseInt(id || "0");

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [newState, setNewState] = useState("");
  const [updatingState, setUpdatingState] = useState(false);

  // États de vol disponibles
  const FLIGHT_STATES = [
    "Scheduled",
    "Boarding",
    "In Flight",
    "Landed",
    "Cancelled",
    "Delayed"
  ] as const;

  // Fetch flight details
  useEffect(() => {
    if (flightNumber) {
      fetchFlightDetails(flightNumber);
    }
  }, [flightNumber]);

  const fetchFlightDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/flights/flights/${id}`);
      setFlight(response.data);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Vol non trouvé");
        } else {
          setError(`Erreur: ${err.response?.data?.detail || err.message}`);
        }
      } else {
        setError("Impossible de charger les détails du vol");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/vols/${flightNumber}/edit`);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!flight) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/flights/flights/${flightNumber}`);
      console.log("delete flight: ", response);
      setDeleteDialogOpen(false);
      navigate("/flights");
    } catch (err: any) {
      setError("Erreur lors de la suppression du vol");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Handle state change button click
  const handleStateChangeClick = () => {
    if (flight) {
      setNewState(flight.state);
      setStateDialogOpen(true);
    }
  };

  // Confirm state change
  const handleStateChangeConfirm = async () => {
    if (!flight) return;

    setUpdatingState(true);
    try {
      await api.patch(`/flights/flights/${flightNumber}/state`, null, {
        params: { new_state: newState }
      });
      
      setFlight({
        ...flight,
        state: newState
      });
      
      setStateDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError("Erreur lors du changement d'état du vol");
      console.error(err);
    } finally {
      setUpdatingState(false);
    }
  };

  // Get chip color based on state
  const getChipColor = (state: string): "success" | "warning" | "info" | "error" | "default" => {
    switch(state.toLowerCase()) {
      case "scheduled": return "info";
      case "boarding": return "warning";
      case "in flight": return "success";
      case "landed": return "success";
      case "cancelled": return "error";
      case "delayed": return "warning";
      default: return "default";
    }
  };

  // Get French label for state
  const getStateLabel = (state: string): string => {
    const stateLabels: Record<string, string> = {
      "Scheduled": "Programmé",
      "Boarding": "Embarquement",
      "In Flight": "En vol",
      "Landed": "Atterri",
      "Cancelled": "Annulé",
      "Delayed": "Retardé"
    };
    return stateLabels[state] || state;
  };

  // Format date-time
  const formatDateTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  // Calculate flight duration
  const calculateDuration = (departure: string, arrival: string): string => {
    try {
      const depDate = new Date(departure);
      const arrDate = new Date(arrival);
      const durationMs = arrDate.getTime() - depDate.getTime();
      
      if (durationMs <= 0) return "N/A";
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (e) {
      return "N/A";
    }
  };

  const handleBack = () => {
    navigate("/flights");
  };

  if (loading) {
    return (
      <PageContainer
        title="Détails du vol"
        breadcrumbs={[
          { title: "Vols" },
          { title: "Détails" },
        ]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !flight) {
    return (
      <PageContainer
        title="Détails du vol"
        breadcrumbs={[
          { title: "Vols" },
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

  if (!flight) {
    return (
      <PageContainer
        title="Détails du vol"
        breadcrumbs={[
          { title: "Vols" },
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
        <Alert severity="warning">Aucun vol trouvé avec ce numéro</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Vol ${flight.vol_num}`}
      breadcrumbs={[
        { title: "Vols" },
        { title: `Vol ${flight.vol_num}` },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            color="secondary"
            startIcon={<FlightTakeoffIcon />}
            onClick={handleStateChangeClick}
          >
            Changer état
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
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Informations détaillées du vol
        </Typography>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            {/* Using flexbox instead of Grid */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3 
            }}>
              {/* First row: Flight Number and Destination */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                alignItems: { xs: 'flex-start', md: 'center' }
              }}>
                {/* Flight Number */}
                <Box sx={{ 
                  flex: '1 1 30%',
                  minWidth: { xs: '100%', md: '200px' }
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Numéro de vol
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AirplaneTicketIcon fontSize="small" color="primary" />
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>
                      {flight.vol_num}
                    </Typography>
                  </Box>
                </Box>

                {/* Destination */}
                <Box sx={{ 
                  flex: '1 1 70%',
                  minWidth: { xs: '100%', md: '300px' }
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Destination
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" color="primary" />
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                      {flight.destination}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Second row: Departure and Arrival */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3
              }}>
                {/* Departure */}
                <Box sx={{ 
                  flex: '1 1 50%',
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Départ
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightTakeoffIcon color="action" />
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                      {formatDateTime(flight.departure_time)}
                    </Typography>
                  </Box>
                </Box>

                {/* Arrival */}
                <Box sx={{ 
                  flex: '1 1 50%',
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Arrivée
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightLandIcon color="action" />
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                      {formatDateTime(flight.arrival_time)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Third row: Duration and Aircraft */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3
              }}>
                {/* Duration */}
                <Box sx={{ 
                  flex: '1 1 50%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Durée du vol
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                      {calculateDuration(flight.departure_time, flight.arrival_time)}
                    </Typography>
                  </Box>
                </Box>

                {/* Aircraft ID */}
                <Box sx={{ 
                  flex: '1 1 50%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <AirplanemodeActiveIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Avion assigné
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                      ID: {flight.avion_id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status Section */}
              <Box sx={{ 
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Statut du vol
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  flexWrap: 'wrap'
                }}>
                  <Chip 
                    label={getStateLabel(flight.state)} 
                    color={getChipColor(flight.state)}
                    size="medium"
                    sx={{ fontSize: '0.9rem', px: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {flight.state}
                  </Typography>
                </Box>
              </Box>

              {/* Capacity Section */}
              {flight.current_capacity !== undefined && (
                <Box sx={{ 
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <PeopleIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Capacité actuelle
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}>
                        {flight.current_capacity} passagers
                      </Typography>
                      <Chip 
                        label={`${flight.current_capacity} places occupées`} 
                        size="small" 
                        variant="outlined"
                        color={flight.current_capacity > 0 ? "primary" : "default"}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Flight Timeline Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Chronologie du vol
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            mt: 2,
            position: 'relative',
            pl: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '6px',
              top: '10px',
              bottom: '10px',
              width: '2px',
              bgcolor: '#e0e0e0'
            }
          }}>
            {[
              { 
                state: "Scheduled", 
                label: "Programmé", 
                description: "Vol planifié et confirmé",
                icon: "📅"
              },
              { 
                state: "Boarding", 
                label: "Embarquement", 
                description: "Passagers en cours d'embarquement",
                icon: "👥"
              },
              { 
                state: "In Flight", 
                label: "En vol", 
                description: "Vol en cours vers la destination",
                icon: "✈️"
              },
              { 
                state: "Landed", 
                label: "Atterri", 
                description: "Vol arrivé à destination",
                icon: "🛬"
              }
            ].map((step, index) => {
              const isActive = flight.state === step.state;
              const isCompleted = 
                (step.state === "Scheduled" && flight.state !== "Scheduled") ||
                (step.state === "Boarding" && ["In Flight", "Landed", "Cancelled"].includes(flight.state)) ||
                (step.state === "In Flight" && ["Landed"].includes(flight.state));
              
              return (
                <Box 
                  key={step.state}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute', 
                    left: '-24px', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    bgcolor: isActive ? '#1976d2' : isCompleted ? '#1976d2' : '#bdbdbd',
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                    zIndex: 1
                  }} />
                  <Box sx={{ 
                    ml: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: isActive ? 'primary.50' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    flex: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '1.2rem' }}>{step.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{step.label}</Typography>
                          {isActive && (
                            <Chip 
                              label="Actuel" 
                              color="primary" 
                              size="small"
                              sx={{ height: '20px', fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* State Change Dialog */}
      <Dialog
        open={stateDialogOpen}
        onClose={() => setStateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Changer l'état du vol
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Sélectionnez le nouvel état pour le vol {flight.vol_num} :
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            {FLIGHT_STATES.map((state) => (
              <Box
                key={state}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: newState === state ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: newState === state ? 'primary.50' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => setNewState(state)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={getStateLabel(state)} 
                    color={getChipColor(state)}
                    size="small"
                  />
                  <Typography sx={{ flex: 1 }}>{state}</Typography>
                  {newState === state && (
                    <Typography color="primary" variant="body2">
                      ✓
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setStateDialogOpen(false)}
            disabled={updatingState}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleStateChangeConfirm} 
            color="primary"
            variant="contained"
            disabled={updatingState || newState === flight.state}
            startIcon={updatingState ? <CircularProgress size={20} /> : <FlightTakeoffIcon />}
          >
            {updatingState ? "Mise à jour..." : "Mettre à jour l'état"}
          </Button>
        </DialogActions>
      </Dialog>

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
            Êtes-vous sûr de vouloir supprimer le vol <strong>{flight.vol_num}</strong> vers {flight.destination} ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible. Toutes les données associées à ce vol seront perdues.
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