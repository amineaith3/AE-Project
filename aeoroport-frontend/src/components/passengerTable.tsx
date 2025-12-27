// src/components/passenger/PassengerTable.tsx
import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { frFR } from "@mui/x-data-grid/locales";
import Header from "./header";
import PageContainer from "./pageContainer";

const INITIAL_PAGE_SIZE = 10;

interface Passenger {
  passenger_id: number;
  nom: string;
  prenom: string;
  numPasseport: string;
  contact: string;
  nationality: string;
  age_pass: number;
  is_registered: boolean;
}

interface PassengerTableProps {
  mode: 'enregistrement' | 'billeterie' | 'controle';
  title?: string;
  subTitle?: string;
}

export default function PassengerTable({ 
  mode, 
  title = "LISTE DES PASSAGERS", 
  subTitle 
}: PassengerTableProps) {
  const navigate = useNavigate();
  
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });
  
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [rows, setRows] = React.useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Simuler les données
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRows([
        { passenger_id: 1, nom: "Dupont", prenom: "Jean", numPasseport: "AB123456", contact: "jean@email.com", nationality: "Française", age_pass: 35, is_registered: false },
        { passenger_id: 2, nom: "Curie", prenom: "Marie", numPasseport: "CD789012", contact: "marie@email.com", nationality: "Polonaise", age_pass: 42, is_registered: true },
        { passenger_id: 3, nom: "Martin", prenom: "Paul", numPasseport: "EF345678", contact: "paul@email.com", nationality: "Française", age_pass: 28, is_registered: false },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRegisterPassenger = React.useCallback((passenger: Passenger) => async () => {
    if (mode === 'enregistrement') {
      console.log("Enregistrement du passager:", passenger);
      setRows(prevRows => 
        prevRows.map(p => 
          p.passenger_id === passenger.passenger_id 
            ? { ...p, is_registered: true } 
            : p
        )
      );
    }
  }, [mode]);

  // Déterminer les colonnes en fonction du mode
  const columns = React.useMemo<GridColDef<Passenger>[]>(() => {
    const baseColumns: GridColDef<Passenger>[] = [
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
        field: "numPasseport",
        headerName: "Passeport",
        width: 130,
        type: "string",
      },
      {
        field: "contact",
        headerName: "Contact",
        width: 150,
        type: "string",
      },
      {
        field: "nationality",
        headerName: "Nationalité",
        width: 120,
        type: "string",
      },
      {
        field: "age_pass",
        headerName: "Âge",
        width: 80,
        type: "number",
      },
      {
        field: "is_registered",
        headerName: "Statut",
        width: 120,
        renderCell: (params: GridRenderCellParams<Passenger, boolean>) => (
          params.value ? "✓ Enregistré" : "En attente"
        ),
      },
    ];

    // Ajouter la colonne actions seulement pour 'enregistrement'
    if (mode === 'enregistrement') {
      baseColumns.push({
        field: "actions",
        type: "actions",
        width: 120,
        getActions: ({ row }: { row: Passenger }) => {
          const actions = [];
          
          if (!row.is_registered) {
            actions.push(
              <GridActionsCellItem
                key="enregistrer-passager"
                icon={<CheckCircleIcon color="success" />}
                label="Enregistrer"
                onClick={handleRegisterPassenger(row)}
                showInMenu={false}
              />
            );
          }
          
          return actions;
        },
      });
    }

    return baseColumns;
  }, [mode, handleRegisterPassenger]);

  // Déterminer les actions disponibles dans la toolbar
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
              onClick={() => navigate("/enregistrement/passagers/nouveau")}
              startIcon={<AddIcon />}
            >
              Ajouter Passager
            </Button>
          </Stack>
        );
      case 'billeterie':
      case 'controle':
        return (
          <Tooltip title="Recharger" placement="right">
            <IconButton size="small" onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  // Déterminer le titre par défaut
  const getDefaultSubTitle = () => {
    switch(mode) {
      case 'enregistrement': return "Gérez l'enregistrement des passagers";
      case 'billeterie': return "Consultez les passagers pour les réservations";
      case 'controle': return "Consultez les passagers pour les contrôles de sécurité";
      default: return "";
    }
  };

  const customFrenchLocale = {
    ...frFR.components.MuiDataGrid.defaultProps.localeText,
    toolbarQuickFilterPlaceholder: "Rechercher passagers...",
  };

  return (
    <>
      <Box m="20px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header
            title={title}
            subTitle={subTitle || getDefaultSubTitle()}
          />
        </Box>
      </Box>

      <PageContainer
        title="Passagers"
        breadcrumbs={[{ title: "Passagers" }]}
        actions={getActions()}
      >
        <Box sx={{ flex: 1 }}>
          {error ? (
            <Alert severity="error">{error.message}</Alert>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row: Passenger) => row.passenger_id}
              loading={isLoading}
              localeText={customFrenchLocale}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              pageSizeOptions={[5, 10, 25]}
            />
          )}
        </Box>
      </PageContainer>
    </>
  );
}