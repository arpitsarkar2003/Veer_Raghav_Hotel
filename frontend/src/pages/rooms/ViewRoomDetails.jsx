import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInDays, addDays, isBefore, isToday } from 'date-fns';
import {
  Bed, Users, Star, ChevronLeft, Plus, Minus, Info,
  AlertCircle, User, MessageSquare, Clock, Languages,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRoom } from '@/context/RoomContext';
import ImageSlider from './components/ImageSlider';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

// Loading skeleton component (same as before)
const RoomDetailsSkeleton = () => (
  <div className="container mx-auto p-4 space-y-6">
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <Skeleton className="aspect-video rounded-lg" />
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function ViewRoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const { Rooms, getAllRooms, loading: roomsLoading } = useRoom();

  // States for new UI elements
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // const [showAllFoodDining, setShowAllFoodDining] = useState(false);
  const [showHostInfo, setShowHostInfo] = useState(false);

  // Find the current room from Rooms array
  const room = Rooms?.find(room => room._id === id);

  // Initialize states (same as before)
  const [roomCount, setRoomCount] = useState(() => {
    try {
      const roomsParam = searchParams.get('rooms');
      if (roomsParam) {
        const parsedRooms = parseInt(roomsParam);
        return parsedRooms > 0 ? parsedRooms : 1;
      }

      const locationRooms = location.state?.rooms;
      if (locationRooms) {
        const parsedLocationRooms = parseInt(locationRooms);
        return parsedLocationRooms > 0 ? parsedLocationRooms : 1;
      }

      return 1;
    } catch (error) {
      console.error('Error initializing room count:', error);
      return 1;
    }
  });

  const [guests, setGuests] = useState(() => {
    try {
      const guestsParam = searchParams.get('guests');
      if (guestsParam) {
        const parsedGuests = parseInt(guestsParam);
        return parsedGuests > 0 ? parsedGuests : 1;
      }

      const locationGuests = location.state?.guests;
      if (locationGuests) {
        const parsedLocationGuests = parseInt(locationGuests);
        return parsedLocationGuests > 0 ? parsedLocationGuests : 1;
      }

      return 1;
    } catch (error) {
      console.error('Error initializing guests count:', error);
      return 1;
    }
  });

  const [date, setDate] = useState(() => {
    try {
      const checkIn = searchParams.get('checkIn');
      const checkOut = searchParams.get('checkOut');

      const locationStartDate = location.state?.startDate;
      const locationEndDate = location.state?.endDate;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = addDays(today, 1);
      tomorrow.setHours(0, 0, 0, 0);

      return {
        from: checkIn ? new Date(checkIn) : locationStartDate ? new Date(locationStartDate) : today,
        to: checkOut ? new Date(checkOut) : locationEndDate ? new Date(locationEndDate) : tomorrow,
        selecting: false
      };
    } catch (error) {
      console.error('Error initializing dates:', error);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = addDays(today, 1);
      return {
        from: today,
        to: tomorrow,
        selecting: false
      };
    }
  });

  const [dateError, setDateError] = useState('');
  const [priceIncreased, setPriceIncreased] = useState(false);

  // Effects (same as before)
  useEffect(() => {
    getAllRooms();
  }, []);

  useEffect(() => {
    if (!room) return;

    const validateRoomAssignment = () => {
      const currentGuests = guests;
      const currentRooms = roomCount;
      const maxGuestsPerRoom = room.maxOccupancy;
      const minimumRequiredRooms = Math.ceil(currentGuests / maxGuestsPerRoom);

      if (currentRooms * maxGuestsPerRoom < currentGuests) {
        setRoomCount(minimumRequiredRooms);
        setPriceIncreased(minimumRequiredRooms > 1);
      }
    };

    validateRoomAssignment();
  }, [room, guests]);

  useEffect(() => {
    if (!room) return;

    const params = new URLSearchParams(searchParams);
    params.set('guests', guests.toString());
    params.set('rooms', roomCount.toString());
    if (date.from) params.set('checkIn', date.from.toISOString());
    if (date.to) params.set('checkOut', date.to.toISOString());

    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [guests, roomCount, date, room]);

  useEffect(() => {
    if (room && date?.from && date?.to) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isBefore(date.from, today) && !isToday(date.from)) {
        setDateError('Check-in date cannot be in the past');
        return;
      }

      if (date.to && isBefore(date.to, date.from)) {
        setDateError('Check-out date must be after check-in date');
        return;
      }

      const days = differenceInDays(date.to, date.from);

      if (days < 1) {
        setDateError('Minimum stay is 1 night');
      } else {
        setDateError('');
      }
    }
  }, [date, room]);

  // Handlers (same as before)
  const handleDateSelect = (newDate) => {
    if (!newDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = addDays(today, 1);
      setDate({
        from: today,
        to: tomorrow,
        selecting: false
      });
      return;
    }

    if (!newDate.from) {
      setDate({
        from: null,
        to: null,
        selecting: true
      });
    } else if (!newDate.to) {
      setDate({
        from: newDate.from,
        to: null,
        selecting: true
      });
    } else {
      setDate({
        from: newDate.from,
        to: newDate.to,
        selecting: false
      });
    }
  };

  const handleGuestChange = (increment) => {
    if (!room) return;

    const newGuestCount = Math.max(1, guests + increment);
    setGuests(newGuestCount);

    if (!searchParams.get('rooms')) {
      const minimumRequiredRooms = Math.ceil(newGuestCount / room.maxOccupancy);
      if (minimumRequiredRooms !== roomCount) {
        setRoomCount(minimumRequiredRooms);
        setPriceIncreased(minimumRequiredRooms > 1);
      }
    }
  };

  const handleLogin = () => {
    navigate('/auth/login', {
      state: {
        from: location,
        message: 'You need to be logged in to book a room.',
      },
    });
  };

  const handleBookNow = () => {
    if (!date?.from || !date?.to || !room) return;

    const nights = differenceInDays(date.to, date.from);
    const price = calculatePrice();

    const booking = {
      roomId: room._id,
      roomName: room.name,
      roomType: room.type,
      roomCapacity: room.maxOccupancy,
      roomPrice: room.pricePerNight,
      startDate: date.from,
      endDate: date.to,
      guests,
      nights,
      price,
      roomCount,
    };

    navigate(`/booking/${room._id}`, { state: { booking } });
  };

  // Utility functions (same as before)
  const calculatePrice = () => {
    if (!room || !isValidDateRange(date)) return 0;

    const nights = calculateNights(date);
    if (nights === 0) return 0;

    const basePrice = room.pricePerNight * nights * roomCount;

    if (nights >= 5) return Math.round(basePrice * 0.9);
    if (nights > 1) return Math.round(basePrice * 0.95);
    return basePrice;
  };

  const isValidDateRange = (dateRange) => {
    if (!dateRange || !dateRange.from || !dateRange.to) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      return (
        dateRange.from instanceof Date &&
        dateRange.to instanceof Date &&
        !isNaN(dateRange.from) &&
        !isNaN(dateRange.to) &&
        (isToday(dateRange.from) || isBefore(today, dateRange.from))
      );
    } catch (error) {
      console.error('Error validating date range:', error);
      return false;
    }
  };

  const formatDateRange = (dateRange) => {
    try {
      if (!isValidDateRange(dateRange)) {
        return "Select dates";
      }
      return `${format(dateRange.from, "EEE, MMM d, yyyy")} - ${format(dateRange.to, "EEE, MMM d, yyyy")}`;
    } catch (error) {
      console.error('Error formatting date range:', error);
      return "Select dates";
    }
  };

  const calculateNights = (dateRange) => {
    try {
      if (!isValidDateRange(dateRange)) return 0;
      return Math.max(differenceInDays(dateRange.to, dateRange.from), 0);
    } catch (error) {
      console.error('Error calculating nights:', error);
      return 0;
    }
  };

  const getRoomQuality = (rating) => {
    if (!rating) return "New";
    if (rating > 4.5) return "Excellent";
    if (rating > 4) return "Very Good";
    if (rating >= 3.5) return "Good";
    return "Okay";
  };

  // Loading and error states
  if (roomsLoading) {
    return <RoomDetailsSkeleton />;
  }

  if (!room) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Room Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The room you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate('/rooms')}>
              Back to Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const disabledDays = {
    before: new Date(),
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{room.name}</h1>
          <Button
            variant="link"
            onClick={() => navigate('/rooms')}
            className="pl-0 text-gray-600 hover:text-primary"
          >
            <ChevronLeft className="mr-2" /> Back to Rooms
          </Button>
        </div>
        <div className="flex items-center">
          <Star className="text-yellow-500 mr-2" />
          <span className="font-semibold">
            {room.rating?.toFixed(1) || "New"}
          </span>
          <span className="text-gray-500 ml-2">
            ({getRoomQuality(room.rating)})
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Section - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Image Slider */}
          <div className="relative">
            <ImageSlider images={room.images || []} />
          </div>

          {/* Room Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center">
                <Bed className="mr-2 text-primary" /> Room Type
              </h3>
              <p className="text-gray-600">{room.name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center">
                <Users className="mr-2 text-primary" /> Capacity
              </h3>
              <p className="text-gray-600">Fits {room.maxOccupancy} Guests</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-gray-600">
              {room.description?.length > 150
                ? `${room.description.slice(0, 150)}...`
                : room.description}
              {room.description?.length > 150 && (
                <Button
                  variant="link"
                  onClick={() => setShowFullDescription(true)}
                  className="text-primary"
                >
                  Read more
                </Button>
              )}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {room.amenities?.slice(0, 5).map((amenity) => (
                <span key={amenity} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
              {room.amenities?.length > 5 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllAmenities(true)}
                  className="text-primary"
                >
                  +{room.amenities.length - 5} more
                </Button>
              )}
            </div>
          </div>

            <Separator />  
          {/* Food & Dining */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Food & Dining</h3>
            <div className="flex textblack ">
              <div>
                <h1>Meal options are provided at the property</h1>
                <ul className='text-base list-disc'>
                  <li className='text-sm ml-5'>Meals offered: Breakfast, Lunch, Dinner</li>
                  <li className='text-sm ml-5'>Only veg meals will be served by the property</li>
                  <li className='text-sm ml-5'>Cuisines available: Local, South Indian, North Indian, Chinese</li>
                  <li className='text-sm ml-5'>Meal charges (approx): INR 200 per person per meal</li>
                </ul>
              </div>

              <div>
                <h1>Additional information</h1>
                <ul className='text-base list-disc'>
                  <li className='text-sm ml-5'>Outside food is allowed</li>
                </ul>
              </div>
            </div>
          </div>
          <Separator />  
          {/* Host Information Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Hosted by Ankur</h3>
                  <p className="text-gray-600">Hosting since 2024</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Languages className="text-primary" />
                  <span>Speaks English, Hindi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-primary" />
                  <span>Responds within 24 hours</span>
                </div>
              </div>

              <p className="text-gray-600">
                During your stay, you will be hosted by Ankur. He has been hosting since 2024.
                Ankur is an affable person and loves hosting guests from various corners of the world...
                <Button
                  variant="link"
                  onClick={() => setShowHostInfo(true)}
                  className="text-primary"
                >
                  Read more
                </Button>
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold">
                  During your stay, a Caretaker will be available at the property.
                </h4>
                <p className="text-gray-600">
                  <strong>Caretaker Responsibilities:</strong> Cleaning kitchen/utensils,
                  Cab bookings, Car/bike rentals, Gardening, Help buying groceries,
                  Restaurant reservations, Pick up and Drop services
                </p>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleLogin}
                >
                  <MessageSquare className="h-4 w-4" />
                  LOGIN TO MESSAGE HOST
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - 1/3 width */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Stay Dates
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !isValidDateRange(date) && "text-muted-foreground"
                        )}
                      >
                        {formatDateRange(date)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date.from || new Date()}
                        selected={{
                          from: date.from,
                          to: date.to
                        }}
                        onSelect={handleDateSelect}
                        numberOfMonths={2}
                        disabled={disabledDays}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  {dateError && (
                    <div className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      {dateError}
                    </div>
                  )}
                </div>

                {/* Guests and Rooms */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Guests
                    </label>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleGuestChange(-1)}
                        disabled={guests <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleGuestChange(1)}
                        disabled={guests >= room.maxOccupancy * roomCount}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rooms Required
                    </label>
                    <div className="bg-orange-50 text-secondary-foreground px-4 py-2 rounded-md text-center">
                      {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total Price</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ₹{calculatePrice()}
                      </div>
                      <div className="text-sm text-gray-500">
                        + ₹{room.taxesAndFees || 0} taxes & fees
                      </div>
                    </div>
                  </div>
                  {priceIncreased && (
                    <p className="text-sm text-yellow-600 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Price adjusted for multiple rooms
                    </p>
                  )}
                </div>

                {/* Book Now Button */}
                {!user ? (
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Login to Book
                  </Button>
                ) : (
                  <Button
                    disabled={!!dateError || !date.from || !date.to}
                    onClick={handleBookNow}
                    className="w-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showFullDescription} onOpenChange={setShowFullDescription}>
        <DialogContent  className='textblack'>
          <DialogHeader>
            <DialogTitle>Room Description</DialogTitle>
          </DialogHeader>
          <Separator />
          <p className="text-gray-600">{room.description}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllAmenities} onOpenChange={setShowAllAmenities}>
        <DialogContent className='textblack'>
          <DialogHeader>
            <DialogTitle>All Amenities</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            {room.amenities?.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Check className="text-primary h-4 w-4" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHostInfo} onOpenChange={setShowHostInfo}>
        <DialogContent  className='textblack'>
          <DialogHeader>
            <DialogTitle>About Your Host</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-4">
            <p className="text-gray-600">
              During your stay, you will be hosted by Ankur. He has been hosting since 2024.
              Ankur is an affable person and loves hosting guests from various corners of the world.
              Besides hosting, Ankur likes travelling, listening to music, reading and playing sports.
              He has always been passionate about donning the hat of a perfect host.
            </p>
            <div>
              <h4 className="font-semibold mb-2">Caretaker Services</h4>
              <ul className="space-y-2">
                <li>• Cleaning kitchen/utensils</li>
                <li>• Cab bookings</li>
                <li>• Car/bike rentals</li>
                <li>• Gardening</li>
                <li>• Help buying groceries</li>
                <li>• Restaurant reservations</li>
                <li>• Pick up and Drop services</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}