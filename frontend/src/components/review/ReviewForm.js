import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  Paper, 
  Alert, 
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Star } from '@mui/icons-material';
import axios from 'axios';

// Mock API call - replace with actual API call in production
const submitReview = async (token, productId, reviewData) => {
  // In a real app, this would be an API call
  // return await axios.post('/api/reviews', 
  //   { productId, ...reviewData },
  //   { headers: { Authorization: `Bearer ${token}` } }
  // );
  
  // For now, return mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          _id: `rev_${Date.now()}`,
          product_id: productId,
          rating: reviewData.rating,
          review_text: reviewData.reviewText,
          status: 'pending',
          created_at: new Date()
        }
      });
    }, 1000);
  });
};

// Mock API call to check if user has purchased the product
const checkPurchaseStatus = async (token, productId) => {
  // In a real app, this would be an API call
  // return await axios.get(`/api/reviews/check-purchase/${productId}`, {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  
  // For now, return mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          hasPurchased: true,
          hasReviewed: false
        }
      });
    }, 500);
  });
};

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState({
    loading: true,
    hasPurchased: false,
    hasReviewed: false
  });
  
  useEffect(() => {
    // Check if user is authenticated
    if (!userInfo) {
      return;
    }
    
    const checkPurchase = async () => {
      try {
        const response = await checkPurchaseStatus(userInfo.token, productId);
        setPurchaseStatus({
          loading: false,
          hasPurchased: response.data.hasPurchased,
          hasReviewed: response.data.hasReviewed
        });
      } catch (err) {
        console.error('Error checking purchase status:', err);
        setPurchaseStatus({
          loading: false,
          hasPurchased: false,
          hasReviewed: false,
          error: 'Failed to verify purchase status'
        });
      }
    };
    
    checkPurchase();
  }, [userInfo, productId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (reviewText.trim().length < 10) {
      setError('Review text must be at least 10 characters long');
      return;
    }
    
    // Check if user is authenticated
    if (!userInfo) {
      navigate('/login', { state: { from: `/products/${productId}` } });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await submitReview(userInfo.token, productId, {
        rating,
        reviewText
      });
      
      setSuccess(true);
      setRating(0);
      setReviewText('');
      
      // Call the callback function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  // If purchase status is loading, show loading indicator
  if (purchaseStatus.loading) {
    return (
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }
  
  // If user hasn't purchased the product, show message
  if (!purchaseStatus.hasPurchased) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Alert severity="info">
          You need to purchase this product before you can review it.
        </Alert>
      </Paper>
    );
  }
  
  // If user has already reviewed the product, show message
  if (purchaseStatus.hasReviewed) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Alert severity="info">
          You have already reviewed this product. Thank you for your feedback!
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={1}
            size="large"
            emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
        </Box>
        
        <TextField
          label="Your Review"
          multiline
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Share your experience with this product..."
          sx={{ mb: 2 }}
          required
          inputProps={{ minLength: 10 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your review has been submitted successfully! It will be visible after moderation.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReviewForm;