import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout component that wraps the application content with Header and Footer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the layout
 * @param {boolean} props.maxWidth - Maximum width for the content container (false for full width)
 * @param {Object} props.sx - Additional styles for the content container
 */
const Layout = ({ children, maxWidth = 'lg', sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Header />
      <Container 
        component="main" 
        maxWidth={maxWidth} 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          ...sx
        }}
      >
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;