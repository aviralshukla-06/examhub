"use client";
import { useEffect, useState } from "react";
import { FileText, Users, Building, Star, ChevronRight } from "lucide-react";
import ContentCard from "./ContentCard";
import api from "@/lib/api";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "IMAGE";
  isPaid: boolean;
  priceInr?: number;
  university: { name: string };
  uploader: { userName: string };
  createdAt: string;
}

const stats = [
  { icon: FileText, value: "100K+", label: "Study Notes", sub: "High quality notes" },
  { icon: Users, value: "15K+", label: "Students", sub: "Active learners" },
  { icon: Building, value: "400+", label: "Universities", sub: "Across India" },
  { icon: Star, value: "50K+", label: "Resources", sub: "For every subject" },
];

export default function HomePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recommended, setRecommended] = useState<ContentItem[]>([]);
  const [recent, setRecent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, contentRes] = await Promise.all([
          api.get("/api/topics"),
          api.get("/api/content?limit=8&status=ACTIVE"),
        ]);
        setTopics(topicsRes.data.topics);
        setRecommended(contentRes.data.content.slice(0, 4));
        setRecent(contentRes.data.content.slice(4, 8));
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex gap-0">
      {/* Main content */}
      <div className="flex-1 p-6 max-w-4xl">

        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 mb-6 flex items-center justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
              🏆 India's No.1 Study Resource Marketplace
            </span>
            <p className="text-gray-500 text-sm mb-1">Find. Learn. Succeed.</p>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
              India's Marketplace for{" "}
              <span className="text-indigo-600">Study Resources</span>
            </h1>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Buy and sell study materials, previous papers, notes and more from students across India.
            </p>
            <div className="flex gap-3 mb-6">
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">
                Get Started
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Browse Resources
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D", "E"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-700">
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500">Join 100K+ students learning together</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center w-52">
            <div className="relative">
              <div className="w-40 h-40 bg-indigo-100 rounded-full flex items-center justify-center">
                <div className="text-6xl">👩‍💻</div>
              </div>
              <div className="absolute -top-2 -right-4 bg-white shadow-md rounded-xl px-3 py-2 text-xs font-bold text-red-500">PDF</div>
              <div className="absolute top-4 -left-6 bg-white shadow-md rounded-xl px-3 py-2 text-xs font-bold text-blue-500">DOC</div>
              <div className="absolute -bottom-2 -right-2 bg-white shadow-md rounded-xl px-3 py-2 text-xs font-bold text-orange-500">PPT</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg leading-none">{value}</div>
                <div className="text-xs font-medium text-gray-700">{label}</div>
                <div className="text-xs text-gray-400">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Topics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Trending Topics</h2>
            <button className="text-sm text-indigo-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {loading ? (
              <div className="text-sm text-gray-400">Loading topics...</div>
            ) : topics.length === 0 ? (
              <div className="text-sm text-gray-400">No topics found</div>
            ) : (
              topics.map((t) => (
                <button
                  key={t.id}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  {t.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Recommended */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Recommended for you</h2>
            <button className="text-sm text-indigo-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-44" />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-sm text-gray-400 bg-white border border-gray-100 rounded-xl p-6 text-center">
              No content yet — be the first to upload!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {recommended.map((c) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          )}
        </div>

        {/* Recently Uploaded */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Recently Uploaded</h2>
            <button className="text-sm text-indigo-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-gray-400">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-6 text-sm text-gray-400 text-center">No recent uploads</div>
            ) : (
              recent.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    i !== recent.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.university?.name}</div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {item.type}
                  </span>
                  <span className={`text-xs font-semibold w-12 text-right ${
                    !item.isPaid ? "text-green-600" : "text-indigo-600"
                  }`}>
                    {item.isPaid ? `₹${item.priceInr}` : "FREE"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — static for now */}
      <div className="w-72 p-4 border-l border-gray-100 bg-white min-h-screen flex-shrink-0">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Top Creators</h3>
            <button className="text-xs text-indigo-600">View all</button>
          </div>
          <p className="text-xs text-gray-400">Coming soon</p>
        </div>

        <div className="bg-indigo-600 rounded-xl p-4 text-white">
          <h3 className="font-semibold text-sm mb-1">Become a Creator</h3>
          <p className="text-xs text-indigo-200 mb-3">
            Upload your study materials and earn from your knowledge
          </p>
          <button className="w-full bg-white text-indigo-600 text-sm font-medium py-2 rounded-lg">
            ↑ Start Uploading
          </button>
        </div>
      </div>
    </div>
  );
}
