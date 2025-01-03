import Booking from "../Models/Booking.js";
import Room from "../Models/Room.js";
import User from "../Models/userModel.js";

export const CreateBooking = async (req, res) => {
  const { userId, roomId, checkInDate, checkOutDate } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const numberOfNights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    if (numberOfNights <= 0) return res.status(400).json({ message: "Invalid booking dates" });
    const totalPrice = room.pricePerNight * numberOfNights;

    const booking = new Booking({
      user: userId,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    const savedBooking = await booking.save();

    // Update user to set isBooking to true
    user.IsBooking = true;
    await user.save();

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: savedBooking._id,
      booking: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};


export const UpdateBooking = async (req, res) => {
  const { id } = req.params;
  const { checkInDate, checkOutDate, roomId } = req.body;

  try {
    // Fetch the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    //console.log("Booking:", booking);

    let room;
    try {
      room = await Room.findById(booking.room);
      if (!room) {
        //console.log(`Room with ID ${booking.room} not found`);
        return res.status(404).json({ message: "Room not found" });
      }
    } catch (err) {
      //console.error("Error fetching room:", err);
      return res.status(500).json({ message: "Error fetching room", error: err.message });
    }

    //console.log("Current room details:", room);
    // If roomId is provided and differs from the current room
    if (roomId && roomId !== booking.room.toString()) {
      const newRoom = await Room.findById(roomId);
      if (!newRoom) return res.status(404).json({ message: "New room not found" });
      if (!newRoom.isAvailable) return res.status(400).json({ message: "New room is not available for booking" });

      // Update room references
      room.isAvailable = true; // Mark old room as available
      await room.save();
      console.log(room.isAvailable)
      newRoom.isAvailable = false; // Mark new room as unavailable
      await newRoom.save();

      room = newRoom;
      booking.room = roomId;
    }

    // Validate and update booking dates
    if (checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);

      if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
        return res.status(400).json({ message: "Invalid booking dates" });
      }

      const numberOfNights = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (room.pricePerNight && numberOfNights > 0) {
        booking.totalPrice = room.pricePerNight * numberOfNights;
      } else {
        return res.status(400).json({ message: "Failed to calculate total price. Invalid room price or dates." });
      }

      booking.checkInDate = checkInDate;
      booking.checkOutDate = checkOutDate;
    }

    // Save the updated booking
    const updatedBooking = await booking.save();
    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

export const UpdateBookingForAdmin = async (req, res) => {
  const { id } = req.params;
  const { checkInDate, checkOutDate, status, roomId } = req.body;

  try {
    // Fetch the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to update the booking" });
    }

    // If status is provided, validate and update the status
    if (status) {
      const validStatuses = ['Confirmed', 'Cancelled', 'Pending']; // Add other statuses as needed
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid booking status" });
      }
      booking.status = status; // Update the status
    }

    // If a new roomId is provided, update the room (check availability)
    if (roomId && roomId !== booking.room.toString()) {
      const newRoom = await Room.findById(roomId);
      if (!newRoom) return res.status(404).json({ message: "New room not found" });
      if (!newRoom.isAvailable) return res.status(400).json({ message: "New room is not available for booking" });

      // Mark the old room as available and the new room as unavailable
      const oldRoom = await Room.findById(booking.room);
      oldRoom.isAvailable = true;
      await oldRoom.save();

      newRoom.isAvailable = false;
      await newRoom.save();

      booking.room = roomId; // Update the booking to reference the new room
    }

    // Validate and update booking dates if provided
    if (checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);

      if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
        return res.status(400).json({ message: "Invalid booking dates" });
      }

      const numberOfNights = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (numberOfNights <= 0) {
        return res.status(400).json({ message: "Invalid number of nights" });
      }

      const room = await Room.findById(booking.room);
      booking.totalPrice = room.pricePerNight * numberOfNights;

      booking.checkInDate = checkInDate;
      booking.checkOutDate = checkOutDate;
    }

    // Save the updated booking
    const updatedBooking = await booking.save();
    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

export const UpdateForAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Fetch the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to update the booking" });
    }

    // Validate and update the status
    if (status) {
      const validStatuses = ['Confirmed', 'Cancelled', 'Pending']; // Add other statuses as needed
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid booking status" });
      }
      booking.status = status; // Update the status
    } else {
      return res.status(400).json({ message: "Status is required" });
    }

    // Save the updated booking
    const updatedBooking = await booking.save();
    res.status(200).json({ message: "Booking status updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};


// Get all bookings
export const GetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate({ path: "user", select: "-password" }).populate("room");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

// Get a booking by ID
export const GetBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({ path: "user", select: "-password" }).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking", error: error.message });
  }
};
export const GetUserBookingsById = async (req, res) => {
  try {
    const userId = req.params.id; // Extract userId from the request parameters

    // Fetch bookings for the user, populate related fields, and exclude sensitive data
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "user", select: "-password" }) // Exclude password when populating user
      .populate("room"); // Populate room details

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User bookings fetched successfully.",
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings. Please try again later.",
      error: error.message,
    });
  }
};

// export const GetUserBookingsById = async (req, res) => {
//   try {
//     const userId = req.params.id; // Extract userId from the request parameters
//     const bookings = await Booking.find({ user: userId }).populate("user").populate("room");
//     if (bookings.length === 0) {
//       return res.status(404).json({ message: "No bookings found for this user" });
//     }
//     res.status(200).json(bookings); // Return all bookings for the user
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
//   }
// };

// Cancel a booking
export const CancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Cancel the booking
    booking.status = "Cancelled";
    await booking.save();

    // Mark the room as available
    const room = await Room.findById(booking.room);
    room.isAvailable = true;
    await room.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};



export const Putrating = async (req, res) => {
  try {
    const { id } = req.params;  // Room being rated
    const { rating } = req.body;    // Rating value
    const currentUserId = req.user._id; // Assuming the current user is authenticated and stored in req.user

    // Find the room being rated
    console.log(id)
    console.log(currentUserId)

    const roomToRate = await Room.findById(id);
    if (!roomToRate) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    // Check if the rating is within the valid range (0-5)
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0 and 5.' });
    }

    // Check if the current user has already rated this room
    const existingRating = roomToRate.ratings.find(r => String(r.userId) === String(currentUserId));
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already rated this room.' });
    }

    // Add the new rating
    roomToRate.ratings.push({
      userId: currentUserId,
      rating,
    });

    // Save the updated room document
    await roomToRate.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully.',
      room: roomToRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error occurred while adding rating' });
  }
};

// Get the average rating of a room
export const getavgrating = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('roomId from params:', id);  // Debugging line

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const ratings = room.ratings;
    if (ratings.length === 0) {
      return res.status(200).json({ success: true, message: 'No ratings available.', avg: 0 });
    }

    const sum = ratings.reduce((acc, cur) => acc + cur.rating, 0);
    const avg = Math.round(sum / ratings.length);

    res.status(200).json({ success: true, message: 'Average rating retrieved successfully.', avg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error occurred while retrieving average rating.' });
  }
};
export const GetUserBookings = async (req, res) => {
  const userId = req.user.userId;
  console.log(userId)
    // Assuming user ID is available via JWT token in req.user
  try {
    // Find all bookings for the current user
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "user", select: "-password" })
      .populate("room");

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user."
      });
    }

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully.",
      bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching user bookings."
    });
  }
};

export const All=async(req,res)=>{
  try {
    // Total Bookings
    const totalBookings = await Booking.countDocuments();

    // Total Guests
    const totalGuests = await User.countDocuments({ IsBooking: true });

    // Total Users
    const totalUsers = await User.countDocuments({ IsBooking: false });

    const revenue = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);

    // Recent Bookings (sorted by booking date, limited to 5)
    const recentBookings = await Booking.find()
      .sort({ bookingDate: -1 }) // Sort by booking date descending
      .limit(5);

    res.json({
      totalBookings,
      totalGuests,
      totalUsers,
      revenue: revenue[0]?.totalRevenue || 0,
      recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}