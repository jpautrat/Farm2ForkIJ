import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  Grid,
  Typography,
  Container,
  Box,
  CircularProgress,
  Pagination,
  Paper,
  Divider,
  Alert,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Refresh } from '@material-ui/icons';

// Components
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';

// Redux actions
import { listProducts } from '../../redux/actions/productActions';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  title: {
    marginBottom: theme.spacing(4),
    fontWeight: 600,
  },
  gridContainer: {
    marginTop: theme.spacing(4),
  },
  pagination: {
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
  },
  noProducts: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
  errorContainer: {
    marginBottom: theme.spacing(4),
  },
  filterContainer: {
    marginBottom: theme.spacing(4),
  },
  filterPaper: {
    padding: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  refreshButton: {
    marginLeft: theme.spacing(2),
  },
  resultsCount: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const ProductList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();

  // Get query params
  const query = new URLSearchParams(location.search);
  const pageQuery = query.get('page');
  const categoryQuery = query.get('category');

  // Component state
  const [currentPage, setCurrentPage] = useState(parseInt(pageQuery) || 1);

  // Redux state
  const { loading, error, products, pages, count } = useSelector(
    (state) => state.productList
  );

  // Fetch products on component mount and when page changes
  useEffect(() => {
    dispatch(listProducts(currentPage));
  }, [dispatch, currentPage]);

  // Update URL when page changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', currentPage);
    
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentPage, location.pathname, location.search]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(listProducts(currentPage));
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Fresh Products
        {loading && (
          <CircularProgress size={24} style={{ marginLeft: '10px' }} />
        )}
        {!loading && (
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            className={classes.refreshButton}
            size="small"
            color="primary"
            variant="outlined"
          >
            Refresh
          </Button>
        )}
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          className={classes.errorContainer}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <div className={classes.filterContainer}>
            <Paper className={classes.filterPaper}>
              <Typography variant="h6" gutterBottom>
                Filter Products
              </Typography>
              <Divider className={classes.divider} />
              {/* ProductFilter component will be implemented later */}
              {/* <ProductFilter /> */}
              <Typography variant="body2" color="textSecondary">
                Filtering options will be available soon.
              </Typography>
            </Paper>
          </div>
        </Grid>

        <Grid item xs={12} md={9}>
          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : products && products.length > 0 ? (
            <>
              <Typography variant="body1" className={classes.resultsCount}>
                Showing {products.length} of {count} products
              </Typography>

              <Grid container spacing={3} className={classes.gridContainer}>
                {products.map((product) => (
                  <Grid item key={product._id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {pages > 1 && (
                <Box className={classes.pagination}>
                  <Pagination
                    count={pages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper className={classes.noProducts}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try changing your search or filter criteria.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductList;