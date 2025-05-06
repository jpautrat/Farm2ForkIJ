import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';

const HomePage = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Farm2Fork
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Direct-to-Door Food Marketplace
          </Typography>
          <Typography variant="body1" paragraph>
            Connecting local farmers directly with consumers. Our mission is to promote sustainable agriculture, 
            support local farmers, and provide consumers with access to fresh, locally-sourced food.
          </Typography>
          <Button 
            component={Link} 
            to="/products" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default HomePage;