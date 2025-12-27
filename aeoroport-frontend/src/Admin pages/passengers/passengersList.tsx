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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PublicIcon from "@mui/icons-material/Public";
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
import axios from "axios";
import api from "../../interceptor/api";

interface Passenger {
  passenger_id: number;
  prenom: string;
  nom: string;
  numpasseport: number;
  contact: string;
  nationality: string;
  age: number;
}

export default function PassengerList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nationalityFilter, setNationalityFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");

  // Fetch passengers from backend
  const fetchPassengers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/passengers/passengers");
      setRows(response.data);
    } catch (err: any) {
      setError("Impossible de charger la liste des passagers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  // Handle row click to navigate to details page
  const handleRowClick = (params: GridRowParams) => {
    navigate(`/passagers/${params.row.numpasseport}`);
  };

  // Filter passengers by nationality and age
  const filteredRows = React.useMemo(() => {
    return rows.filter(passenger => {
      const nationalityMatch = nationalityFilter === "all" || passenger.nationality === nationalityFilter;
      
      let ageMatch = true;
      if (ageFilter !== "all") {
        const age = passenger.age;
        switch (ageFilter) {
          case "child":
            ageMatch = age < 18;
            break;
          case "adult":
            ageMatch = age >= 18 && age <= 65;
            break;
          case "senior":
            ageMatch = age > 65;
            break;
        }
      }
      
      return nationalityMatch && ageMatch;
    });
  }, [rows, nationalityFilter, ageFilter]);

  const columns: GridColDef<Passenger>[] = [
    { 
      field: "passenger_id", 
      headerName: "ID", 
      width: 70,
      type: "number",
    },
    { 
      field: "nom", 
      headerName: "Nom", 
      width: 120,
      type: "string",
    },
    { 
      field: "prenom", 
      headerName: "Prénom", 
      width: 120,
      type: "string",
    },
    { 
      field: "num_passeport", 
      headerName: "Passeport", 
      width: 150,
      type: "number",
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: "medium",
          color: "#1976d2",
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          gap: 0.5
        }}>
          <BadgeIcon fontSize="small" />
          {params.value}
        </Box>
      )
    },
    { 
      field: "age", 
      headerName: "Âge", 
      width: 80,
      type: "number",
      renderCell: (params) => {
        const getAgeColor = (age: number): "success" | "warning" | "info" | "default" => {
          if (age < 18) return "info"; // Enfant
          if (age > 65) return "warning"; // Sénior
          return "success"; // Adulte
        };
        
        const getAgeLabel = (age: number): string => {
          if (age < 18) return "Enfant";
          if (age > 65) return "Sénior";
          return "Adulte";
        };
        
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip 
              label={params.value} 
              color={getAgeColor(params.value as number)} 
              size="small" 
              variant="outlined"
            />
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              {getAgeLabel(params.value as number)}
            </Box>
          </Box>
        );
      }
    },
    { 
      field: "nationality", 
      headerName: "Nationalité", 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          variant="outlined" 
          size="small"
          icon={<PublicIcon fontSize="small" />}
        />
      )
    },
    { 
      field: "contact", 
      headerName: "Email", 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ 
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontSize: "0.9rem"
        }}>
          <EmailIcon fontSize="small" color="action" />
          {params.value}
        </Box>
      )
    },
  ];

  // Get unique nationalities for filter
  const nationalityOptions = React.useMemo(() => {
    const nationalities = [...new Set(rows.map(p => p.nationality))];
    return [
      { value: "all", label: "Toutes les nationalités" },
      ...nationalities.map(nat => ({ value: nat, label: nat }))
    ];
  }, [rows]);

  const ageOptions = [
    { value: "all", label: "Tous les âges" },
    { value: "child", label: "Enfants (< 18 ans)" },
    { value: "adult", label: "Adultes (18-65 ans)" },
    { value: "senior", label: "Séniors (> 65 ans)" },
  ];

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const adults = rows.filter(p => p.age >= 18 && p.age <= 65).length;
    const children = rows.filter(p => p.age < 18).length;
    const seniors = rows.filter(p => p.age > 65).length;
    
    // Get unique nationalities count
    const uniqueNationalities = [...new Set(rows.map(p => p.nationality))].length;
    
    // Calculate average age
    const avgAge = total > 0 
      ? Math.round(rows.reduce((sum, p) => sum + p.age, 0) / total)
      : 0;
    
    return {
      total,
      adults,
      children,
      seniors,
      uniqueNationalities,
      avgAge,
      adultPercent: total > 0 ? Math.round((adults / total) * 100) : 0,
    };
  }, [rows]);

  // Add button action
  const handleAddPassenger = () => {
    navigate("/passengers/nouveau");
  };

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DES PASSAGERS"
          subTitle="Consultez et gérez les informations des passagers"
        />
      </Box>

      <PageContainer
        title="Passagers"
        breadcrumbs={[{ title: "Passagers" }]}
        actions={
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <TextField
              select
              size="small"
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              sx={{ minWidth: 200, mb: { xs: 1, sm: 0 } }}
            >
              {nationalityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              size="small"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              sx={{ minWidth: 200, mb: { xs: 1, sm: 0 } }}
            >
              {ageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Recharger">
                <IconButton size="small" onClick={fetchPassengers}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleAddPassenger}
              >
                Nouveau Passager
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
            <Box sx={{ fontSize: '0.875rem', color: '#1565c0' }}>Total Passagers</Box>
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
            <Box sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>Adultes</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' }}>
              {stats.adults} ({stats.adultPercent}%)
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
            <Box sx={{ fontSize: '0.875rem', color: '#ef6c00' }}>Âge Moyen</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>
              {stats.avgAge} ans
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
            <Box sx={{ fontSize: '0.875rem', color: '#7b1fa2' }}>Nationalités</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a148c' }}>
              {stats.uniqueNationalities}
            </Box>
          </Box>
        </Box>

        {/* Age distribution statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          justifyContent: 'center'
        }}>
          <Chip 
            label={`${stats.children} Enfants`}
            color="info"
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.adults} Adultes`}
            color="success"
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.seniors} Séniors`}
            color="warning"
            variant="outlined"
            sx={{ px: 2 }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.passenger_id}
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