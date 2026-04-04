import { AppBar, Toolbar, Typography } from "@mui/material";
import logo from "../assets/logo.png";
import "./Header.css";

const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "var(--primary-color)",
        color: "var(--text-color)",
      }}
    >
      <Toolbar>
        <img src={logo} alt="Logo" className="header-logo" />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
