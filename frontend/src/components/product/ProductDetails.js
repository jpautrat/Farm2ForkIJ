import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  CircularProgress,
  TextField,
  Rating,
  Chip,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  IconButton,
  Alert,
} from '@material-ui/core';
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  LocalShipping,
  Eco,
  Store,
  VerifiedUser,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Redux actions
import { getProductDetails, createProductReview } from '../../redux/actions/productActions';
import { PRODUCT_REVIEW_CREATE_RESET } from '../../redux/constants/productConstants';

// Placeholder image
const placeholderImage = 'https://via.placeholder.com/600x400?text=Farm2Fork';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  breadcrumbs: {
    marginBottom: theme.spacing(2),
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
  productImage: {
    width: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  thumbnailContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  thumbnail: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    border: `2px solid transparent`,
    '&.active': {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
  productInfo: {
    padding: theme.spacing(3),
  },
  price: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  ratingCount: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  categoryChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  organicChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  quantityInput: {
    width: 80,
    marginRight: theme.spacing(2),
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  addToCartButton: {
    flex: 1,
  },
  wishlistButton: {
    marginLeft: theme.spacing(1),
  },
  tabsContainer: {
    marginTop: theme.spacing(4),
  },
  tabContent: {
    padding: theme.spacing(3),
  },
  reviewForm: {
    marginTop: theme.spacing(3),
  },
  submitReviewButton: {
    marginTop: theme.spacing(2),
  },
  reviewItem: {
    marginBottom: theme.spacing(3),
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  sellerInfo: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  sellerName: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  sellerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  featureIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.success.main,
  },
  stockStatus: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  inStock: {
    color: theme.palette.success.main,
  },
  outOfStock: {
    color: theme.palette.error.main,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  errorContainer: {
    marginBottom: theme.spacing(4),
  },
}));

// Tab Panel
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const ProductDetails = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  // Component state
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false); // Placeholder until wishlist is implemented

  // Redux state
  const { loading, error, product } = useSelector((state) => state.productDetails);
  const { userInfo } = useSelector((state) => state.auth);
  const {
    loading: loadingReview,
    error: errorReview,
    success: successReview,
  } = useSelector((state) => state.productReviewCreate);

  // Fetch product details on component mount
  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  // Reset review form after successful submission
  useEffect(() => {
    if (successReview) {
      setRating(0);
      setComment('');
      dispatch({ type: PRODUCT_REVIEW_CREATE_RESET });
      dispatch(getProductDetails(id));
    }
  }, [dispatch, id, successReview]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.countInStock) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // dispatch(addToCart(id, quantity));
    // history.push('/cart');
    console.log('Add to cart:', id, quantity);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    // if (isInWishlist) {
    //   dispatch(removeFromWishlist(id));
    // } else {
    //   dispatch(addToWishlist(id));
    // }
    setIsInWishlist(!isInWishlist);
    console.log('Toggle wishlist:', id);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle review submit
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(id, {
        rating,
        comment,
      })
    );
  };

  // Handle go back
  const handleGoBack = () => {
    history.goBack();
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate discount percentage
  const calculateDiscountPercentage = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.root}>
        <Alert 
          severity="error" 
          className={classes.errorContainer}
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(getProductDetails(id))}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          className={classes.backButton}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!product || !product._id) {
    return (
      <Container className={classes.root}>
        <Alert severity="info">Product not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          className={classes.backButton}
          style={{ marginTop: '16px' }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // Product images array (use product.images if available, otherwise use placeholder)
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || placeholderImage];

  return (
    <Container className={classes.root}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumbs}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/products" color="inherit">
          Products
        </Link>
        {product.category && (
          <Link
            component={RouterLink}
            to={`/products?category=${product.category}`}
            color="inherit"
          >
            {product.category}
          </Link>
        )}
        <Typography color="textPrimary">{product.name}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={handleGoBack}
        className={classes.backButton}
      >
        Go Back
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <img
            src={productImages[selectedImage]}
            alt={product.name}
            className={classes.productImage}
          />
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className={classes.thumbnailContainer}>
              {productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - thumbnail ${index + 1}`}
                  className={`${classes.thumbnail} ${
                    selectedImage === index ? 'active' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.productInfo}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box className={classes.ratingContainer}>
              <Rating
                name="product-rating"
                value={product.rating || 0}
                precision={0.5}
                readOnly
              />
              <Typography className={classes.ratingCount}>
                ({product.numReviews || 0} reviews)
              </Typography>
            </Box>

            {/* Categories and Tags */}
            <Box mb={2}>
              {product.category && (
                <Chip
                  label={product.category}
                  size="small"
                  className={classes.categoryChip}
                />
              )}
              
              {product.isOrganic && (
                <Chip
                  icon={<Eco />}
                  label="Organic"
                  size="small"
                  className={classes.organicChip}
                />
              )}
            </Box>

            {/* Price */}
            <Typography variant="h5" className={classes.price}>
              ${product.salePrice || product.price}
              {product.salePrice && product.price && (
                <>
                  <Typography
                    component="span"
                    variant="body1"
                    className={classes.originalPrice}
                  >
                    ${product.price}
                  </Typography>
                  <Chip
                    label={`Save ${calculateDiscountPercentage(
                      product.price,
                      product.salePrice
                    )}%`}
                    size="small"
                    color="secondary"
                    style={{ marginLeft: '8px' }}
                  />
                </>
              )}
            </Typography>

            {/* Stock Status */}
            <Typography
              className={`${classes.stockStatus} ${
                product.countInStock > 0 ? classes.inStock : classes.outOfStock
              }`}
            >
              {product.countInStock > 0
                ? `In Stock (${product.countInStock} available)`
                : 'Out of Stock'}
            </Typography>

            <Divider className={classes.divider} />

            {/* Short Description */}
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider className={classes.divider} />

            {/* Quantity Selector */}
            {product.countInStock > 0 && (
              <div className={classes.quantityContainer}>
                <TextField
                  label="Quantity"
                  type="number"
                  InputProps={{ inputProps: { min: 1, max: product.countInStock } }}
                  value={quantity}
                  onChange={handleQuantityChange}
                  variant="outlined"
                  size="small"
                  className={classes.quantityInput}
                />
                <Typography variant="body2" color="textSecondary">
                  {product.countInStock} available
                </Typography>
              </div>
            )}

            {/* Action Buttons */}
            <div className={classes.actionButtons}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.countInStock <= 0}
                className={classes.addToCartButton}
              >
                {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <IconButton
                aria-label="add to wishlist"
                onClick={handleWishlistToggle}
                color={isInWishlist ? 'secondary' : 'default'}
                className={classes.wishlistButton}
              >
                {isInWishlist ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className={classes.sellerInfo}>
                <Typography variant="h6" className={classes.sellerName}>
                  <Store className={classes.sellerIcon} />
                  Sold by: {product.seller.farmName || 'Farm2Fork Seller'}
                </Typography>
                
                <div className={classes.featureItem}>
                  <LocalShipping className={classes.featureIcon} />
                  <Typography variant="body2">
                    Shipping from {product.seller.location || 'Local Farm'}
                  </Typography>
                </div>
                
                <div className={classes.featureItem}>
                  <VerifiedUser className={classes.featureIcon} />
                  <Typography variant="body2">
                    Verified Farm2Fork Seller
                  </Typography>
                </div>
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Details, Reviews, etc. */}
      <Paper className={classes.tabsContainer}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Product Details" />
          <Tab label="Reviews" />
          <Tab label="Shipping & Returns" />
        </Tabs>

        {/* Product Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Product Description
          </Typography>
          <Typography variant="body1" paragraph>
            {product.detailedDescription || product.description}
          </Typography>
          
          {product.specifications && (
            <>
              <Typography variant="h6" gutterBottom>
                Specifications
              </Typography>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <Typography variant="body1">
                      <strong>{key}:</strong> {value}
                    </Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Customer Reviews
          </Typography>

          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <Paper key={review._id} className={classes.reviewItem} elevation={0} variant="outlined">
                <div className={classes.reviewHeader}>
                  <Typography variant="subtitle1" component="h3">
                    {review.name}
                  </Typography>
                  <Typography variant="body2" className={classes.reviewDate}>
                    {formatDate(review.createdAt)}
                  </Typography>
                </div>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body1" paragraph>
                  {review.comment}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No reviews yet. Be the first to review this product!
            </Typography>
          )}

          <Divider className={classes.divider} />

          {userInfo ? (
            <div className={classes.reviewForm}>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              
              {errorReview && (
                <Alert severity="error" style={{ marginBottom: '16px' }}>
                  {errorReview}
                </Alert>
              )}
              
              <form onSubmit={handleReviewSubmit}>
                <Box mb={2}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    name="rating"
                    value={rating}
                    onChange={(event, newValue) => {
                      setRating(newValue);
                    }}
                  />
                </Box>
                
                <TextField
                  label="Review"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submitReviewButton}
                  disabled={loadingReview}
                >
                  {loadingReview ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
              </form>
            </div>
          ) : (
            <Alert severity="info">
              Please{' '}
              <Link component={RouterLink} to="/login">
                sign in
              </Link>{' '}
              to write a review.
            </Alert>
          )}
        </TabPanel>

        {/* Shipping & Returns Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Shipping Information
          </Typography>
          <Typography variant="body1" paragraph>
            We ship all products directly from the farm to ensure maximum freshness. Shipping times vary depending on your location and the seller's location.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Return Policy
          </Typography>
          <Typography variant="body1" paragraph>
            If you're not satisfied with your purchase, please contact us within 24 hours of receiving your order. Due to the perishable nature of our products, we handle returns on a case-by-case basis.
          </Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProductDetails;