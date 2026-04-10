import { AppBar, Toolbar } from "@mui/material";
import logo from "../assets/logo.png";
import "./Header.css";

const Header = () => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1300,
        backgroundColor: "#ffffff",
        color: "#1a2e0f",
        borderBottom: "1px solid rgba(59, 109, 17, 0.1)", // soft green tinted border
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}
    >
      <Toolbar>
        <img src={logo} alt="Logo" className="header-logo" />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
