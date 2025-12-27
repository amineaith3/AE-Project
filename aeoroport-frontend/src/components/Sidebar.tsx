// src/components/Sidebar.tsx
import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Avatar,
  Collapse,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";

// Icônes des tables
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AirplanemodeActiveOutlinedIcon from "@mui/icons-material/AirplanemodeActiveOutlined";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

// Icônes des actions
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
// ============================================================================
// 1. Définition des Interfaces
// ============================================================================

interface TableFunction {
  title: string;
  to: string;
  icon: React.ReactNode;
  description?: string;
}

interface DatabaseTable {
  name: string;
  displayName: string;
  icon: React.ReactNode;
  color: string;
  functions: TableFunction[];
  expanded?: boolean;
}

// ============================================================================
// 2. Données des tables avec leurs fonctionnalités
// ============================================================================

const databaseTables: DatabaseTable[] = [
  {
    name: "Passengers",
    displayName: "Passagers",
    icon: <PeopleOutlinedIcon />,
    color: "#1976d2",
    functions: [
      {
        title: "Liste des Passagers",
        to: "/passagers",
        icon: <ListOutlinedIcon />,
        description: "Voir tous les passagers",
      },
      {
        title: "Ajouter Passager",
        to: "/passagers/nouveau",
        icon: <AddCircleOutlinedIcon />,
        description: "Créer un nouveau passager",
      },
    ],
  },
  {
    name: "Aircrafts",
    displayName: "Avions",
    icon: <AirplanemodeActiveOutlinedIcon />,
    color: "#2e7d32",
    functions: [
      {
        title: "Liste des Avions",
        to: "/avions",
        icon: <ListOutlinedIcon />,
        description: "Voir tous les avions",
      },
      {
        title: "Ajouter Avion",
        to: "/avions/nouvelle",
        icon: <AddCircleOutlinedIcon />,
        description: "Ajouter un nouvel avion",
      },
      /*{
        title: "État de la Flotte",
        to: "/avions/etat",
        icon: <AssessmentOutlinedIcon />,
        description: "Voir l'état des avions"
      },*/
    ],
  },
  {
    name: "Flights",
    displayName: "Vols",
    icon: <FlightTakeoffIcon />,
    color: "#ed6c02",
    functions: [
      {
        title: "Liste des Vols",
        to: "/vols",
        icon: <ListOutlinedIcon />,
        description: "Voir tous les vols",
      },
      {
        title: "Créer Vol",
        to: "/vols/nouveau",
        icon: <AddCircleOutlinedIcon />,
        description: "Planifier un nouveau vol",
      },
      /*{
        title: "Statut Vols",
        to: "/flights/statut",
        icon: <AssessmentOutlinedIcon />,
        description: "Voir le statut des vols"
      },*/
    ],
  },
  {
    name: "Reservations",
    displayName: "Réservations",
    icon: <ConfirmationNumberOutlinedIcon />,
    color: "#9c27b0",
    functions: [
      {
        title: "Liste Réservations",
        to: "/reservations",
        icon: <ListOutlinedIcon />,
        description: "Voir toutes les réservations",
      },
      {
        title: "Nouvelle Réservation",
        to: "/reservations/nouvelle",
        icon: <AddCircleOutlinedIcon />,
        description: "Créer une réservation",
      },
    ],
  },
  {
    name: "Maintenance",
    displayName: "Maintenance",
    icon: <BuildOutlinedIcon />,
    color: "#00796b",
    functions: [
      {
        title: "Liste Maintenances",
        to: "/maintenance",
        icon: <ListOutlinedIcon />,
        description: "Voir toutes les maintenances",
      },
      {
        title: "Planifier Maintenance",
        to: "/maintenance/nouveau",
        icon: <AddCircleOutlinedIcon />,
        description: "Planifier une maintenance",
      },
      /*{
        title: "Aircrafts en Maintenance",
        to: "/maintenance/avions",
        icon: <EditOutlinedIcon />,
        description: "Suivre l'avancement"
      },*/
    ],
  },
];

// ============================================================================
// 3. Composant TableSection
// ============================================================================

interface TableSectionProps {
  table: DatabaseTable;
  isCollapsed: boolean;
  selectedFunction: string;
  onToggle: (tableName: string) => void;
  onSelectFunction: (functionName: string) => void;
}

const TableSection: React.FC<TableSectionProps> = ({
  table,
  isCollapsed,
  selectedFunction,
  onToggle,
  onSelectFunction,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 1 }}>
      {/* En-tête de la table */}
      <MenuItem
        onClick={() => onToggle(table.name)}
        style={{
          backgroundColor: table.expanded ? `${table.color}15` : "transparent",
          color: table.color,
          margin: "4px 8px",
          padding: "10px 15px",
          borderRadius: "8px",
          fontWeight: table.expanded ? 600 : 400,
        }}
        icon={table.icon}
      >
        {!isCollapsed && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography variant="body2">{table.displayName}</Typography>
            {table.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
        )}
      </MenuItem>

      {/* Fonctionnalités de la table */}
      {table.expanded && !isCollapsed && (
        <Box sx={{ pl: 3, pr: 1 }}>
          {table.functions.map((func) => (
            <MenuItem
              key={func.title}
              active={selectedFunction === func.title}
              onClick={() => onSelectFunction(func.title)}
              style={{
                color:
                  selectedFunction === func.title
                    ? table.color
                    : theme.palette.grey[700],
                backgroundColor:
                  selectedFunction === func.title
                    ? `${table.color}10`
                    : "transparent",
                margin: "2px 0",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.875rem",
              }}
              icon={func.icon}
              component={<Link to={func.to} />}
            >
              <Typography variant="body2">{func.title}</Typography>
            </MenuItem>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// 4. Composant Sidebar Principal
// ============================================================================

const AirportSidebar: React.FC = () => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedFunction, setSelectedFunction] =
    useState<string>("Tableau de Bord");
  const [tables, setTables] = useState<DatabaseTable[]>(
    databaseTables.map((table) => ({ ...table, expanded: false }))
  );

  const toggleTable = (tableName: string) => {
    setTables(
      tables.map((table) =>
        table.name === tableName
          ? { ...table, expanded: !table.expanded }
          : { ...table, expanded: false }
      )
    );
  };

  const handleSelectFunction = (functionName: string) => {
    setSelectedFunction(functionName);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Barre latérale */}
      <ProSidebar
        collapsed={isCollapsed}
        collapsedWidth="80px"
        width="280px"
        style={{ height: "100%" }}
        rootStyles={{
          ".ps-sidebar-container": {
            backgroundColor: "#ffffff",
            borderRight: `1px solid ${theme.palette.grey[200]}`,
            boxShadow: "2px 0 12px rgba(0,0,0,0.05)",
          },
          ".ps-menu-button": {
            padding: "10px 15px",
            margin: "4px 8px",
            borderRadius: "8px",
            transition: "all 0.2s",
          },
          ".ps-menu-button:hover": {
            backgroundColor: theme.palette.grey[100],
          },
          ".ps-active": {
            fontWeight: "600",
          },
        }}
      >
        <Menu>
          {/* En-tête */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              marginBottom: "20px",
              padding: "15px",
              borderBottom: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  Gestion Aéroport
                </Typography>
                <IconButton size="small">
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* Section Tables de la base de données */}
          {!isCollapsed && (
            <Typography
              variant="overline"
              sx={{
                display: "block",
                px: 2,
                py: 1,
                color: theme.palette.grey[500],
                letterSpacing: "0.5px",
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              TABLES DE LA BASE DE DONNÉES
            </Typography>
          )}

          {/* Listes des tables */}
          <Box sx={{ px: isCollapsed ? 0 : 1 }}>
            {tables.map((table) => (
              <TableSection
                key={table.name}
                table={table}
                isCollapsed={isCollapsed}
                selectedFunction={selectedFunction}
                onToggle={toggleTable}
                onSelectFunction={handleSelectFunction}
              />
            ))}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default AirportSidebar;
