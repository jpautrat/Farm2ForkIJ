import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  ButtonGroup,
  Button,
  IconButton,
  TextField,
  Box,
  Chip,
  Divider,
  Link,
} from '@material-ui/core';
import {
  Add,
  Remove,
  Delete,
  Eco,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Redux actions
import { updateCartItemQuantity, removeFromCart } from '../../redux/actions/cartActions';

// Placeholder image
const placeholderImage = 'https://via.placeholder.com/100x100?text=Farm2Fork';

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
  },
  price: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    '& input': {
      textAlign: 'center',
    },
  },
  removeButton: {
    marginLeft: 'auto',
  },
  subtotal: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  organicChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  sellerInfo: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  outOfStock: {
    color: theme.palette.error.main,
    fontWeight: 'bold',
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  mobileControls: {
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      '& > *': {
        marginBottom: theme.spacing(1),
      },
    },
  },
}));

const CartItem = ({ item }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= item.countInStock) {
      dispatch(updateCartItemQuantity(item.product, value));
    }
  };

  // Handle increment quantity
  const handleIncrementQuantity = () => {
    if (item.quantity < item.countInStock) {
      dispatch(updateCartItemQuantity(item.product, item.quantity + 1));
    }
  };

  // Handle decrement quantity
  const handleDecrementQuantity = () => {
    if (item.quantity > 1) {
      dispatch(updateCartItemQuantity(item.product, item.quantity - 1));
    }
  };

  // Handle remove item
  const handleRemoveItem = () => {
    dispatch(removeFromCart(item.product));
  };

  // Calculate item subtotal
  const subtotal = item.price * item.quantity;

  return (
    <Paper className={classes.root} elevation={1}>
      <Grid container spacing={2}>
        {/* Product Image */}
        <Grid item xs={4} sm={2}>
          <Link component={RouterLink} to={`/products/${item.product}`}>
            <img
              src={item.image || placeholderImage}
              alt={item.name}
              className={classes.image}
            />
          </Link>
        </Grid>

        {/* Product Info */}
        <Grid item xs={8} sm={4} className={classes.productInfo}>
          <div>
            <Link
              component={RouterLink}
              to={`/products/${item.product}`}
              color="inherit"
              underline="hover"
            >
              <Typography variant="h6" className={classes.productName}>
                {item.name}
              </Typography>
            </Link>

            {item.isOrganic && (
              <Chip
                icon={<Eco />}
                label="Organic"
                size="small"
                className={classes.organicChip}
              />
            )}

            {item.seller && (
              <Typography variant="body2" className={classes.sellerInfo}>
                Sold by: {item.seller.name}
              </Typography>
            )}
          </div>

          {/* Mobile Price (visible on xs screens) */}
          <Box display={{ xs: 'block', sm: 'none' }}>
            <Typography variant="h6" className={classes.price}>
              ${item.price.toFixed(2)}
              {item.originalPrice > item.price && (
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.originalPrice}
                >
                  ${item.originalPrice.toFixed(2)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Grid>

        {/* Price (hidden on xs screens) */}
        <Grid item xs={12} sm={2} style={{ display: 'flex', alignItems: 'center' }}>
          <Box display={{ xs: 'none', sm: 'block' }}>
            <Typography variant="h6" className={classes.price}>
              ${item.price.toFixed(2)}
              {item.originalPrice > item.price && (
                <Typography
                  component="span"
                  variant="body2"
                  className={classes.originalPrice}
                >
                  ${item.originalPrice.toFixed(2)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Grid>

        {/* Quantity Controls */}
        <Grid item xs={6} sm={2} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={classes.quantityControl}>
            <ButtonGroup size="small">
              <Button
                onClick={handleDecrementQuantity}
                disabled={item.quantity <= 1}
              >
                <Remove fontSize="small" />
              </Button>
              <TextField
                className={classes.quantityInput}
                value={item.quantity}
                onChange={handleQuantityChange}
                type="number"
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: item.countInStock,
                  },
                }}
                variant="outlined"
                size="small"
              />
              <Button
                onClick={handleIncrementQuantity}
                disabled={item.quantity >= item.countInStock}
              >
                <Add fontSize="small" />
              </Button>
            </ButtonGroup>
          </div>
        </Grid>

        {/* Subtotal and Remove Button */}
        <Grid item xs={6} sm={2} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <Typography variant="h6" className={classes.subtotal}>
              ${subtotal.toFixed(2)}
            </Typography>
            <Box display="flex" justifyContent="flex-end">
              <IconButton
                aria-label="remove item"
                onClick={handleRemoveItem}
                size="small"
                color="secondary"
              >
                <Delete />
              </IconButton>
            </Box>
          </div>
        </Grid>
      </Grid>

      {/* Stock Warning */}
      {item.countInStock <= 5 && (
        <>
          <Divider className={classes.divider} />
          <Typography variant="body2" className={classes.outOfStock}>
            {item.countInStock === 0
              ? 'Out of stock'
              : `Only ${item.countInStock} left in stock`}
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default CartItem;