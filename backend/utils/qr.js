const QRCode = require('qrcode');

/**
 * Generate QR code for a lecture
 * @param {Object} lectureData - Lecture data to encode in QR
 * @returns {Promise<String>} - Base64 encoded QR code image
 */
const generateQRCode = async (lectureData) => {
  try {
    // Create a unique payload with lecture ID and timestamp
    const payload = {
      lectureId: lectureData._id.toString(),
      subject: lectureData.subject,
      course: lectureData.course,
      faculty: lectureData.faculty.toString(),
      startTime: lectureData.startTime,
      endTime: lectureData.endTime,
      timestamp: new Date().toISOString(),
    };

    // Convert payload to JSON string
    const stringData = JSON.stringify(payload);
    
    // Generate QR code as base64 string
    const qrCodeImage = await QRCode.toDataURL(stringData);
    
    return qrCodeImage;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify QR code data
 * @param {Object} qrData - Decoded QR code data
 * @returns {Boolean} - Whether QR code is valid
 */
const verifyQRCode = (qrData) => {
  try {
    // Check if QR code has required fields
    if (!qrData.lectureId || !qrData.startTime || !qrData.endTime) {
      return false;
    }

    // Check if QR code is expired
    const now = new Date();
    const endTime = new Date(qrData.endTime);
    
    if (now > endTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return false;
  }
};

module.exports = {
  generateQRCode,
  verifyQRCode,
};