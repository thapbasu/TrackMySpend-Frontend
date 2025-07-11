"use client";
import {useEffect, useState} from 'react';
import { ChevronDown } from "lucide-react";


export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/view-profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
      <header className="flex bg-white px-10 w-full p-4 justify-end items-center">
        <div className="relative">
          <button
              onClick={toggleDropdown}
              className="focus:outline-none"
        >
          <p className="font-bold text-gray-800 text-center flex items-center gap-1 cursor-pointer select-none">
            {profile?.name || ""}
            <ChevronDown className="w-4 h-4"/>
          </p>

        </button>
        {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <a href="/profile" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
            <a href='/' className="w-full block text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Log out</a>
          </div>
        )}
      </div>
    </header>
  );
}



