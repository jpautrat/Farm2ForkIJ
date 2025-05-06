const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const shippingController = require('../controllers/shipping.controller');
const { authMiddleware, sellerMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/shipping/rates
 * @desc    Get shipping rates for a package
 * @permission  Private
 */
router.post(
  '/rates',
  [
    authMiddleware,
    [
      check('origin', 'Origin address is required').not().isEmpty(),
      check('destination', 'Destination address is required').not().isEmpty(),
      check('parcel', 'Parcel information is required').not().isEmpty(),
      check('parcel.weight', 'Parcel weight is required').isNumeric(),
      check('parcel.distance_unit', 'Distance unit is required').optional(),
      check('parcel.mass_unit', 'Mass unit is required').optional()
    ]
  ],
  shippingController.getShippingRates
);

/**
 * @route   POST /api/shipping/validate-address
 * @desc    Validate a shipping address
 * @permission  Private
 */
router.post(
  '/validate-address',
  [
    authMiddleware,
    [
      check('address', 'Address is required').not().isEmpty(),
      check('address.street1', 'Street address is required').not().isEmpty(),
      check('address.city', 'City is required').not().isEmpty(),
      check('address.state', 'State is required').not().isEmpty(),
      check('address.zip', 'ZIP code is required').not().isEmpty(),
      check('address.country', 'Country is required').not().isEmpty()
    ]
  ],
  shippingController.validateAddress
);

/**
 * @route   POST /api/shipping/create-label
 * @desc    Create a shipping label
 * @permission  Private (Seller)
 */
router.post(
  '/create-label',
  [
    authMiddleware,
    sellerMiddleware,
    [
      check('orderId', 'Order ID is required').not().isEmpty(),
      check('rateId', 'Rate ID is required').not().isEmpty()
    ]
  ],
  shippingController.createShippingLabel
);

/**
 * @route   GET /api/shipping/labels/:id
 * @desc    Get shipping label by ID
 * @permission  Private
 */
router.get('/labels/:id', authMiddleware, shippingController.getShippingLabel);

/**
 * @route   GET /api/shipping/labels/order/:orderId
 * @desc    Get shipping labels for an order
 * @permission  Private
 */
router.get('/labels/order/:orderId', authMiddleware, shippingController.getShippingLabelsByOrder);

/**
 * @route   GET /api/shipping/tracking/:id
 * @desc    Get tracking information for a shipment
 * @permission  Private
 */
router.get('/tracking/:id', authMiddleware, shippingController.getTrackingInfo);

/**
 * @route   POST /api/shipping/tracking/webhook
 * @desc    Handle shipping tracking webhooks
 * @permission  Public
 */
router.post('/tracking/webhook', shippingController.handleTrackingWebhook);

/**
 * @route   GET /api/shipping/carriers
 * @desc    Get list of available shipping carriers
 * @permission  Private
 */
router.get('/carriers', authMiddleware, shippingController.getCarriers);

/**
 * @route   GET /api/shipping/seller/shipments
 * @desc    Get all shipments for a seller
 * @permission  Private (Seller)
 */
router.get('/seller/shipments', [authMiddleware, sellerMiddleware], shippingController.getSellerShipments);

/**
 * @route   GET /api/shipping/admin/shipments
 * @desc    Get all shipments (admin)
 * @permission  Admin
 */
router.get('/admin/shipments', [authMiddleware, adminMiddleware], shippingController.getAllShipments);

/**
 * @route   POST /api/shipping/return
 * @desc    Create a return label
 * @permission  Private
 */
router.post(
  '/return',
  [
    authMiddleware,
    [
      check('orderId', 'Order ID is required').not().isEmpty(),
      check('reason', 'Return reason is required').not().isEmpty()
    ]
  ],
  shippingController.createReturnLabel
);

module.exports = router;