"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import img1 from '../asset/image.jpg';
import img2 from '../asset/image2.jpg';
import AnimatedCursor from 'react-animated-cursor';

function ContactSection() {
  const letters = 'CONTACT'.split('');
  const us = "US".split("");

  return (
    <div className="relative bg-white">
      <AnimatedCursor
        innerSize={8}
        outerSize={25}
        color="255, 165, 0"
        outerAlpha={0.2}
        innerScale={0.7}
        outerScale={2}
        clickables={[
          'a',
          'input[type="text"]',
          'input[type="email"]',
          'input[type="number"]',
          'input[type="submit"]',
          'input[type="image"]',
          'label[for]',
          'select',
          'textarea',
          'button',
          '.link',
        ]}
      />
      
      {/* Background Image */}
      <div className="relative h-64 md:h-96">
        <Image
          src={img1}
          alt="Background"
          layout="fill"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center font-serif font-bold text-4xl">
          <div className="flex space-x-2">
            {letters.map((letter, index) => (
              <motion.h1
                key={index}
                className="text-white text-4xl md:text-6xl font-bold italic"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, color: '#FF9933' }}
                transition={{ duration: 0.3 }}
              >
                {letter}
              </motion.h1>
            ))}
          </div>
          <div className="flex space-x-2 pt-2">
            {us.map((letter, index) => (
              <motion.h1
                key={index}
                className="text-white text-4xl md:text-6xl font-bold italic"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, color: '#FF9933' }}
                transition={{ duration: 0.3 }}
              >
                {letter}
              </motion.h1>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            imageSrc={img2}
            title="Reception Always Open"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis."
          />
          <Card
            imageSrc={img2}
            title="Online Reservations"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis."
          />
        </div>
      </div>

      {/* Circular Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
            $54
          </div>
          <span className="absolute top-0 right-0 bg-yellow-500 text-xs text-black px-1 py-0.5 rounded-full">NEW</span>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white py-16 bg-gradient-to-r from-[#FF9933] to-[#f3bb83]">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Left Section */}
          <div>
            <p className="text-sm text-gray-600 uppercase tracking-wider mb-4">Contact Us</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Get In Touch</h2>
            <p className="text-gray-700 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porttitor tellus vel mauris scelerisque accumsan.
            </p>
            <button className="bg-gradient-to-r from-[#e5e2e0] to-[#FFA500] text-white px-6 py-2 font-merriweather font-semibold text-lg uppercase tracking-wide rounded shadow-md hover:from-[#FFA500] hover:to-[#FF9933] transition duration-300">
              View Prices
            </button>
          </div>

          {/* Right Section (Form) */}
          <div>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 text-black"
                  placeholder="Name"
                />
              </div>
              <div>
                <input
                  type="email"
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 text-black"
                  placeholder="Email"
                />
              </div>
              <div>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 text-black h-32"
                  placeholder="Message"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white font-bold uppercase py-3 rounded-md hover:bg-opacity-90 transition duration-300"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const Card = ({ imageSrc, title, description }) => (
  <div className="bg-white p-8 shadow-lg rounded-lg flex flex-col items-center md:flex-row">
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={imageSrc}
        alt={title}
        width={180}
        height={180}
        className="object-cover rounded-full"
      />
    </motion.div>
    <div className="pl-4">
      <h2 className="font-serif font-semibold text-3xl text-[#FF9933] md:text-center text-center">{title}</h2>
      <p className="font-merriweather font-normal text-base text-gray-800">{description}</p>
    </div>
  </div>
);

export default ContactSection;
