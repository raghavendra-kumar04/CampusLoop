const Listing = require('../models/Listing');
const { chatAboutProduct } = require('../services/geminiService');

// @desc    Chat with AI about a specific product listing
// @route   POST /api/ai/product-chat
// @access  Private
const productAIChat = async (req, res) => {
  try {
    const { listingId, message } = req.body;

    // Validate inputs
    if (!listingId || !message || !message.trim()) {
      return res.status(400).json({ message: 'Both listingId and message are required' });
    }

    const sanitizedMessage = message.trim().substring(0, 500); // Hard cap at 500 chars

    // Fetch the listing to build context (never trust client-sent product data)
    const listing = await Listing.findById(listingId)
      .populate('seller', 'name rating ratingsCount isVerified')
      .select('title price category condition listingType description location seller status');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'Sold') {
      return res.status(400).json({ message: 'This listing has already been sold' });
    }

    // Build safe product context – only non-private fields
    const productContext = {
      title: listing.title,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      listingType: listing.listingType,
      description: (listing.description || '').substring(0, 300), // Limit description to reduce tokens
      location: listing.location,
      sellerRating: listing.seller?.rating || null,
      sellerRatingsCount: listing.seller?.ratingsCount || 0,
      sellerVerified: listing.seller?.isVerified || false,
    };

    const aiResponse = await chatAboutProduct(productContext, sanitizedMessage);

    res.json({ message: aiResponse });
  } catch (error) {
    console.error('ProductAIChat Error:', error);

    if (error.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ message: 'AI service is not configured on this server.' });
    }

    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(503).json({ message: 'AI service configuration error. Contact support.' });
    }

    res.status(500).json({ message: 'AI service temporarily unavailable. Please try again.' });
  }
};

module.exports = { productAIChat };
