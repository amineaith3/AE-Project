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
  Avatar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import ChairIcon from "@mui/icons-material/Chair";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import FlagIcon from "@mui/icons-material/Flag";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ClassIcon from "@mui/icons-material/Class";
import GroupIcon from "@mui/icons-material/Group";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

interface Passenger {
  passenger_id: number;
  prenom: string;
  nom: string;
  num_passeport: number;
  contact: string;
  nationality: string;
  age: number;
}

interface Reservation {
  reservation_id: number;
  vol_num: number;
  seatcode: string;
  state: string;
  guardian_id?: number;
}

interface ExtendedReservation extends Reservation {
  passenger?: Passenger;
  guardian?: Passenger;
}

export default function ReservationDetails() {
  const navigate = useNavigate();
  const { passport_num } = useParams<{ passport_num: string }>();
  const passportNum = parseInt(passport_num || "0");
  console.log("🚀 Component MOUNTED");
  console.log("📌 Passport from URL:", passport_num);
  console.log("📌 Passport number (parsed):", passportNum);
  const [reservation, setReservation] = useState<ExtendedReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passenger, setPassenger] = useState<Passenger | null>(null);

  // Fetch reservation and passenger details
  useEffect(() => {
    if (passportNum) {
      fetchReservationAndPassengerDetails(passportNum);
    }
  }, [passportNum]);

  const fetchReservationAndPassengerDetails = async (passNum: number) => {
  setLoading(true);
  setError(null);
  console.log("🟡 Starting fetch for passport:", passNum);
  
  try {
    // Step 1: Get passenger by passport number
    console.log("🔵 Step 1: Fetching passenger...");
    const passengerResponse = await api.get(`/passengers/passengers/passport/${passNum}`);
    console.log("✅ Passenger API Response:", passengerResponse);
    console.log("📊 Passenger Data:", passengerResponse.data);
    
    if (!passengerResponse.data) {
      console.error("❌ No passenger data received");
      setError("Aucun passager trouvé avec ce numéro de passeport");
      setLoading(false);
      return;
    }
    
    const passengerData = passengerResponse.data;
    console.log("👤 Passenger found:", passengerData.prenom, passengerData.nom);
    setPassenger(passengerData);
    
    // Step 2: Get all reservations
    console.log("🔵 Step 2: Fetching all reservations...");
    const reservationsResponse = await api.get("/reservations/reservations");
    console.log("✅ Reservations API Response:", reservationsResponse);
    console.log("📊 Reservations Data:", reservationsResponse.data);
    
    const allReservations = Array.isArray(reservationsResponse.data) 
      ? reservationsResponse.data 
      : [reservationsResponse.data];
    
    console.log("📋 Total reservations found:", allReservations.length);
    
    // Step 3: Find reservation for this passenger
    console.log("🔵 Step 3: Looking for reservation for passenger_id:", passengerData.passenger_id);
    const reservationData = allReservations.find((res: any) => {
      console.log("Checking reservation:", res.reservation_id, "passenger_id:", res.passenger_id);
      return res.passenger_id === passengerData.passenger_id;
    });
    
    if (!reservationData) {
      console.warn("⚠️ No reservation found for this passenger");
      setError("Aucune réservation trouvée pour ce passager");
      setLoading(false);
      return;
    }
    
    console.log("✅ Reservation found:", reservationData);
    
    // Step 4: Get guardian if exists
    let guardian = undefined;
    if (reservationData.guardian_id) {
      try {
        console.log("🔵 Step 4: Fetching guardian:", reservationData.guardian_id);
        const guardianResponse = await api.get(`/passengers/passengers/${reservationData.guardian_id}`);
        guardian = guardianResponse.data;
        console.log("✅ Guardian found:", guardian);
      } catch (err) {
        console.error("❌ Error fetching guardian:", err);
      }
    }

    setReservation({
      ...reservationData,
      passenger: passengerData,
      guardian
    });
    
    console.log("🎉 All data loaded successfully!");
    
  } catch (err: any) {
    console.error("❌ ERROR in fetchReservationAndPassengerDetails:", err);
    console.error("Error details:", err.response?.data || err.message);
    
    if (err.response?.status === 404) {
      setError("Aucune donnée trouvée pour ce numéro de passeport");
    } else if (err.response?.status === 500) {
      setError("Erreur serveur. Veuillez réessayer plus tard.");
    } else if (err.message === "Network Error") {
      setError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
    } else {
      setError("Une erreur est survenue lors du chargement des données");
    }
  } finally {
    console.log("🏁 Loading finished");
    setLoading(false);
  }
};

  // Alternative approach if you need to fetch reservations differently
  const fetchAllData = async (passNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get passenger
      const passengerResponse = await api.get(`/passengers/passport/${passNum}`);
      const passengerData = passengerResponse.data;
      
      if (!passengerData) {
        setError("Passager non trouvé");
        setLoading(false);
        return;
      }
      
      setPassenger(passengerData);
      
      // Try to get reservation directly if you have an endpoint
      try {
        const reservationResponse = await api.get(`/reservations/reservations/passport/${passNum}`);
        const reservationData = reservationResponse.data;
        
        let guardian = undefined;
        if (reservationData.guardian_id) {
          try {
            const guardianResponse = await api.get(`/passengers/passengers/${reservationData.guardian_id}`);
            guardian = guardianResponse.data;
          } catch (err) {
            console.error("Error fetching guardian:", err);
          }
        }
        
        setReservation({
          ...reservationData,
          passenger: passengerData,
          guardian
        });
      } catch (resErr: any) {
        // If reservation endpoint fails, try to get from all reservations
        console.log("Falling back to all reservations...");
        
        const allReservationsResponse = await api.get("/reservations/reservations");
        const allReservations = allReservationsResponse.data;
        
        // Find reservation by passenger_id - this depends on your data structure
        const reservationData = allReservations.find(
          (res: any) => res.passenger_passport_num === passengerData.passenger_id
        );
        
        if (reservationData) {
          let guardian = undefined;
          if (reservationData.guardian_id) {
            try {
              const guardianResponse = await api.get(`/passengers/passengers/${reservationData.guardian_id}`);
              guardian = guardianResponse.data;
            } catch (err) {
              console.error("Error fetching guardian:", err);
            }
          }
          
          setReservation({
            ...reservationData,
            passenger: passengerData,
            guardian
          });
        } else {
          setError("Aucune réservation trouvée pour ce passager");
        }
      }
      
    } catch (err: any) {
      console.error("Error:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    if (reservation?.reservation_id) {
      navigate(`/reservations/${reservation.reservation_id}/edit`);
    }
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!reservation) return;

    setDeleting(true);
    try {
      await api.delete(`/reservations/reservations/${reservation.reservation_id}`);
      setDeleteDialogOpen(false);
      navigate("/reservations");
    } catch (err: any) {
      setError("Erreur lors de la suppression de la réservation");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Get state config
  const getStateConfig = (state: string) => {
    const upperState = state?.toUpperCase();
    switch(upperState) {
      case "CONFIRMED":
        return { 
          color: "success" as const, 
          icon: <CheckCircleIcon />, 
          label: "Confirmée",
          bgColor: "#e8f5e9",
          borderColor: "#c8e6c9"
        };
      case "PENDING":
        return { 
          color: "warning" as const, 
          icon: <PendingIcon />, 
          label: "En attente",
          bgColor: "#fff3e0",
          borderColor: "#ffe0b2"
        };
      case "CANCELLED":
        return { 
          color: "error" as const, 
          icon: <CancelIcon />, 
          label: "Annulée",
          bgColor: "#ffebee",
          borderColor: "#ffcdd2"
        };
      default:
        return { 
          color: "default" as const, 
          icon: <PendingIcon />, 
          label: state || "Inconnu",
          bgColor: "#f5f5f5",
          borderColor: "#e0e0e0"
        };
    }
  };

  // Get seat class color
  const getSeatClassColor = (seatcode: string) => {
    const firstChar = seatcode.charAt(0).toUpperCase();
    switch(firstChar) {
      case 'A':
      case 'B':
      case 'C':
        return { bg: "#e3f2fd", color: "#1565c0", label: "Business/First" };
      case 'D':
      case 'E':
      case 'F':
        return { bg: "#f3e5f5", color: "#7b1fa2", label: "Premium Economy" };
      default:
        return { bg: "#f5f5f5", color: "#424242", label: "Economy" };
    }
  };

  const handleBack = () => {
    navigate("/reservations");
  };

  const refreshDetails = () => {
    if (passportNum) {
      fetchReservationAndPassengerDetails(passportNum);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (reservation && passenger) {
      const shareText = `
RÉSERVATION #${reservation.reservation_id}
===============================
PASSAGER: ${passenger.prenom} ${passenger.nom}
PASSEPORT: ${passenger.num_passeport}
VOL: #${reservation.vol_num}
SIÈGE: ${reservation.seatcode}
STATUT: ${getStateConfig(reservation.state).label}
      `.trim();
      
      if (navigator.share) {
        navigator.share({
          title: `Réservation ${reservation.reservation_id}`,
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert("Informations copiées dans le presse-papier");
      }
    }
  };

  if (loading) {
    return (
      <PageContainer
        title="Détails de la réservation"
        breadcrumbs={[
          { title: "Réservations" },
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
        title="Détails de la réservation"
        breadcrumbs={[
          { title: "Réservations" },
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

  if (!reservation || !passenger) {
    return (
      <PageContainer
        title="Détails de la réservation"
        breadcrumbs={[
          { title: "Réservations" },
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
        <Alert severity="warning">Aucune donnée trouvée pour ce numéro de passeport</Alert>
      </PageContainer>
    );
  }

  const stateConfig = getStateConfig(reservation.state);
  const seatClassConfig = getSeatClassColor(reservation.seatcode);

  return (
    <PageContainer
      title={`Réservation #${reservation.reservation_id}`}
      breadcrumbs={[
        { title: "Réservations" },
        { title: `#${reservation.reservation_id}` },
      ]}
      actions={
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
          <IconButton onClick={handlePrint} title="Imprimer">
            <PrintIcon />
          </IconButton>
          <IconButton onClick={handleShare} title="Partager">
            <ShareIcon />
          </IconButton>
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
        </Stack>
      }
    >
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Détails de la réservation
        </Typography>

        <Card variant="outlined" sx={{ 
          mt: 2, 
          bgcolor: stateConfig.bgColor,
          borderColor: stateConfig.borderColor 
        }}>
          <CardContent>
            <Stack spacing={3}>
              {/* Header Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID Réservation
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    #{reservation.reservation_id}
                  </Typography>
                </Box>
                <Chip 
                  icon={stateConfig.icon}
                  label={stateConfig.label}
                  color={stateConfig.color}
                  variant="filled"
                  sx={{ fontSize: '1rem', px: 2, py: 1 }}
                />
              </Box>

              <Divider />

              {/* Flight and Seat Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3 
              }}>
                {/* Flight Information */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <FlightIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                    Informations du vol
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      bgcolor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      height: '100%'
                    }}
                  >
                    <Typography variant="h5" sx={{ color: '#1976d2', mb: 1 }}>
                      Vol #{reservation.vol_num}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <ScheduleIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Horaires non spécifiés
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* Seat Information */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <ChairIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                    Siège assigné
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3,
                      bgcolor: seatClassConfig.bg,
                      borderRadius: 2,
                      border: `3px solid ${seatClassConfig.color}`,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h1" sx={{ 
                      color: seatClassConfig.color, 
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      fontSize: { xs: '3rem', sm: '4rem' }
                    }}>
                      {reservation.seatcode}
                    </Typography>
                    <Chip 
                      label={seatClassConfig.label}
                      size="small"
                      sx={{ 
                        mt: 2,
                        bgcolor: seatClassConfig.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Paper>
                </Box>
              </Box>

              <Divider />

              {/* Passenger Section */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <PersonIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Informations du passager
                </Typography>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 3
                  }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: passenger.age < 18 ? "#2196f3" : "#1976d2"
                    }}>
                      {passenger.age < 18 ? 
                        <ChildCareIcon fontSize="large" /> : 
                        <PersonIcon fontSize="large" />
                      }
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ color: '#1976d2', mb: 1 }}>
                        {passenger.prenom} {passenger.nom}
                      </Typography>
                      
                      {/* Passenger Info Chips */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        mb: 2,
                        alignItems: 'center'
                      }}>
                        <Chip 
                          label={`${passenger.age} ans`}
                          size="medium"
                          color={passenger.age < 18 ? "info" : "success"}
                          variant="outlined"
                        />
                        <Chip 
                          icon={<BadgeIcon />}
                          label={`${passenger.num_passeport}`}
                          size="medium"
                          variant="outlined"
                        />
                        <Chip 
                          icon={<FlagIcon />}
                          label={passenger.nationality}
                          size="medium"
                          variant="outlined"
                        />
                      </Box>
                      
                      {/* Contact Info */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        flexWrap: 'wrap'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="action" />
                          <Typography variant="body1">
                            {passenger.contact}
                          </Typography>
                        </Box>
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={() => window.location.href = `mailto:${passenger.contact}`}
                        >
                          Envoyer email
                        </Button>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate(`/passagers/${passenger.passenger_id}`)}
                      sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                    >
                      Voir profil
                    </Button>
                  </Box>
                </Paper>
              </Box>

              {/* Guardian Section */}
              {reservation.guardian_id && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      <GroupIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                      Tuteur / Accompagnateur
                    </Typography>
                    {reservation.guardian ? (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 3
                        }}>
                          <Avatar sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: "#ed6c02",
                            border: '2px solid #ff9800'
                          }}>
                            <PersonIcon fontSize="large" />
                          </Avatar>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="medium">
                              {reservation.guardian.prenom} {reservation.guardian.nom}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="text.secondary">
                                Âge: {reservation.guardian.age} ans
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Nationalité: {reservation.guardian.nationality}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Chip 
                            label="Tuteur"
                            color="warning"
                            icon={<PersonIcon />}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                      </Paper>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        bgcolor: '#fff3e0',
                        borderRadius: 1,
                        border: '1px dashed #ffb74d'
                      }}>
                        <PersonIcon color="warning" />
                        <Typography variant="body2" color="text.secondary">
                          Tuteur ID: {reservation.guardian_id} - Détails non disponibles
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Additional Information Cards */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Informations supplémentaires
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mt: 2
          }}>
            {/* Reservation Date Card */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#fafafa'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Date de réservation
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Non spécifiée dans le système
              </Typography>
              <Typography variant="caption" color="text.disabled">
                À configurer dans l'API
              </Typography>
            </Paper>
            
            {/* Seat Class Card */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#fafafa'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ClassIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Classe de siège
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ color: seatClassConfig.color }}>
                {seatClassConfig.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lettre de siège: {reservation.seatcode.charAt(0)}
              </Typography>
            </Paper>

            {/* Passenger Type Card */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                flex: 1,
                display: '-flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: '#fafafa'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GroupIcon color="info" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Type de passager
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {passenger.age < 18 ? 
                  "Mineur accompagné" : "Adulte indépendant"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reservation.guardian_id ? 
                  "Voyage avec un tuteur" : 
                  "Voyage sans accompagnateur"}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center', 
          gap: 2, 
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<FlightIcon />}
            onClick={() => navigate(`/vols/${reservation.vol_num}`)}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Détails du vol
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={() => {
              const info = `
RÉSERVATION #${reservation.reservation_id}
===============================
VOL: #${reservation.vol_num}
SIÈGE: ${reservation.seatcode}
STATUT: ${stateConfig.label}

PASSAGER:
${passenger.prenom} ${passenger.nom}
Âge: ${passenger.age} ans
Passeport: ${passenger.num_passeport}
Nationalité: ${passenger.nationality}
Contact: ${passenger.contact}
                `.trim();
                
              navigator.clipboard.writeText(info);
              alert("Informations copiées dans le presse-papier");
            }}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Copier les informations
          </Button>
          
          <Button 
            variant="contained" 
            color={stateConfig.color === "success" ? "warning" : "success"}
            startIcon={stateConfig.color === "success" ? <PendingIcon /> : <CheckCircleIcon />}
            onClick={() => {
              console.log("Change reservation status");
            }}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            {stateConfig.color === "success" ? 
              "Mettre en attente" : "Confirmer la réservation"}
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirmer la suppression de la réservation
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Êtes-vous sûr de vouloir supprimer définitivement la réservation <strong>#{reservation.reservation_id}</strong> ?
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle2" gutterBottom color="error">
              Cette action affectera:
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Passager: {passenger.prenom} {passenger.nom}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Vol: #{reservation.vol_num}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChairIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Siège: {reservation.seatcode}
                </Typography>
              </Box>
            </Stack>
          </Paper>
          
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Attention: Cette action est irréversible. Le siège #{reservation.seatcode} sera libéré.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            variant="outlined"
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
            {deleting ? "Suppression en cours..." : "Supprimer définitivement"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}