import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * Upload media file (image)
 * POST /api/media/upload
 */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    let url;

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_API_SECRET && 
                          process.env.CLOUDINARY_API_SECRET !== 'your-api-secret-here';

    if (useCloudinary) {
      // Upload to Cloudinary
      console.log('[Media] Uploading to Cloudinary...');
      url = await uploadToCloudinary(req.file.buffer, `ephemeral-rooms/${roomId}`);
    } else {
      // Fallback: Convert to base64 data URL (for testing only)
      console.log('[Media] Using base64 fallback (Cloudinary not configured)');
      const base64 = req.file.buffer.toString('base64');
      url = `data:${req.file.mimetype};base64,${base64}`;
    }

    // Determine media type
    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    console.log(`[Media] Uploaded by ${req.user.name}: ${req.file.originalname} (${req.file.size} bytes)`);

    res.json({
      url,
      type,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('[Media] Upload error:', error);
    res.status(500).json({ error: 'Failed to upload media: ' + error.message });
  }
};

/**
 * Upload multiple media files
 * POST /api/media/upload-multiple
 */
export const uploadMultipleMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Check if Cloudinary is configured
    const useCloudinary = process.env.CLOUDINARY_API_SECRET && 
                          process.env.CLOUDINARY_API_SECRET !== 'your-api-secret-here';

    let urls;

    if (useCloudinary) {
      // Upload all files to Cloudinary
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, `ephemeral-rooms/${roomId}`)
      );
      urls = await Promise.all(uploadPromises);
    } else {
      // Fallback: Convert to base64 data URLs
      urls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
    }

    const results = urls.map((url, index) => ({
      url,
      type: req.files[index].mimetype.startsWith('image/') ? 'image' : 'file',
      filename: req.files[index].originalname,
      size: req.files[index].size
    }));

    console.log(`[Media] Uploaded ${results.length} files by ${req.user.name}`);

    res.json({ files: results });
  } catch (error) {
    console.error('[Media] Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload media: ' + error.message });
  }
};
