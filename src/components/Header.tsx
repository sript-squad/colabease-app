import { AppBar, Toolbar, Typography } from "@mui/material";
import logo from "../assets/logo.png";

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
        <img
          src={logo}
          alt="Logo"
          style={{ width: "120px", height: "40px", marginRight: "10px" }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
