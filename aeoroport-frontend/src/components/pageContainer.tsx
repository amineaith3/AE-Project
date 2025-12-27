// src/components/PageContainer.tsx
import React, { ReactNode } from "react";
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageContainerProps {
  title: string;
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

const PageContainer = ({
  title,
  children,
  breadcrumbs = [],
  actions,
}: PageContainerProps) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec titre et fil d'Ariane */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <div>
          {/* Fil d'Ariane */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs sx={{ mb: 1 }}>
              {breadcrumbs.map((item, index) =>
                item.path ? (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      textDecoration: "none",
                      color: "#666",
                      "&:hover": { color: "#1976d2" },
                    }}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <Typography key={index} sx={{ color: "#1976d2", fontWeight: "bold" }}>
                    {item.title}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}
          
          {/* Titre de la page */}
          <Typography
            variant="h4"
            sx={{
              color: "#2c3e50",
              fontWeight: "bold",
              fontSize: "1.8rem",
            }}
          >
            {title}
          </Typography>
        </div>

        {/* Actions (boutons à droite) */}
        {actions && (
          <Stack direction="row" spacing={2} alignItems="center">
            {actions}
          </Stack>
        )}
      </Box>

      {/* Contenu principal */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "white",
          minHeight: "400px",
          border: "1px solid #e0e0e0",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default PageContainer;