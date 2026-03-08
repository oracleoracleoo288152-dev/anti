const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Detection = require('../models/Detection');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Route: Upload image and detect fruit
router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = path.join(__dirname, '../uploads', req.file.filename);
    const modelPath = path.join(__dirname, '../best1.pt');
    const scriptPath = path.join(__dirname, '../predict.py');

    // Execute Python script for inference
    exec(`python "${scriptPath}" "${imagePath}" "${modelPath}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Python execution error: ${error}`);
        return res.status(500).json({ error: 'Failed to run detection script' });
      }

      try {
        const result = JSON.parse(stdout.trim());
        
        if (!result.success) {
          console.error(result.error);
          return res.status(500).json({ error: result.error || 'Prediction failed' });
        }

        const fruitName = result.fruitName;
        const confidence = parseFloat(result.confidence).toFixed(2);
        
        // Create URL for the uploaded image
        const imageUrl = `/uploads/${req.file.filename}`;

        const newDetection = new Detection({
          fruitName,
          confidence,
          imageUrl
        });

        await newDetection.save();

        res.json({
          message: 'Detection successful',
          detection: newDetection
        });
      } catch (parseError) {
        console.error('Parse Error:', parseError, 'Raw Output:', stdout);
        return res.status(500).json({ error: 'Failed to parse prediction result' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Route: Get detection history
router.get('/history', async (req, res) => {
  try {
    const history = await Detection.find().sort({ detectedAt: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
