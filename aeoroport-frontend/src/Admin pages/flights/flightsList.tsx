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
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
import axios from "axios";
import api from "../../interceptor/api";

interface Flight {
  vol_num: number;
  destination: string;
  departure_time: string;
  arrival_time: string;
  current_capacity: number;
  state: string;
  avion_id?: number;
}

const FLIGHT_STATES = [
  "Scheduled",
  "Delayed", 
  "Boarding",
  "Cancelled"
] as const;

type FlightState = typeof FLIGHT_STATES[number];

// Map English states to French for display
const stateToFrench: Record<string, string> = {
  "Scheduled": "Programmé",
  "Delayed": "En retard",
  "Boarding": "Embarquement",
  "Cancelled": "Annulé"
};

// Map French states to English for API
const stateToEnglish: Record<string, string> = {
  "Programmé": "Scheduled",
  "En retard": "Delayed",
  "Embarquement": "Boarding",
  "Annulé": "Cancelled"
};

export default function VolList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/flights/flights/");
      setRows(response.data);
    } catch (err: any) {
      setError("Impossible de charger la liste des vols");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  // Handle row click to navigate to details page
  const handleRowClick = (params: GridRowParams) => {
    navigate(`/vols/${params.row.vol_num}`);
  };

  // Filter flights by state
  const filteredRows = React.useMemo(() => {
    if (stateFilter === "all") return rows;
    return rows.filter(flight => flight.state === stateFilter);
  }, [rows, stateFilter]);

  const columns: GridColDef<Flight>[] = [
    { field: "vol_num", headerName: "N° Vol", width: 100 },
    { field: "destination", headerName: "Destination", width: 160 },
    {
      field: "departure_time",
      headerName: "Départ",
      width: 180,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleString() : "",
    },
    {
      field: "arrival_time",
      headerName: "Arrivée",
      width: 180,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleString() : "",
    },
    {
      field: "current_capacity",
      headerName: "Passagers",
      width: 120,
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
      headerName: "Statut",
      width: 150,
      valueGetter: (value) => stateToFrench[value as string] || value,
      renderCell: (params) => {
        const frenchState = stateToFrench[params.value as string] || params.value;
        const colorMap: Record<string, "success" | "warning" | "info" | "error"> = {
          "Programmé": "success",
          "En retard": "warning",
          "Embarquement": "info",
          "Annulé": "error",
        };
        return (
          <Chip
            label={frenchState}
            color={colorMap[frenchState as string] || "default"}
            size="small"
          />
        );
      },
    },
  ];

  const stateOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "Scheduled", label: "Programmé" },
    { value: "Delayed", label: "En retard" },
    { value: "Boarding", label: "Embarquement" },
    { value: "Cancelled", label: "Annulé" },
  ];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const scheduled = rows.filter(f => f.state === "Scheduled").length;
    const delayed = rows.filter(f => f.state === "Delayed").length;
    const boarding = rows.filter(f => f.state === "Boarding").length;
    const cancelled = rows.filter(f => f.state === "Cancelled").length;
    
    return {
      total,
      scheduled,
      delayed,
      boarding,
      cancelled,
      onTimePercent: total > 0 ? Math.round(((total - delayed - cancelled) / total) * 100) : 0,
    };
  }, [rows]);

  const handleAddFlight = () => {
    navigate("/vols/nouveau");
  };

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DES VOLS"
          subTitle="Consultez l'état et la disponibilité des vols"
        />
      </Box>

      <PageContainer
        title="Vols"
        breadcrumbs={[{ title: "Vols" }]}
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
              <IconButton size="small" onClick={fetchFlights}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddFlight}
            >
              Ajouter un Vol
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
            <Box sx={{ fontSize: '0.875rem', color: '#1565c0' }}>Total Vols</Box>
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
            <Box sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>Programmés</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' }}>
              {stats.scheduled}
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
            <Box sx={{ fontSize: '0.875rem', color: '#ef6c00' }}>En retard</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>
              {stats.delayed}
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
            <Box sx={{ fontSize: '0.875rem', color: '#7b1fa2' }}>À l'heure</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a148c' }}>
              {stats.onTimePercent}%
            </Box>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.vol_num}
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