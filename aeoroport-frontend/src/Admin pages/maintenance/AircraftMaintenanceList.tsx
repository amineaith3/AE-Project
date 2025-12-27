// src/pages/maintenance/AircraftMaintenanceList.tsx
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
import { useNavigate } from "react-router";

interface Aircraft {
  Avion_id: number;
  Modele: string;
  MaxCapacity: number;
  State: string;
}

export default function AircraftMaintenanceList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Récupérer les avions
  const fetchAircrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/aircrafts');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data: Aircraft[] = await response.json();
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Données de démonstration
      setRows([
        { Avion_id: 1, Modele: "Airbus A320", MaxCapacity: 180, State: "Maintenance" },
        { Avion_id: 2, Modele: "Boeing 737", MaxCapacity: 200, State: "Disponible" },
        { Avion_id: 3, Modele: "Airbus A321", MaxCapacity: 220, State: "Disponible" },
        { Avion_id: 4, Modele: "Boeing 787", MaxCapacity: 300, State: "En vol" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAircrafts();
  }, [fetchAircrafts]);

  // Mettre à jour l'état d'un avion
  const handleUpdateState = useCallback(async (avionId: number, newState: string) => {
    try {
      const response = await fetch(`/api/aircrafts/${avionId}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ State: newState }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      // Recharger la liste
      fetchAircrafts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }, [fetchAircrafts]);

  // Filtrer les avions
  const filteredRows = React.useMemo(() => {
    if (stateFilter === "all") return rows;
    return rows.filter(aircraft => aircraft.State === stateFilter);
  }, [rows, stateFilter]);

  const columns: GridColDef<Aircraft>[] = [
    { field: "Avion_id", headerName: "ID", width: 70 },
    { field: "Modele", headerName: "Modèle", width: 150 },
    { field: "MaxCapacity", headerName: "Capacité", width: 100 },
    { 
      field: "State", 
      headerName: "État", 
      width: 130,
      renderCell: (params) => {
        const getColor = (state: string): "success" | "warning" | "info" | "error" | "default" => {
          switch(state) {
            case "Disponible": return "success";
            case "Maintenance": return "warning";
            case "En vol": return "info";
            case "Indisponible": return "error";
            default: return "default";
          }
        };
        
        return (
          <Chip 
            label={params.value} 
            color={getColor(params.value as string)} 
            size="small" 
          />
        );
      }
    },
    {
  field: "actions",
  type: "actions",
  width: 250,
  getActions: (params: GridRowParams<Aircraft>) => [
    <GridActionsCellItem
      key="schedule"
      icon={<BuildIcon />}
      label="Planifier maintenance"
      onClick={() => navigate(`/maintenance/nouveau?avion=${params.row.Avion_id}`)}
      showInMenu={false}
    />,
    ...(params.row.State === "Disponible" ? [
      <GridActionsCellItem
        key="to-maintenance"
        icon={<WarningIcon style={{ color: '#ed6c02' }} />}  // No sx prop!
        label="Mettre en maintenance"
        onClick={() => handleUpdateState(params.row.Avion_id, "Maintenance")}
        showInMenu={false}
      />
    ] : []),
    ...(params.row.State === "Maintenance" ? [
      <GridActionsCellItem
        key="to-available"
        icon={<CheckCircleIcon style={{ color: '#2e7d32' }} />}  // No sx prop!
        label="Rendre disponible"
        onClick={() => handleUpdateState(params.row.Avion_id, "Disponible")}
        showInMenu={false}
      />
    ] : []),
  ],
}

  ];

  const stateOptions = [
    { value: "all", label: "Tous les états" },
    { value: "Disponible", label: "Disponible" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "En vol", label: "En vol" },
  ];

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DES AVIONS - MAINTENANCE"
          subTitle="Consultez et modifiez l'état des avions pour la maintenance"
        />
      </Box>

      <PageContainer
        title="Avions (Maintenance)"
        breadcrumbs={[
          { title: "Maintenance", path: "/maintenance" },
          { title: "Flotte" },
        ]}
        actions={
          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              select
              size="small"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {stateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Tooltip title="Recharger">
              <IconButton size="small" onClick={fetchAircrafts}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={() => navigate("/maintenance/nouveau")}
              sx={{ bgcolor: "#00796b" }}
            >
              Nouvelle Maintenance
            </Button>
          </Stack>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.Avion_id}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: { showQuickFilter: true },
          }}
        />
      </PageContainer>
    </>
  );
}