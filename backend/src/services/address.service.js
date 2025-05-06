const Address = require('../models/address.model');

/**
 * Address service
 * Handles address-related business logic
 */
class AddressService {
  /**
   * Get all addresses for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of addresses
   */
  async getUserAddresses(userId) {
    return await Address.find({ user_id: userId }).sort({ is_default: -1, created_at: -1 });
  }

  /**
   * Get address by ID
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - Address object
   */
  async getAddressById(addressId) {
    return await Address.findById(addressId);
  }

  /**
   * Create a new address
   * @param {string} userId - User ID
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} - Created address object
   */
  async createAddress(userId, addressData) {
    // Check if this is the first address of this type for the user
    const existingAddresses = await Address.find({ 
      user_id: userId, 
      address_type: addressData.addressType 
    });
    
    // If it's the first address of this type, set it as default
    const isDefault = existingAddresses.length === 0 ? true : addressData.isDefault || false;
    
    const address = new Address({
      user_id: userId,
      address_type: addressData.addressType,
      street_address: addressData.streetAddress,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      country: addressData.country,
      is_default: isDefault
    });
    
    return await address.save();
  }

  /**
   * Update an address
   * @param {string} addressId - Address ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated address object
   */
  async updateAddress(addressId, updateData) {
    // Only allow certain fields to be updated
    const allowedUpdates = {
      address_type: updateData.addressType,
      street_address: updateData.streetAddress,
      city: updateData.city,
      state: updateData.state,
      postal_code: updateData.postalCode,
      country: updateData.country,
      is_default: updateData.isDefault
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    return await Address.findByIdAndUpdate(
      addressId,
      allowedUpdates,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete an address
   * @param {string} addressId - Address ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAddress(addressId) {
    const result = await Address.findByIdAndDelete(addressId);
    return !!result;
  }

  /**
   * Set an address as default
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - Updated address object
   */
  async setDefaultAddress(addressId) {
    const address = await Address.findById(addressId);
    
    if (!address) {
      throw new Error('Address not found');
    }
    
    address.is_default = true;
    return await address.save();
  }

  /**
   * Check if address belongs to user
   * @param {string} addressId - Address ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if address belongs to user
   */
  async isAddressOwnedByUser(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, user_id: userId });
    return !!address;
  }
}

module.exports = new AddressService();