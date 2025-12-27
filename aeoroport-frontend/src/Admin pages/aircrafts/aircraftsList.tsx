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
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
import axios from "axios";
import api from "../../interceptor/api";

interface Aircraft {
  avion_id: number;
  modele: string;
  max_capacity: number;
  state: string;
}

export default function AircraftList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Fetch aircrafts from backend
  const fetchAircrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/aircrafts/aircrafts/");
      setRows(response.data);
    } catch (err: any) {
      setError("Impossible de charger la liste des avions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAircrafts();
  }, [fetchAircrafts]);

  // Handle row click to navigate to details page
  const handleRowClick = (params: GridRowParams) => {
    navigate(`/avions/${params.row.avion_id}`);
  };

  // Filter aircrafts by state
  const filteredRows = React.useMemo(() => {
    if (stateFilter === "all") return rows;
    return rows.filter(aircraft => aircraft.state === stateFilter);
  }, [rows, stateFilter]);

  const columns: GridColDef<Aircraft>[] = [
    { 
      field: "avion_id", 
      headerName: "ID", 
      width: 70,
      type: "number",
    },
    { 
      field: "modele", 
      headerName: "Modèle", 
      width: 200,
      type: "string",
    },
    { 
      field: "max_capacity", 
      headerName: "Capacité Max", 
      width: 150,
      type: "number",
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: "medium",
          color: "#1976d2",
          fontSize: "0.95rem"
        }}>
          {params.value} passagers
        </Box>
      )
    },
    { 
      field: "state", 
      headerName: "État", 
      width: 150,
      renderCell: (params) => {
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
        
        return (
          <Chip 
            label={params.value} 
            color={getChipColor(params.value as string)} 
            size="small" 
          />
        );
      }
    },
  ];

  const stateOptions = [
    { value: "all", label: "Tous les états" },
    { value: "Ready", label: "Prêt" },
    { value: "Flying", label: "En vol" },
    { value: "Turnaround", label: "Turnaround" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Out of Service", label: "Hors service" },
  ];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const available = rows.filter(a => a.state === "Ready").length;
    const inMaintenance = rows.filter(a => a.state === "Maintenance").length;
    const inFlight = rows.filter(a => a.state === "Flying").length;
    
    return {
      total,
      available,
      inMaintenance,
      inFlight,
      availablePercent: total > 0 ? Math.round((available / total) * 100) : 0,
    };
  }, [rows]);

  // Add button action
  const handleAddAircraft = () => {
    navigate("/avions/nouveau");
  };

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DE LA FLOTTE"
          subTitle="Consultez l'état et la disponibilité des avions"
        />
      </Box>

      <PageContainer
        title="Avions"
        breadcrumbs={[{ title: "Avions" }]}
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
              onClick={handleAddAircraft}
            >
              Ajouter un avion
            </Button>
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
            <Box sx={{ fontSize: '0.875rem', color: '#1565c0' }}>Total Avions</Box>
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
            <Box sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>Disponibles</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' }}>
              {stats.available} ({stats.availablePercent}%)
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
            <Box sx={{ fontSize: '0.875rem', color: '#ef6c00' }}>En Maintenance</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>
              {stats.inMaintenance}
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
            <Box sx={{ fontSize: '0.875rem', color: '#7b1fa2' }}>En Vol</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a148c' }}>
              {stats.inFlight}
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.avion_id}
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