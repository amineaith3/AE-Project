// src/components/reservation/ReservationTable.tsx
import * as React from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { frFR } from "@mui/x-data-grid/locales";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Header from "./header";
import PageContainer from "./pageContainer";
import { useNavigate } from "react-router-dom";

interface Reservation {
  reservation_id: number;
  passenger_nom: string;
  passenger_prenom: string;
  vol_num: number;
  destination: string;
  seatCode: string;
  state: string;
}

interface ReservationTableProps {
  mode: 'enregistrement' | 'billeterie';
  title?: string;
  subTitle?: string;
}

export default function ReservationTable({ 
  mode, 
  title = "LISTE DES RÉSERVATIONS", 
  subTitle 
}: ReservationTableProps) {
  const navigate = useNavigate();
  
  const [rows, setRows] = React.useState<Reservation[]>([
    { reservation_id: 1, passenger_nom: "Dupont", passenger_prenom: "Jean", vol_num: 123, destination: "Paris", seatCode: "12A", state: "Confirmée" },
    { reservation_id: 2, passenger_nom: "Curie", passenger_prenom: "Marie", vol_num: 456, destination: "Londres", seatCode: "08C", state: "Confirmée" },
    { reservation_id: 3, passenger_nom: "Martin", passenger_prenom: "Paul", vol_num: 123, destination: "Paris", seatCode: "15B", state: "En attente" },
  ]);

  const getActions = () => {
    switch(mode) {
      case 'enregistrement':
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Recharger" placement="right">
              <IconButton size="small" onClick={() => window.location.reload()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/enregistrement/reservations/nouvelle")}
            >
              Nouvelle Réservation
            </Button>
          </Stack>
        );
      case 'billeterie':
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Recharger" placement="right">
              <IconButton size="small" onClick={() => window.location.reload()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/billeterie/reservations/nouvelle")}
            >
              Nouvelle Réservation
            </Button>
          </Stack>
        );
      default:
        return null;
    }
  };

  const getDefaultSubTitle = () => {
    switch(mode) {
      case 'enregistrement': return "Gérez les enregistrements à partir des réservations";
      case 'billeterie': return "Consultez et gérez les réservations";
      default: return "";
    }
  };

  const handleCreateEnregistrement = (reservationId: number) => {
    if (mode === 'enregistrement') {
      console.log("Créer enregistrement pour réservation:", reservationId);
      navigate(`/enregistrement/creer/${reservationId}`);
    }
  };

  // Colonnes communes
  const baseColumns: GridColDef[] = [
    { field: "reservation_id", headerName: "ID Réservation", width: 120 },
    { field: "passenger_nom", headerName: "Nom", width: 120 },
    { field: "passenger_prenom", headerName: "Prénom", width: 120 },
    { field: "vol_num", headerName: "Vol", width: 100 },
    { field: "destination", headerName: "Destination", width: 120 },
    { field: "seatCode", headerName: "Siège", width: 100 },
    { 
      field: "state", 
      headerName: "État", 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === "Confirmée" ? "success" : "warning"} 
          size="small" 
        />
      )
    },
  ];

  // Ajouter colonne actions pour 'enregistrement'
  const columns = mode === 'enregistrement' ? [
    ...baseColumns,
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: { row: { reservation_id: number; }; }) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleCreateEnregistrement(params.row.reservation_id)}
          sx={{ bgcolor: "#2e7d32" }}
        >
          Créer Enregistrement
        </Button>
      ),
    },
  ] : baseColumns;

  return (
    <>
      <Box m="20px">
        <Header
          title={title}
          subTitle={subTitle || getDefaultSubTitle()}
        />
      </Box>

      <PageContainer
        title="Réservations"
        actions={getActions()}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.reservation_id}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
        />
      </PageContainer>
    </>
  );
}