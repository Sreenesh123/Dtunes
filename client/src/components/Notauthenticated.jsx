import React from 'react';
import Navbar from './Navbar';
const Notauthenticated = () => {
  return (
    <div  className="w-[100%] m-2  pt-4 rounded-lg bg-gradient-to-b from-gray-900 to-black text-white overflow-auto lg:w-[75%] lg:ml-0">
      <Navbar/>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <p className="text-lg mb-4">Please log in to access this page.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 w-[25%] bg-white text-black rounded-full"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Notauthenticated;