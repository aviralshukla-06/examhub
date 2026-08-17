"use client";
import { Search, Upload, Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 z-10">
      {/* Search */}
      <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 max-w-xl">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search notes, topics, universities..."
          className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value;
              router.push(`/browse?search=${val}`);
            }
          }}
        />
        <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
          ⌘K
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => router.push("/upload")}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Upload size={15} />
          Upload
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {dark ? (
            <Moon size={18} className="text-gray-600" />
          ) : (
            <Sun size={18} className="text-gray-600" />
          )}
        </button>

        {/* User */}
        <button className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-lg">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-xs">A</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Aviral</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
