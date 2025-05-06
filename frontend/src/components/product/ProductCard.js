import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  Rating,
  Chip,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@material-ui/icons';

// Redux actions
// import { addToCart } from '../../redux/actions/cartActions';
// import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlistActions';

// Placeholder image
const placeholderImage = 'https://via.placeholder.com/300x200?text=Farm2Fork';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
  },
  media: {
    height: 200,
    backgroundSize: 'cover',
  },
  content: {
    flexGrow: 1,
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
  },
  ratingCount: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  categoryChip: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  actions: {
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
  },
  seller: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  stockStatus: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
  },
  inStock: {
    color: theme.palette.success.main,
  },
  outOfStock: {
    color: theme.palette.error.main,
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 'bold',
  },
  organicBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
}));

const ProductCard = ({ product }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  
  // Redux state
  // const { wishlist } = useSelector((state) => state.wishlist);
  // const isInWishlist = wishlist.some((item) => item.product === product._id);
  const isInWishlist = false; // Placeholder until wishlist is implemented

  // Calculate discount percentage
  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Handle add to cart
  const handleAddToCart = () => {
    // dispatch(addToCart(product._id, 1));
    console.log('Add to cart:', product._id);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    // if (isInWishlist) {
    //   dispatch(removeFromWishlist(product._id));
    // } else {
    //   dispatch(addToWishlist(product._id));
    // }
    console.log('Toggle wishlist:', product._id);
  };

  return (
    <Card className={classes.root}>
      {/* Discount badge */}
      {discountPercentage > 0 && (
        <Chip
          label={`-${discountPercentage}%`}
          size="small"
          className={classes.discountBadge}
        />
      )}

      {/* Organic badge */}
      {product.isOrganic && (
        <Chip
          label="Organic"
          size="small"
          className={classes.organicBadge}
        />
      )}

      <CardActionArea component={RouterLink} to={`/products/${product._id}`}>
        <CardMedia
          className={classes.media}
          image={product.image || placeholderImage}
          title={product.name}
        />
        <CardContent className={classes.content}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" component="p" noWrap>
            {product.description}
          </Typography>
          
          <Box className={classes.ratingContainer}>
            <Rating
              name={`rating-${product._id}`}
              value={product.rating || 0}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography className={classes.ratingCount}>
              ({product.numReviews || 0})
            </Typography>
          </Box>
          
          <Typography className={classes.price} variant="h6" component="p">
            ${product.salePrice || product.price}
            {product.salePrice && (
              <Typography
                component="span"
                variant="body2"
                className={classes.originalPrice}
              >
                ${product.price}
              </Typography>
            )}
          </Typography>
          
          {product.category && (
            <Chip
              label={product.category}
              size="small"
              className={classes.categoryChip}
            />
          )}
          
          <Typography className={classes.seller} variant="body2">
            Sold by: {product.seller?.farmName || 'Farm2Fork Seller'}
          </Typography>
          
          <Typography
            className={`${classes.stockStatus} ${
              product.countInStock > 0 ? classes.inStock : classes.outOfStock
            }`}
            variant="body2"
          >
            {product.countInStock > 0
              ? `In Stock (${product.countInStock})`
              : 'Out of Stock'}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      <CardActions className={classes.actions}>
        <Button
          size="small"
          color="primary"
          component={RouterLink}
          to={`/products/${product._id}`}
        >
          View Details
        </Button>
        
        <Box>
          <Tooltip title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
            <IconButton
              aria-label="add to wishlist"
              onClick={handleWishlistToggle}
              color={isInWishlist ? 'secondary' : 'default'}
              size="small"
            >
              {isInWishlist ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add to Cart">
            <IconButton
              aria-label="add to cart"
              onClick={handleAddToCart}
              color="primary"
              size="small"
              disabled={product.countInStock <= 0}
            >
              <AddShoppingCart />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProductCard;