/**
 * Simple media upload without Cloudinary
 * Converts images to base64 data URLs (for testing/demo)
 * 
 * NOTE: This is NOT recommended for production as:
 * - Data URLs are large and slow
 * - No CDN benefits
 * - Stored in memory/database
 * 
 * Use Cloudinary for production!
 */

export const uploadMediaSimple = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Convert to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    // Determine media type
    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    console.log(`[Media] Uploaded by ${req.user.name} (${req.file.size} bytes)`);

    res.json({
      url: dataUrl,
      type,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('[Media] Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
};
