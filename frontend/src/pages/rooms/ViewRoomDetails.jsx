import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInDays, addDays, isBefore, isToday } from 'date-fns';
import { Bed, Users, Star, ChevronLeft, Plus, Minus, Info, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRoom } from '@/context/RoomContext';
import ImageSlider from './components/ImageSlider';
import { useAuth } from '@/hooks/useAuth';

// Loading skeleton component
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

  // Find the current room from Rooms array
  const room = Rooms?.find(room => room._id === id);

  // Initialize states
  const [roomCount, setRoomCount] = useState(() => {
    try {
      // Check URL parameters first
      const roomsParam = searchParams.get('rooms');
      if (roomsParam) {
        const parsedRooms = parseInt(roomsParam);
        return parsedRooms > 0 ? parsedRooms : 1;
      }

      // Then check location state
      const locationRooms = location.state?.rooms;
      if (locationRooms) {
        const parsedLocationRooms = parseInt(locationRooms);
        return parsedLocationRooms > 0 ? parsedLocationRooms : 1;
      }

      return 1; // Default value
    } catch (error) {
      console.error('Error initializing room count:', error);
      return 1; // Fallback to default
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

      return 1; // Default value
    } catch (error) {
      console.error('Error initializing guests count:', error);
      return 1; // Fallback to default
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

  // Effects
  useEffect(() => {
    getAllRooms();
  }, []);

  useEffect(() => {
    if (!room) return;

    const validateRoomAssignment = () => {
      const currentGuests = guests;
      const currentRooms = roomCount;
      const maxGuestsPerRoom = room.maxOccupancy;

      // Calculate minimum required rooms
      const minimumRequiredRooms = Math.ceil(currentGuests / maxGuestsPerRoom);

      // Check if current room count can accommodate all guests
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

  // Handlers
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

    // Only auto-adjust rooms if not manually set in URL
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

  // Utility functions
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
    <div className="container mx-auto p-4 space-y-6">
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

      {/* Room Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Carousel */}
        <div className="relative">
          {room.images?.length > 0 ? (
            <ImageSlider images={room.images} />
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {/* Booking Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Book Your Stay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Details */}
            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-gray-600">{room.maxOccupancy} Guests per room</p>
              </div>
            </div>

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
              {isValidDateRange(date) && !dateError && (
                <div className="text-sm text-primary mt-2 flex justify-end">
                  <span className="font-normal">
                    {calculateNights(date)} {calculateNights(date) === 1 ? 'night' : 'nights'} selected
                  </span>
                </div>
              )}
            </div>


            {/* Guests and Rooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Guests
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4">{guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms Required
                </label>
                <div className="bg-orange-50 text-secondary-foreground px-4 py-2 rounded-md">
                  {roomCount}
                </div>
              </div>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-primary mr-2">
                    ₹{calculatePrice()}
                  </span>
                  <Info
                    className="text-gray-500 h-4 w-4"
                    title="Total price for selected stay duration"
                  />
                </div>
                {!user ?
                  <>
                    <Button
                      onClick={handleLogin}
                      className="w-full max-w-xs bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
                    >
                      Login to Book
                    </Button>
                  </>
                  :
                  <>
                    <Button
                      disabled={!!dateError || !date.from || !date.to || !room}
                      onClick={handleBookNow}
                      className="w-full max-w-xs bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
                    >
                      Book Now
                    </Button>
                  </>
                }

              </div>
              {priceIncreased && (
                <p className="text-sm text-yellow-600 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Price has increased due to multiple room allocation.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

