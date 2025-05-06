import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Paper,
  InputBase,
  IconButton,
  Divider,
  Box,
  Typography,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Search, Clear, FilterList } from '@material-ui/icons';

// Redux actions
import { searchProducts } from '../../redux/actions/productActions';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  searchContainer: {
    marginBottom: theme.spacing(3),
  },
  searchTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
  filterButton: {
    marginLeft: theme.spacing(1),
  },
}));

const ProductSearch = ({ onFilterToggle }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Get search query from URL
  const query = new URLSearchParams(location.search);
  const keywordFromUrl = query.get('keyword') || '';
  const categoryFromUrl = query.get('category') || '';

  // Component state
  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [activeFilters, setActiveFilters] = useState([]);

  // Update active filters when URL changes
  useEffect(() => {
    const filters = [];
    
    if (categoryFromUrl) {
      filters.push({
        type: 'category',
        value: categoryFromUrl,
        label: `Category: ${categoryFromUrl}`,
      });
    }
    
    // Add more filters as needed (price range, rating, etc.)
    
    setActiveFilters(filters);
  }, [categoryFromUrl]);

  // Handle search input change
  const handleInputChange = (e) => {
    setKeyword(e.target.value);
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (keyword.trim()) {
      // Update URL with search query
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('keyword', keyword);
      searchParams.set('page', 1); // Reset to first page on new search
      
      // Navigate to products page with search query
      history.push({
        pathname: '/products',
        search: searchParams.toString(),
      });
      
      // Dispatch search action
      dispatch(searchProducts(keyword));
    } else {
      // If search is empty, remove keyword from URL and show all products
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('keyword');
      
      history.push({
        pathname: '/products',
        search: searchParams.toString(),
      });
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setKeyword('');
    
    // Remove keyword from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('keyword');
    
    history.push({
      pathname: '/products',
      search: searchParams.toString(),
    });
  };

  // Handle filter removal
  const handleRemoveFilter = (filterType) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(filterType);
    
    history.push({
      pathname: '/products',
      search: searchParams.toString(),
    });
  };

  return (
    <div className={classes.searchContainer}>
      <Typography variant="h6" className={classes.searchTitle}>
        Search Products
      </Typography>
      
      <Paper component="form" className={classes.root} onSubmit={handleSearch}>
        <InputBase
          className={classes.input}
          placeholder="Search for fresh produce, dairy, meat..."
          inputProps={{ 'aria-label': 'search products' }}
          value={keyword}
          onChange={handleInputChange}
        />
        
        {keyword && (
          <IconButton
            className={classes.iconButton}
            aria-label="clear search"
            onClick={handleClearSearch}
          >
            <Clear />
          </IconButton>
        )}
        
        <Divider className={classes.divider} orientation="vertical" />
        
        <IconButton
          color="primary"
          className={classes.iconButton}
          aria-label="search"
          onClick={handleSearch}
          type="submit"
        >
          <Search />
        </IconButton>
        
        <Divider className={classes.divider} orientation="vertical" />
        
        <IconButton
          className={classes.iconButton}
          aria-label="filters"
          onClick={onFilterToggle}
          color={activeFilters.length > 0 ? 'primary' : 'default'}
        >
          <FilterList />
        </IconButton>
      </Paper>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <Box className={classes.activeFilters}>
          <Typography variant="body2" style={{ marginRight: '8px' }}>
            Active filters:
          </Typography>
          
          {activeFilters.map((filter) => (
            <Chip
              key={filter.type}
              label={filter.label}
              onDelete={() => handleRemoveFilter(filter.type)}
              className={classes.filterChip}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </div>
  );
};

export default ProductSearch;