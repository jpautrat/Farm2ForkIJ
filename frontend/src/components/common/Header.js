import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Badge, Avatar, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, ShoppingCart, Person, ExitToApp, Dashboard, Store, Inventory, Receipt, Star, Settings, Search, Close } from '@mui/icons-material';
import { logout } from '../../redux/actions/authActions';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated, userInfo } = useSelector(state => state.auth);
  
  // Get cart state from Redux
  const { itemCount } = useSelector(state => state.cart);
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle user menu open
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/');
  };
  
  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Render mobile drawer
  const renderDrawer = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/products">
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem button component={Link} to="/categories">
          <ListItemText primary="Categories" />
        </ListItem>
        <ListItem button component={Link} to="/about">
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button component={Link} to="/contact">
          <ListItemText primary="Contact" />
        </ListItem>
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem button component={Link} to="/profile">
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          {userInfo && userInfo.role === 'admin' && (
            <ListItem button component={Link} to="/admin/dashboard">
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" />
            </ListItem>
          )}
          {userInfo && userInfo.role === 'seller' && (
            <ListItem button component={Link} to="/seller/dashboard">
              <ListItemIcon>
                <Store />
              </ListItemIcon>
              <ListItemText primary="Seller Dashboard" />
            </ListItem>
          )}
          <ListItem button component={Link} to="/orders">
            <ListItemIcon>
              <Receipt />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem button component={Link} to="/wishlist">
            <ListItemIcon>
              <Star />
            </ListItemIcon>
            <ListItemText primary="Wishlist" />
          </ListItem>
          <ListItem button component={Link} to="/settings">
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={Link} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={Link} to="/register">
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      )}
    </Box>
  );
  
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Farm2Fork
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/products">
              Products
            </Button>
            <Button color="inherit" component={Link} to="/categories">
              Categories
            </Button>
            <Button color="inherit" component={Link} to="/about">
              About
            </Button>
            <Button color="inherit" component={Link} to="/contact">
              Contact
            </Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="search"
            onClick={() => navigate('/search')}
          >
            <Search />
          </IconButton>
          
          <IconButton
            color="inherit"
            aria-label="cart"
            component={Link}
            to="/cart"
          >
            <Badge badgeContent={itemCount} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
          
          {isAuthenticated ? (
            <>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  alt={userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : ''}
                  src="/static/images/avatar/1.jpg"
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  <Person fontSize="small" sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                {userInfo && userInfo.role === 'admin' && (
                  <MenuItem component={Link} to="/admin/dashboard" onClick={handleClose}>
                    <Dashboard fontSize="small" sx={{ mr: 1 }} />
                    Admin Dashboard
                  </MenuItem>
                )}
                {userInfo && userInfo.role === 'seller' && (
                  <MenuItem component={Link} to="/seller/dashboard" onClick={handleClose}>
                    <Store fontSize="small" sx={{ mr: 1 }} />
                    Seller Dashboard
                  </MenuItem>
                )}
                <MenuItem component={Link} to="/orders" onClick={handleClose}>
                  <Receipt fontSize="small" sx={{ mr: 1 }} />
                  Orders
                </MenuItem>
                <MenuItem component={Link} to="/wishlist" onClick={handleClose}>
                  <Star fontSize="small" sx={{ mr: 1 }} />
                  Wishlist
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            !isMobile && (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {renderDrawer()}
      </Drawer>
    </AppBar>
  );
};

export default Header;