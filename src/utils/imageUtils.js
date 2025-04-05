// src/utils/imageUtils.js

/**
 * Utility function to get the full URL for worker profile images
 * @param {string} imagePath - The image filename or path stored in the database
 * @returns {string|null} - The complete URL to the image, or null if no image provided
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `https://task-tracker-backend-2jqf.onrender.com/uploads/${imagePath}`;
  };