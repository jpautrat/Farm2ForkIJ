import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, Divider, useTheme, useMediaQuery } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Farm2Fork
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Connecting local farmers directly with consumers. 
              Our mission is to promote sustainable agriculture, support local farmers, 
              and provide consumers with access to fresh, locally-sourced food.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Home
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Products
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/categories" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Categories
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Contact Us
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>
                  FAQ
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/shipping" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Shipping & Delivery
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/returns" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Returns & Refunds
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Contact Information */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2">
                123 Farm Lane, Harvest City, HC 12345
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2">
                (123) 456-7890
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">
                support@farm2fork.com
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <Typography variant="body2" sx={{ mb: isMobile ? 2 : 0 }}>
            &copy; {new Date().getFullYear()} Farm2Fork. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography variant="body2">
                Privacy Policy
              </Typography>
            </Link>
            <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography variant="body2">
                Terms of Service
              </Typography>
            </Link>
            <Link to="/sitemap" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography variant="body2">
                Sitemap
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;