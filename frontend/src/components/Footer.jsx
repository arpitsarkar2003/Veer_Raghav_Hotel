import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer 
      className="text-white mt-[10%]"
      style={{
        fontFamily: "font-serif font-semibold",
        backgroundColor: "#FFF5E5",
        color: "#FF9933"
      }}
    >
      <div className="container mx-auto px-4 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaPhone className="flex-shrink-0" size={20} />
                <span className="text-md">Reservation: +91 7376717607</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="flex-shrink-0" size={20} />
                <span className="text-md">Booking: +91 7376717607</span>
              </div>
              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="flex-shrink-0 mt-1" size={20} />
                <span className="text-md">259 Uttar Paras math Near kanak bhavan mandir ayodhya 224123 uttar pradesh</span>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center sm:text-left">Follow Us</h3>
            <div className="flex gap-6 justify-center sm:justify-start">
              <a href="#facebook" className="hover:text-amber-200 transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="#twitter" className="hover:text-amber-200 transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="#instagram" className="hover:text-amber-200 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#youtube" className="hover:text-amber-200 transition-colors">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Drop a Line Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Drop a Line</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaEnvelope className="flex-shrink-0" size={20} />
                <span className="text-md">veerraghaw98@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content for Height */}
        <div className="border-t border-amber-500 pt-8 pb-12">
          <h4 className="text-xl font-semibold mb-4">About Us</h4>
          <p className="text-lg mb-4">
            We are dedicated to providing exceptional hospitality services in the heart of Ayodhya. 
            Our commitment to quality and customer satisfaction ensures a memorable stay for all our guests.
          </p>
          <p className="text-lg">
            Experience the rich culture and spirituality of Ayodhya while enjoying modern comforts and warm hospitality.
          </p>
        </div>
      </div>

      {/* Sub Footer */}
      <div className="bg-amber-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-md">
              © 2024 All rights reserved
            </div>
            <div className="flex space-x-4 text-md">
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-conditions" className="hover:underline">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

