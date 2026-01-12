const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const Notification = require("../models/Notification"); // [NEW] Import Notification
const mongoose = require("mongoose");

const { sendNewBidEmail, sendBidAcceptedEmail } = require("../utils/emailUtil");

// @desc    Place a bid on a gig
// @route   POST /api/bids
// @access  Private (Freelancer)
const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Populate ownerId to get email for notification
    const gig = await Gig.findById(gigId).populate("ownerId", "name email");
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check if user is owner
    if (gig.ownerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot bid on your own gig" });
    }

    // Check if already bid
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });
    if (existingBid) {
      return res
        .status(400)
        .json({ message: "You have already bid on this gig" });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
    });

    // 1. Send Email to Gig Owner
    sendNewBidEmail(
      gig.ownerId.email,
      gig.ownerId.name,
      req.user.name,
      price,
      message,
      gig.title,
      gig._id
    ).catch((err) => console.error("Failed to send new bid email", err));

    // 2. Create In-App Notification for Gig Owner
    await Notification.create({
      recipientId: gig.ownerId._id,
      senderId: req.user._id,
      type: "new_bid",
      message: `New bid of $${price} from ${req.user.name} on "${gig.title}"`,
      relatedId: gig._id, // Link to the Gig (or Bid)
    });

    res.status(201).json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ... (getGigBids remains unchanged, skipping for brevity in replacement if possible, but replace_file_content replaces blocks. I will just target the specific blocks or use multi-replace if I want to skip)
// Actually, I'll just keep the structure clean.

// @desc    Get all bids for a specific gig
// @route   GET /api/bids/:gigId
// @access  Private (Gig Owner Only)
const getGigBids = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // If user is owner, return all bids
    if (gig.ownerId.toString() === req.user._id.toString()) {
      const bids = await Bid.find({ gigId: req.params.gigId })
        .populate("freelancerId", "name email")
        .sort({ createdAt: -1 });
      return res.status(200).json(bids);
    }

    // If user is NOT owner, return only their bids (if any)
    const myBids = await Bid.find({
      gigId: req.params.gigId,
      freelancerId: req.user._id,
    }).populate("freelancerId", "name email");

    res.status(200).json(myBids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Hire a freelancer for a bid
// @route   POST /api/bids/:bidId/hire
// @access  Private (Gig Owner Only)
const hireFreelancer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate("freelancerId", "name email")
      .session(session);
    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Bid not found" });
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Not authorized to hire for this gig" });
    }

    if (gig.status === "assigned") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Gig is already assigned" });
    }

    // 1. Mark gig as assigned
    gig.status = "assigned";
    await gig.save({ session });

    // 2. Mark this bid as hired
    bid.status = "hired";
    await bid.save({ session });

    // 3. Mark all other bids as rejected
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { status: "rejected" },
      { session }
    );

    // 4. Create In-App Notification for Freelancer
    const notifications = await Notification.create(
      [
        {
          recipientId: bid.freelancerId._id,
          senderId: req.user._id,
          type: "bid_accepted",
          message: `Congratulations! Your bid on "${gig.title}" has been accepted!`,
          relatedId: gig._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 5. Emit Real-time Notification (using first notification from array)
    req.io
      .to(bid.freelancerId._id.toString())
      .emit("notification", notifications[0]);

    // 6. Send Email to Freelancer (After commit)
    sendBidAcceptedEmail(
      bid.freelancerId.email,
      bid.freelancerId.name,
      req.user.name,
      gig.title,
      gig._id
    ).catch((err) => console.error("Failed to send bid accepted email", err));

    res
      .status(200)
      .json({ message: "Freelancer hired successfully", gig, bid });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all bids placed by the logged-in freelancer
// @route   GET /api/bids/my-bids
// @access  Private
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate("gigId", "title status budget ownerId") // Populate Gig details
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBid,
  getGigBids,
  hireFreelancer,
  getMyBids, // [NEW]
};
