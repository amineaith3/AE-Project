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
  Avatar,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import FlightIcon from "@mui/icons-material/Flight";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonIcon from "@mui/icons-material/Person";
import ChairIcon from "@mui/icons-material/Chair";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import BadgeIcon from "@mui/icons-material/Badge";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import Header from "../../components/header";
import PageContainer from "../../components/pageContainer";
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

interface Reservation {
  reservation_id: number;
  passenger_id: number;
  vol_num: number;
  seatcode: string;
  state: string;
  guardian_id?: number;
}

interface ExtendedReservation extends Reservation {
  passenger?: Passenger;
  guardian?: Passenger;
}

export default function ReservationList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ExtendedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [flightFilter, setFlightFilter] = useState<string>("all");
  const [passengerMap, setPassengerMap] = useState<Record<number, Passenger>>({});

  // Fetch all passengers for mapping
  const fetchPassengers = useCallback(async () => {
    try {
      const response = await api.get("/passengers/passengers");
      const passengers = response.data; 
      const map: Record<number, Passenger> = {};
      passengers.forEach((passenger: Passenger) => {
        map[passenger.passenger_id] = passenger;
      });
      setPassengerMap(map);
    } catch (err: any) {
      console.error("Error fetching passengers:", err);
    }
  }, []);

  // Fetch reservations from backend
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both passengers and reservations in parallel
      await Promise.all([fetchPassengers()]);

      const response = await api.get("/reservations/reservations");
      
      // Assuming the API returns { reservations: [...] } or just the array
      const reservationsData = response.data.reservations || response.data;
      
      if (!Array.isArray(reservationsData)) {
        throw new Error("Invalid response format");
      }

      // Combine reservation data with passenger data
      const extendedReservations: ExtendedReservation[] = reservationsData.map((res: Reservation) => ({
        ...res,
        passenger: passengerMap[res.passenger_id],
        guardian: res.guardian_id ? passengerMap[res.guardian_id] : undefined
      }));

      setRows(extendedReservations);
    } catch (err: any) {
      setError("Impossible de charger la liste des réservations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchPassengers, passengerMap]);

  // Refetch when passengerMap updates
  useEffect(() => {
    if (Object.keys(passengerMap).length > 0 && rows.length === 0) {
      fetchReservations();
    }
  }, [passengerMap, rows.length, fetchReservations]);

  // Initial data fetch
  useEffect(() => {
    fetchReservations();
  }, []);

  // Handle row click to navigate to details page
  // Handle row click to navigate to details page

  // Add this debugging function
const handleRowClick = (params: GridRowParams) => {
  const reservation = params.row;
  
  // Use numpasseport (no underscore) instead of num_passeport
  const passportNumber = reservation.passenger?.numpasseport;
  
  if (passportNumber) {
    console.log(`Navigating with passport: ${passportNumber}`);
    navigate(`/reservations/${passportNumber}`);
  } else {
    console.warn("Passport number not found, using reservation_id");
    navigate(`/reservations/${reservation.reservation_id}`);
  }
};
  // Filter reservations by state and flight number
  const filteredRows = React.useMemo(() => {
    return rows.filter(reservation => {
      const stateMatch = stateFilter === "all" || reservation.state === stateFilter;
      const flightMatch = flightFilter === "all" || 
        reservation.vol_num.toString() === flightFilter;
      
      return stateMatch && flightMatch;
    });
  }, [rows, stateFilter, flightFilter]);

  const columns: GridColDef<ExtendedReservation>[] = [
    { 
      field: "reservation_id", 
      headerName: "ID Réservation", 
      width: 130,
      type: "number",
      renderCell: (params) => (
        <Box sx={{ 
          fontWeight: "bold",
          color: "#1976d2",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: 0.5
        }}>
          <ConfirmationNumberIcon fontSize="small" />
          #{params.value}
        </Box>
      )
    },
    { 
      field: "passenger", 
      headerName: "Passager", 
      width: 200,
      renderCell: (params) => {
        const passenger = params.row.passenger;
        return passenger ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2" }}>
              {passenger.age < 18 ? <ChildCareIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: "medium", fontSize: "0.875rem" }}>
                {passenger.prenom} {passenger.nom}
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {passenger.age} ans • {passenger.nationality}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            color: "text.secondary",
            fontStyle: "italic"
          }}>
            <CircularProgress size={20} />
            Chargement...
          </Box>
        );
      }
    },
    { 
      field: "passport", 
      headerName: "Passeport", 
      width: 140,
      renderCell: (params) => (
        params.row.passenger ? (
          <Box sx={{ 
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.9rem"
          }}>
            <BadgeIcon fontSize="small" color="action" />
            {params.row.passenger.numpasseport}
          </Box>
        ) : null
      )
    },
    { 
      field: "vol_num", 
      headerName: "Vol", 
      width: 110,
      type: "number",
      renderCell: (params) => (
        <Chip 
          label={`#${params.value}`} 
          color="primary" 
          size="small"
          variant="outlined"
          icon={<FlightIcon fontSize="small" />}
          sx={{ fontWeight: "medium" }}
        />
      )
    },
    { 
      field: "seatcode", 
      headerName: "Siège", 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ 
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          fontWeight: "bold",
          color: "#2e7d32",
          fontSize: "1.1rem"
        }}>
          <ChairIcon fontSize="small" />
          {params.value}
        </Box>
      )
    },
    { 
      field: "state", 
      headerName: "Statut", 
      width: 140,
      renderCell: (params) => {
        const getStateConfig = (state: string) => {
          const upperState = state?.toUpperCase();
          switch(upperState) {
            case "CONFIRMED":
              return { color: "success", icon: <CheckCircleIcon />, label: "Confirmée" };
            case "PENDING":
              return { color: "warning", icon: <PendingIcon />, label: "En attente" };
            case "CANCELLED":
              return { color: "error", icon: <CancelIcon />, label: "Annulée" };
            default:
              return { color: "default", icon: <PendingIcon />, label: state || "Inconnu" };
          }
        };
        
        const config = getStateConfig(params.value as string);
        
        return (
          <Chip 
            label={config.label}
            color={config.color as any}
            icon={config.icon}
            size="small"
            variant="filled"
            sx={{ fontWeight: "medium", minWidth: 100 }}
          />
        );
      }
    },
    { 
      field: "guardian", 
      headerName: "Tuteur", 
      width: 180,
      renderCell: (params) => {
        if (!params.row.guardian_id) {
          return (
            <Chip 
              label="Majeur" 
              color="default" 
              size="small"
              variant="outlined"
            />
          );
        }
        
        const guardian = params.row.guardian;
        return guardian ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: "#ed6c02" }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
              <Box sx={{ fontSize: "0.85rem", fontWeight: "medium" }}>
                {guardian.prenom} {guardian.nom}
              </Box>
              <Box sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                {guardian.age} ans
              </Box>
            </Box>
          </Box>
        ) : (
          <Chip 
            label={`Tuteur ID: ${params.row.guardian_id}`}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    { 
      field: "contact", 
      headerName: "Contact", 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ 
          fontSize: "0.85rem", 
          color: "text.secondary",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {params.row.passenger?.contact || "Non spécifié"}
        </Box>
      )
    },
  ];

  // Get unique states for filter
  const stateOptions = React.useMemo(() => {
    const states = [...new Set(rows.map(r => r.state?.toUpperCase()))];
    return [
      { value: "all", label: "Tous les statuts" },
      ...states.map(state => ({ 
        value: state, 
        label: state === "CONFIRMED" ? "Confirmées" : 
               state === "PENDING" ? "En attente" : 
               state === "CANCELLED" ? "Annulées" : state 
      }))
    ];
  }, [rows]);

  // Get unique flight numbers for filter
  const flightOptions = React.useMemo(() => {
    const flights = [...new Set(rows.map(r => r.vol_num))].sort((a, b) => a - b);
    return [
      { value: "all", label: "Tous les vols" },
      ...flights.map(flight => ({ 
        value: flight.toString(), 
        label: `Vol #${flight}` 
      }))
    ];
  }, [rows]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const confirmed = rows.filter(r => r.state?.toUpperCase() === "CONFIRMED").length;
    const pending = rows.filter(r => r.state?.toUpperCase() === "PENDING").length;
    const cancelled = rows.filter(r => r.state?.toUpperCase() === "CANCELLED").length;
    const withGuardian = rows.filter(r => r.guardian_id).length;
    
    // Age statistics
    const minors = rows.filter(r => r.passenger?.age && r.passenger.age < 18).length;
    const adults = rows.filter(r => r.passenger?.age && r.passenger.age >= 18).length;
    
    // Get unique flights count
    const uniqueFlights = [...new Set(rows.map(r => r.vol_num))].length;
    
    // Calculate seat distribution
    const seatTypes = rows.reduce((acc, r) => {
      if (r.seatcode) {
        const seatClass = r.seatcode.charAt(0);
        acc[seatClass] = (acc[seatClass] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      confirmed,
      pending,
      cancelled,
      withGuardian,
      minors,
      adults,
      uniqueFlights,
      seatTypes,
      confirmedPercent: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      minorPercent: total > 0 ? Math.round((minors / total) * 100) : 0,
    };
  }, [rows]);

  // Add button action
  const handleAddReservation = () => {
    navigate("/reservations/nouvelle");
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchReservations();
  };

  return (
    <>
      <Box m="20px">
        <Header
          title="GESTION DES RÉSERVATIONS"
          subTitle="Consultez et gérez les réservations des passagers"
        />
      </Box>

      <PageContainer
        title="Réservations"
        breadcrumbs={[{ title: "Réservations" }]}
        actions={
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
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
            
            <TextField
              select
              size="small"
              value={flightFilter}
              onChange={(e) => setFlightFilter(e.target.value)}
              sx={{ minWidth: 150, mb: { xs: 1, sm: 0 } }}
            >
              {flightOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Recharger">
                <IconButton size="small" onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddReservation}
              >
                Nouvelle Réservation
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
            <Box sx={{ fontSize: '0.875rem', color: '#1565c0' }}>Total Réservations</Box>
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
            <Box sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>Confirmées</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' }}>
              {stats.confirmed} ({stats.confirmedPercent}%)
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
            <Box sx={{ fontSize: '0.875rem', color: '#ef6c00' }}>Passagers</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>
              {stats.adults} adultes • {stats.minors} mineurs
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
            <Box sx={{ fontSize: '0.875rem', color: '#7b1fa2' }}>Avec Tuteur</Box>
            <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4a148c' }}>
              {stats.withGuardian}
            </Box>
          </Box>
        </Box>

        {/* Status distribution statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          mb: 3,
          justifyContent: 'center'
        }}>
          <Chip 
            label={`${stats.confirmed} Confirmées`}
            color="success"
            icon={<CheckCircleIcon />}
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.pending} En attente`}
            color="warning"
            icon={<PendingIcon />}
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.cancelled} Annulées`}
            color="error"
            icon={<CancelIcon />}
            variant="outlined"
            sx={{ px: 2 }}
          />
          <Chip 
            label={`${stats.minors} Mineurs`}
            color="info"
            icon={<ChildCareIcon />}
            variant="outlined"
            sx={{ px: 2 }}
          />
        </Box>

        {/* Seat distribution statistics */}
        {Object.keys(stats.seatTypes).length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            mb: 3,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 1 }}>
              Distribution des sièges:
            </Box>
            {Object.entries(stats.seatTypes).map(([seatClass, count]) => (
              <Chip 
                key={seatClass}
                label={`Classe ${seatClass}: ${count}`}
                size="small"
                variant="outlined"
                sx={{ px: 1 }}
              />
            ))}
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.reservation_id}
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
            minHeight: 400,
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </PageContainer>
    </>
  );
}