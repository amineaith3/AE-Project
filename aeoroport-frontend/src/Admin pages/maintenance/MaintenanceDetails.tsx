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
import BuildIcon from "@mui/icons-material/Build";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import PageContainer from "../../components/pageContainer";
import api from "../../interceptor/api";

// Interface avec états en anglais
interface Maintenance {
  maintenance_id: number;
  avion_id: number;
  operationdate: string;
  typee: string;
  state: "Scheduled" | "In Progress" | "Completed";
}

// Maintenance types
const MAINTENANCE_TYPES = [
  "Inspection",
  "Repair",
  "Cleaning",
  "Overhaul",
  "Check"
] as const;

type MaintenanceType = typeof MAINTENANCE_TYPES[number];

// Maintenance states
type MaintenanceState = Maintenance["state"];

// Map English states to French for display
const stateToFrench: Record<MaintenanceState, string> = {
  "Scheduled": "Planifiée",
  "In Progress": "En cours",
  "Completed": "Terminée"
};

// Map types to French for display
const typeToFrench: Record<string, string> = {
  "Inspection": "Inspection",
  "Repair": "Réparation",
  "Cleaning": "Nettoyage",
  "Overhaul": "Révision",
  "Check": "Contrôle"
};

export default function MaintenanceDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const maintenanceId = parseInt(id || "0");

  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch maintenance details
  useEffect(() => {
    if (maintenanceId) {
      fetchMaintenanceDetails(maintenanceId);
    }
  }, [maintenanceId]);

  const fetchMaintenanceDetails = async (id: number) => {
  setLoading(true);
  setError(null);
  try {
    console.log("🟡 Fetching maintenance:", id);
    const response = await api.get(`/maintenance/maintenance/${id}`);
    
    console.log("✅ Complete API response:", response);
    console.log("✅ Response data:", response.data);
    console.log("✅ operationdate field exists:", 'operationdate' in response.data);
    console.log("✅ operationdate value:", response.data.operationdate);
    console.log("✅ All fields:", Object.keys(response.data));
    
    const data: Maintenance = response.data;
    setMaintenance(data);
    
  } catch (err: any) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};

  // Handle edit button click - navigates to edit page
  const handleEdit = () => {
    navigate(`/maintenance/${maintenanceId}/edit`);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!maintenance) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/maintenance/maintenance/${maintenanceId}`);
      console.log("delete maintenance: ", response);
      setDeleteDialogOpen(false);
      navigate("/maintenance"); // Navigate back to list after deletion
    } catch (err: any) {
      setError("Erreur lors de la suppression de la maintenance");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Get chip color based on state
  const getChipColor = (state: MaintenanceState): "success" | "warning" | "info" | "error" | "default" => {
    switch (state) {
      case "Scheduled":
        return "info";
      case "In Progress":
        return "warning";
      case "Completed":
        return "success";
      default:
        return "default";
    }
  };

  // Get French label for state
  const getStateLabel = (state: MaintenanceState): string => {
    return stateToFrench[state] || state;
  };

  // Get French label for type
  const getTypeLabel = (type: string): string => {
    return typeToFrench[type] || type;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate if maintenance is overdue
  const isOverdue = (operationDate: string, state: MaintenanceState): boolean => {
    try {
      if (state === "Completed") return false; // Completed maintenance can't be overdue
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const opDate = new Date(operationDate);
      opDate.setHours(0, 0, 0, 0);
      return opDate < today;
    } catch (e) {
      return false;
    }
  };

  const handleBack = () => {
    navigate("/maintenance");
  };

  if (loading) {
    return (
      <PageContainer
        title="Détails de la maintenance"
        breadcrumbs={[
          { title: "Maintenances" },
          { title: "Détails" },
        ]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !maintenance) {
    return (
      <PageContainer
        title="Détails de la maintenance"
        breadcrumbs={[
          { title: "Maintenances" },
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

  if (!maintenance) {
    return (
      <PageContainer
        title="Détails de la maintenance"
        breadcrumbs={[
          { title: "Maintenances" },
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
        <Alert severity="warning">
          Aucune maintenance trouvée avec cet ID
        </Alert>
      </PageContainer>
    );
  }

  const overdue = isOverdue(maintenance.operationdate, maintenance.state);
  const isCompleted = maintenance.state === "Completed";

  return (
    <PageContainer
      title={`Maintenance #${maintenance.maintenance_id}`}
      breadcrumbs={[
        { title: "Maintenances" },
        { title: `Maintenance #${maintenance.maintenance_id}` },
      ]}
      actions={
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour à la liste
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={isCompleted} // Disable edit if completed
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overdue Warning */}
      {overdue && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Cette maintenance est en retard ! La date d'opération est passée.
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BuildIcon />
          Détails de la maintenance #{maintenance.maintenance_id}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          ID de la maintenance sélectionnée : {maintenance.maintenance_id}
        </Typography>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* First row: Maintenance ID and Aircraft */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                  alignItems: { xs: "flex-start", md: "center" },
                }}
              >
                {/* Maintenance ID */}
                <Box sx={{ flex: "1 1 30%", minWidth: { xs: "100%", md: "200px" } }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID Maintenance
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentIcon fontSize="small" color="primary" />
                    <Typography variant="h6" sx={{ color: "#1976d2" }}>
                      #{maintenance.maintenance_id}
                    </Typography>
                  </Box>
                </Box>

                {/* Aircraft Info */}
                <Box sx={{ flex: "1 1 70%", minWidth: { xs: "100%", md: "300px" } }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Avion concerné
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AirplanemodeActiveIcon fontSize="small" color="primary" />
                    <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                      ID: {maintenance.avion_id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Second row: Operation Date and Type */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                }}
              >
                {/* Operation Date */}
                <Box
                  sx={{
                    flex: "1 1 50%",
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: overdue ? "warning.main" : "divider",
                    position: "relative",
                  }}
                >
                  {overdue && (
                    <Chip
                      label="En retard"
                      color="warning"
                      size="small"
                      sx={{ position: "absolute", top: -10, right: 10 }}
                    />
                  )}
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date d'opération
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarTodayIcon color="action" />
                    <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                      {formatDate(maintenance.operationdate)}
                    </Typography>
                  </Box>
                </Box>

                {/* Maintenance Type */}
                <Box
                  sx={{
                    flex: "1 1 50%",
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type de maintenance
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BuildIcon color="action" />
                    <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                      {getTypeLabel(maintenance.typee)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status Section */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  État de la maintenance
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    label={getStateLabel(maintenance.state)}
                    color={getChipColor(maintenance.state)}
                    size="medium"
                    sx={{ fontSize: "0.9rem", px: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({maintenance.state})
                  </Typography>
                  {isCompleted && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Terminée"
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Maintenance Timeline Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Progression de la maintenance
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
              position: "relative",
              pl: 3,
              "&::before": {
                content: '""',
                position: "absolute",
                left: "6px",
                top: "10px",
                bottom: "10px",
                width: "2px",
                bgcolor: "#e0e0e0",
              },
            }}
          >
            {[
              {
                state: "Scheduled" as MaintenanceState,
                label: "Planifiée",
                description: "Maintenance programmée et confirmée",
                icon: "📅",
                color: "#0288d1",
              },
              {
                state: "In Progress" as MaintenanceState,
                label: "En cours",
                description: "Maintenance en cours d'exécution",
                icon: "🔧",
                color: "#f57c00",
              },
              {
                state: "Completed" as MaintenanceState,
                label: "Terminée",
                description: "Maintenance achevée avec succès",
                icon: "✅",
                color: "#2e7d32",
              },
            ].map((step) => {
              const isActive = maintenance.state === step.state;
              const isCompletedStep =
                (step.state === "Scheduled" && maintenance.state !== "Scheduled") ||
                (step.state === "In Progress" && maintenance.state === "Completed");

              return (
                <Box
                  key={step.state}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: "-24px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      bgcolor: isActive ? step.color : isCompletedStep ? step.color : "#bdbdbd",
                      transform: isActive ? "scale(1.2)" : "scale(1)",
                      zIndex: 1,
                    }}
                  />
                  <Box
                    sx={{
                      ml: 2,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: isActive ? "primary.50" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "transparent",
                      flex: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography sx={{ fontSize: "1.2rem" }}>{step.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle2">{step.label}</Typography>
                          {isActive && (
                            <Chip
                              label="Actuel"
                              color="primary"
                              size="small"
                              sx={{ height: "20px", fontSize: "0.7rem" }}
                            />
                          )}
                          {isCompletedStep && !isActive && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Terminé"
                              color="success"
                              size="small"
                              sx={{ height: "20px", fontSize: "0.7rem" }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la maintenance{" "}
            <strong>#{maintenance.maintenance_id}</strong> pour l'avion{" "}
            <strong>ID: {maintenance.avion_id}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible. Toutes les données associées à cette maintenance seront
            perdues.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
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