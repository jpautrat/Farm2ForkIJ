import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Typography,
  Slider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore, FilterList, Clear } from '@material-ui/icons';
import Rating from '@material-ui/lab/Rating';

// Redux actions
import { listProductCategories, filterProducts } from '../../redux/actions/productActions';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '100%',
  },
  filterSection: {
    marginBottom: theme.spacing(2),
  },
  filterTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  priceRangeContainer: {
    padding: theme.spacing(0, 2),
  },
  priceInputs: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  priceInput: {
    width: '45%',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  ratingLabel: {
    marginLeft: theme.spacing(1),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  accordionRoot: {
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  accordionSummary: {
    padding: 0,
    minHeight: 'auto',
    '&.Mui-expanded': {
      minHeight: 'auto',
    },
  },
  accordionDetails: {
    padding: theme.spacing(1, 0),
    display: 'block',
  },
  expandIcon: {
    padding: 0,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
}));

const ProductFilter = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Get query params
  const query = new URLSearchParams(location.search);
  const categoryFromUrl = query.get('category') || '';
  const minPriceFromUrl = query.get('minPrice') || 0;
  const maxPriceFromUrl = query.get('maxPrice') || 1000;
  const ratingFromUrl = query.get('rating') || 0;
  const sortByFromUrl = query.get('sortBy') || 'newest';
  const organicFromUrl = query.get('organic') === 'true';

  // Component state
  const [priceRange, setPriceRange] = useState([
    parseInt(minPriceFromUrl),
    parseInt(maxPriceFromUrl),
  ]);
  const [selectedCategories, setSelectedCategories] = useState(
    categoryFromUrl ? [categoryFromUrl] : []
  );
  const [selectedRating, setSelectedRating] = useState(parseInt(ratingFromUrl));
  const [sortBy, setSortBy] = useState(sortByFromUrl);
  const [organicOnly, setOrganicOnly] = useState(organicFromUrl);
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    rating: true,
    sort: true,
    other: true,
  });

  // Redux state
  const { loading, categories } = useSelector((state) => state.productCategoryList);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    const currentIndex = selectedCategories.indexOf(category);
    const newSelectedCategories = [...selectedCategories];

    if (currentIndex === -1) {
      newSelectedCategories.push(category);
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }

    setSelectedCategories(newSelectedCategories);
  };

  // Handle rating selection
  const handleRatingChange = (event) => {
    setSelectedRating(parseInt(event.target.value));
  };

  // Handle sort by change
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };

  // Handle organic only toggle
  const handleOrganicChange = (event) => {
    setOrganicOnly(event.target.checked);
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
  };

  // Apply filters
  const applyFilters = () => {
    const searchParams = new URLSearchParams(location.search);
    
    // Update URL with filter parameters
    if (selectedCategories.length > 0) {
      searchParams.set('category', selectedCategories.join(','));
    } else {
      searchParams.delete('category');
    }
    
    searchParams.set('minPrice', priceRange[0]);
    searchParams.set('maxPrice', priceRange[1]);
    
    if (selectedRating > 0) {
      searchParams.set('rating', selectedRating);
    } else {
      searchParams.delete('rating');
    }
    
    searchParams.set('sortBy', sortBy);
    
    if (organicOnly) {
      searchParams.set('organic', 'true');
    } else {
      searchParams.delete('organic');
    }
    
    // Reset to first page when applying new filters
    searchParams.set('page', 1);
    
    // Navigate to products page with filters
    history.push({
      pathname: '/products',
      search: searchParams.toString(),
    });
    
    // Dispatch filter action
    dispatch(
      filterProducts({
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : null,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: selectedRating > 0 ? selectedRating : null,
        sortBy,
        organic: organicOnly ? true : null,
      })
    );
  };

  // Reset filters
  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedRating(0);
    setSortBy('newest');
    setOrganicOnly(false);
    
    // Remove filter parameters from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('category');
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    searchParams.delete('rating');
    searchParams.delete('sortBy');
    searchParams.delete('organic');
    
    // Keep search keyword if present
    const keyword = searchParams.get('keyword');
    if (keyword) {
      searchParams.set('keyword', keyword);
    }
    
    // Reset to first page
    searchParams.set('page', 1);
    
    // Navigate to products page without filters
    history.push({
      pathname: '/products',
      search: searchParams.toString(),
    });
  };

  return (
    <div className={classes.root}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" className={classes.filterTitle}>
          <FilterList style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Filter Products
        </Typography>
        <Button
          startIcon={<Clear />}
          size="small"
          onClick={resetFilters}
          color="secondary"
        >
          Reset
        </Button>
      </Box>

      {/* Categories */}
      <Accordion
        expanded={expanded.categories}
        onChange={handleAccordionChange('categories')}
        className={classes.accordionRoot}
      >
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandIcon} />}
          className={classes.accordionSummary}
        >
          <Typography className={classes.heading}>Categories</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress size={24} />
            </div>
          ) : categories && categories.length > 0 ? (
            <FormControl component="fieldset" className={classes.formControl}>
              <FormGroup>
                {categories.map((category) => (
                  <FormControlLabel
                    key={category._id}
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => handleCategoryChange(category.name)}
                        color="primary"
                      />
                    }
                    label={`${category.name} (${category.count || 0})`}
                  />
                ))}
              </FormGroup>
            </FormControl>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No categories available
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />

      {/* Price Range */}
      <Accordion
        expanded={expanded.price}
        onChange={handleAccordionChange('price')}
        className={classes.accordionRoot}
      >
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandIcon} />}
          className={classes.accordionSummary}
        >
          <Typography className={classes.heading}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <div className={classes.priceRangeContainer}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              aria-labelledby="price-range-slider"
              min={0}
              max={1000}
              color="primary"
            />
            <div className={classes.priceInputs}>
              <Typography variant="body2">
                ${priceRange[0]} - ${priceRange[1]}
              </Typography>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />

      {/* Rating */}
      <Accordion
        expanded={expanded.rating}
        onChange={handleAccordionChange('rating')}
        className={classes.accordionRoot}
      >
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandIcon} />}
          className={classes.accordionSummary}
        >
          <Typography className={classes.heading}>Rating</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <FormControl component="fieldset" className={classes.formControl}>
            <RadioGroup
              aria-label="rating"
              name="rating"
              value={selectedRating.toString()}
              onChange={handleRatingChange}
            >
              {[4, 3, 2, 1].map((rating) => (
                <FormControlLabel
                  key={rating}
                  value={rating.toString()}
                  control={<Radio color="primary" />}
                  label={
                    <div className={classes.ratingContainer}>
                      <Rating value={rating} readOnly size="small" />
                      <Typography variant="body2" className={classes.ratingLabel}>
                        & Up
                      </Typography>
                    </div>
                  }
                />
              ))}
              <FormControlLabel
                value="0"
                control={<Radio color="primary" />}
                label="Any Rating"
              />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />

      {/* Sort By */}
      <Accordion
        expanded={expanded.sort}
        onChange={handleAccordionChange('sort')}
        className={classes.accordionRoot}
      >
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandIcon} />}
          className={classes.accordionSummary}
        >
          <Typography className={classes.heading}>Sort By</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <FormControl component="fieldset" className={classes.formControl}>
            <RadioGroup
              aria-label="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={handleSortByChange}
            >
              <FormControlLabel
                value="newest"
                control={<Radio color="primary" />}
                label="Newest Arrivals"
              />
              <FormControlLabel
                value="price-low"
                control={<Radio color="primary" />}
                label="Price: Low to High"
              />
              <FormControlLabel
                value="price-high"
                control={<Radio color="primary" />}
                label="Price: High to Low"
              />
              <FormControlLabel
                value="rating"
                control={<Radio color="primary" />}
                label="Highest Rated"
              />
              <FormControlLabel
                value="popularity"
                control={<Radio color="primary" />}
                label="Most Popular"
              />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />

      {/* Other Filters */}
      <Accordion
        expanded={expanded.other}
        onChange={handleAccordionChange('other')}
        className={classes.accordionRoot}
      >
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandIcon} />}
          className={classes.accordionSummary}
        >
          <Typography className={classes.heading}>Other Filters</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={organicOnly}
                    onChange={handleOrganicChange}
                    color="primary"
                  />
                }
                label="Organic Products Only"
              />
              {/* Add more filters as needed */}
            </FormGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Divider className={classes.divider} />

      {/* Apply Filters Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default ProductFilter;