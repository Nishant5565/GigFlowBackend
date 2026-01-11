const Gig = require("../models/Gig");
const Bid = require("../models/Bid");

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private
const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
    });

    res.status(201).json(gig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all open gigs
// @route   GET /api/gigs
// @access  Public
const getAllGigs = async (req, res) => {
  try {
    const { search, minBudget } = req.query;
    let query = { status: "open" };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (minBudget) {
      query.budget = { $gte: Number(minBudget) };
    }

    const gigs = await Gig.find(query)
      .populate("ownerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(gigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single gig details
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "ownerId",
      "name email"
    );

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.status(200).json(gig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged-in client's gigs
// @route   GET /api/gigs/my
// @access  Private
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(gigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update gig status (Open/Closed)
// @route   PUT /api/gigs/:id/status
// @access  Private (Owner only)
const updateGigStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expect "open" or "closed" (or "active" if we stick to that naming)

    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Validate status
    const validStatuses = ["open", "closed", "active", "assigned"];
    // "active" seems to be the "open" state in some parts, or "open" in others.
    // The previous code had specific logic. Let's stick to updating what is passed if valid.
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    gig.status = status;
    await gig.save();

    res.status(200).json(gig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGig,
  getAllGigs,
  getGigById,
  getMyGigs,
  updateGigStatus,
};
