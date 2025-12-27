import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import BuildIcon from "@mui/icons-material/Build";
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
import axios from "axios";
import api from "../../interceptor/api";

interface Maintenance {
  maintenance_id: number; // Changé de optionnel à requis
  avion_id: number;
  operationdate: string;
  typee: string;
  state: string;
}

const MAINTENANCE_TYPES = [
  "Inspection",
  "Repair", 
  "Cleaning",
  "Overhaul",
  "Check"
] as const;

type MaintenanceType = typeof MAINTENANCE_TYPES[number];

// Map English types to French for display
const typeToFrench: Record<string, string> = {
  "Inspection": "Inspection",
  "Repair": "Réparation",
  "Cleaning": "Nettoyage",
  "Overhaul": "Révision",
  "Check": "Contrôle"
};

// États de maintenance
const MAINTENANCE_STATES = [
  "Scheduled",        // Changé de "Planifiée"
  "In Progress",      // Changé de "En cours"
  "Completed"         // Changé de "Terminée"
] as const;

// Map English states to French for display
const stateToFrench: Record<string, string> = {
  "Scheduled": "Planifiée",
  "In Progress": "En cours",
  "Completed": "Terminée"
};

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/maintenance/maintenance/");
      // Assurez-vous que les données ont un maintenance_id
      const data = response.data.map((item: any, index: number) => ({
        ...item,
        // Si maintenance_id n'existe pas, utilisez un ID temporaire
        maintenance_id: item.maintenance_id || index + 1
      }));
      setRows(data);
    } catch (err: any) {
      setError("Impossible de charger la liste des maintenances");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  // CORRECTION : Handle row click to navigate to details page
  const handleRowClick = (params: GridRowParams<Maintenance>) => {
    // Vérifiez si params.row existe et a un maintenance_id
    if (params.row && params.row.maintenance_id) {
      navigate(`/maintenance/${params.row.maintenance_id}`);
    }
  };

  // Filter maintenances by type and state
  const filteredRows = React.useMemo(() => {
    return rows.filter(maintenance => {
      const typeMatch = typeFilter === "all" || maintenance.typee === typeFilter;
      const stateMatch = stateFilter === "all" || maintenance.state === stateFilter;
      return typeMatch && stateMatch;
    });
  }, [rows, typeFilter, stateFilter]);

  const columns: GridColDef<Maintenance>[] = [
    {
      field: "maintenance_id",
      headerName: "ID",
      width: 80,
      type: "number"
    },
    { 
      field: "avion_id", 
      headerName: "ID Avion", 
      width: 100,
      type: "number" 
    },
    {
      field: "operationdate",
      headerName: "Date Opération",
      width: 150,
      valueFormatter: (value) => 
        value ? new Date(value).toLocaleDateString('fr-FR') : "",
    },
    {
      field: "typee",
      headerName: "Type",
      width: 150,
      valueGetter: (value) => typeToFrench[value as string] || value,
      renderCell: (params) => {
        const frenchType = typeToFrench[params.value as string] || params.value;
        const colorMap: Record<string, "success" | "warning" | "info" | "error"> = {
          "Inspection": "info",
          "Réparation": "warning",
          "Nettoyage": "success",
          "Révision": "success",
          "Contrôle": "error",
        };
        return (
          <Chip
            label={frenchType}
            color={colorMap[frenchType as string] || "default"}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "state",
      headerName: "État",
      width: 130,
      valueGetter: (value) => stateToFrench[value as string] || value,
      renderCell: (params) => {
        const frenchState = stateToFrench[params.value as string] || params.value;
        const stateColors: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
          "Planifiée": "info",
          "En cours": "warning",
          "Terminée": "success",
        };
        
        return (
          <Chip
            label={frenchState}
            color={stateColors[frenchState as string] || "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => {
        const isEditable = params.row.state !== "Completed";
        
        return (
          <Button
            size="small"
            variant="outlined"
            disabled={!isEditable}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/maintenance/${params.row.maintenance_id}/edit`);
            }}
          >
            Modifier
          </Button>
        );
      },
    },
  ];

  const typeOptions = [
    { value: "all", label: "Tous les types" },
    { value: "Inspection", label: "Inspection" },
    { value: "Repair", label: "Réparation" },
    { value: "Cleaning", label: "Nettoyage" },
    { value: "Overhaul", label: "Révision" },
    { value: "Check", label: "Contrôle" },
  ];

  const stateOptions = [
    { value: "all", label: "Tous les états" },
    { value: "Scheduled", label: "Planifiée" },
    { value: "In Progress", label: "En cours" },
    { value: "Completed", label: "Terminée" },
  ];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const planned = rows.filter(m => m.state === "Scheduled").length;
    const inProgress = rows.filter(m => m.state === "In Progress").length;
    const completed = rows.filter(m => m.state === "Completed").length;
    
    const inspections = rows.filter(m => m.typee === "Inspection").length;
    const repairs = rows.filter(m => m.typee === "Repair").length;
    const cleanings = rows.filter(m => m.typee === "Cleaning").length;
    
    return {
      total,
      planned,
      inProgress,
      completed,
      inspections,
      repairs,
      cleanings,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [rows]);

  const handleAddMaintenance = () => {
    navigate("/maintenance/nouveau");
  };

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DES MAINTENANCES"
          subTitle="Planifiez et suivez les opérations de maintenance de la flotte"
        />
      </Box>

      <PageContainer
        title="Maintenances"
        breadcrumbs={[{ title: "Maintenances" }]}
        actions={
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 200, mb: { xs: 1, sm: 0 } }}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              size="small"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              sx={{ minWidth: 200, mb: { xs: 1, sm: 0 } }}
            >
              {stateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Recharger">
                <IconButton size="small" onClick={fetchMaintenances}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddMaintenance}
              >
                Nouvelle Maintenance
              </Button>
            </Box>
          </Stack>
        }
      >
        {/* Quick statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3 
        }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#e3f2fd', 
            borderRadius: 2,
            border: '1px solid #bbdefb',
            flex: '1 1 200px',
            minWidth: '150px'
          }}>
            <Box sx={{ fontSize: '0.875rem', color: '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon fontSize="small" />
              Total Maintenances
            </Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0d47a1' }}>
              {stats.total}
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#e8f5e9', 
            borderRadius: 2,
            border: '1px solid #c8e6c9',
            flex: '1 1 200px',
            minWidth: '150px'
          }}>
            <Box sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>Terminées</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' }}>
              {stats.completed}
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#fff3e0', 
            borderRadius: 2,
            border: '1px solid #ffe0b2',
            flex: '1 1 200px',
            minWidth: '150px'
          }}>
            <Box sx={{ fontSize: '0.875rem', color: '#ef6c00' }}>En cours</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>
              {stats.inProgress}
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f3e5f5', 
            borderRadius: 2,
            border: '1px solid #e1bee7',
            flex: '1 1 200px',
            minWidth: '150px'
          }}>
            <Box sx={{ fontSize: '0.875rem', color: '#7b1fa2' }}>Taux d'achèvement</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a148c' }}>
              {stats.completionRate}%
            </Box>
          </Box>
        </Box>

        {/* Type-specific statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          justifyContent: 'center'
        }}>
          <Chip 
            label={`${stats.inspections} Inspections`}
            color="info"
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.repairs} Réparations`}
            color="warning"
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.cleanings} Nettoyages`}
            color="success"
            variant="outlined"
            sx={{ px: 2 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.maintenance_id}
          loading={loading}
          onRowClick={handleRowClick}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: { 
              showQuickFilter: true,
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true },
            },
          }}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
            },
          }}
        />
      </PageContainer>
    </>
  );
}