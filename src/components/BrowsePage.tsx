"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ContentCard from "./ContentCard";
import api from "@/lib/api";

interface FilterOption {
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "IMAGE";
  isPaid: boolean;
  priceInr?: string | number | null;
  university: { id: string; name: string };
  uploader: { id: string; userName: string; avatarUrl?: string | null };
  createdAt: string;
  topics: { topic: { id: string; name: string } }[];
}

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [countries, setCountries] = useState<FilterOption[]>([]);
  const [states, setStates] = useState<FilterOption[]>([]);
  const [universities, setUniversities] = useState<FilterOption[]>([]);
  const [topics, setTopics] = useState<FilterOption[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPaid, setSelectedPaid] = useState("");

  // Content state
  const [content, setContent] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Load geo + topics on mount
  useEffect(() => {
    const loadFilters = async () => {
      const [countriesRes, topicsRes] = await Promise.all([
        api.get("/api/geo/countries"),
        api.get("/api/topics"),
      ]);
      setCountries(countriesRes.data.countries);
      setTopics(topicsRes.data.topics);
    };
    loadFilters();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) { setStates([]); setSelectedState(""); return; }
    api.get(`/api/geo/states?countryId=${selectedCountry}`)
      .then(r => setStates(r.data.states));
    setSelectedState("");
    setSelectedUniversity("");
  }, [selectedCountry]);

  // Load universities when state changes
  useEffect(() => {
    if (!selectedState) { setUniversities([]); setSelectedUniversity(""); return; }
    api.get(`/api/geo/universities?stateId=${selectedState}`)
      .then(r => setUniversities(r.data.universities));
    setSelectedUniversity("");
  }, [selectedState]);

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCountry) params.set("countryId", selectedCountry);
      if (selectedState) params.set("stateId", selectedState);
      if (selectedUniversity) params.set("universityId", selectedUniversity);
      if (selectedTopic) params.set("topicId", selectedTopic);
      if (selectedType) params.set("type", selectedType);
      if (selectedPaid) params.set("isPaid", selectedPaid);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await api.get(`/api/content?${params.toString()}`);
      setContent(res.data.content);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCountry, selectedState, selectedUniversity, selectedTopic, selectedType, selectedPaid, page]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedUniversity("");
    setSelectedTopic("");
    setSelectedType("");
    setSelectedPaid("");
    setPage(1);
  };

  const hasFilters = search || selectedCountry || selectedState || selectedUniversity || selectedTopic || selectedType || selectedPaid;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Filters */}
      <aside className="w-56 border-r border-gray-100 bg-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            <SlidersHorizontal size={15} /> Filters
          </span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Type */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type</p>
          {["PDF", "VIDEO", "DOCUMENT", "IMAGE"].map((t) => (
            <label key={t} className="flex items-center gap-2 py-1.5 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={selectedType === t}
                onChange={() => setSelectedType(selectedType === t ? "" : t)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-600">{t}</span>
            </label>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pricing</p>
          {[{ label: "Free", value: "false" }, { label: "Paid", value: "true" }].map((o) => (
            <label key={o.value} className="flex items-center gap-2 py-1.5 cursor-pointer">
              <input
                type="radio"
                name="paid"
                checked={selectedPaid === o.value}
                onChange={() => setSelectedPaid(selectedPaid === o.value ? "" : o.value)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-600">{o.label}</span>
            </label>
          ))}
        </div>

        {/* Country */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Country</p>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* State */}
        {states.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State</p>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none"
            >
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* University */}
        {universities.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">University</p>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none"
            >
              <option value="">All universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Topic */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Topic</p>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, topics, universities..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={fetchContent}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
          >
            Search
          </button>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? "Searching..." : `${total} results found`}
          </p>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
            <option>Latest first</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-52" />
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-sm text-gray-400 mb-4">Try different filters or search terms</p>
            <button onClick={clearFilters} className="text-sm text-indigo-600 underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.map((c) => (
              <ContentCard key={c.id} content={c} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={content.length < 12}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
