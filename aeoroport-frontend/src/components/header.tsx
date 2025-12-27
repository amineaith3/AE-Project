// src/components/Header.tsx
import { Box, Typography } from "@mui/material";

interface HeaderProps {
  title: string;
  subTitle?: string;
}

const Header = ({ title, subTitle }: HeaderProps) => {
  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        sx={{
          color: "#1a237e",
          fontWeight: "bold",
          fontSize: { xs: "1.8rem", md: "2.2rem" },
          mb: "5px"
        }}
      >
        {title}
      </Typography>
      {subTitle && (
        <Typography
          variant="h5"
          sx={{
            color: "#666",
            fontWeight: "normal",
            fontSize: { xs: "0.9rem", md: "1rem" }
          }}
        >
          {subTitle}
        </Typography>
      )}
    </Box>
  );
};

export default Header;