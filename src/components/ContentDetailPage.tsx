"use client";
import { useEffect, useState } from "react";
import {
  Download, Lock, FileText, Video,
  MapPin, University, Tag, User,
  Calendar, ArrowLeft, CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface ContentDetail {
  id: string;
  title: string;
  description?: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "IMAGE";
  isPaid: boolean;
  priceInr?: string | number | null;
  fileUrl?: string;
  status: string;
  createdAt: string;
  locked?: boolean;
  uploader: {
    id: string;
    userName: string;
    fullName?: string;
    avatarUrl?: string | null;
  };
  country: { id: string; name: string };
  state: { id: string; name: string };
  university: { id: string; name: string };
  topics: { topic: { id: string; name: string } }[];
}

const typeConfig = {
  PDF: { bg: "bg-red-100", text: "text-red-600", icon: FileText },
  VIDEO: { bg: "bg-purple-100", text: "text-purple-600", icon: Video },
  DOCUMENT: { bg: "bg-blue-100", text: "text-blue-600", icon: FileText },
  IMAGE: { bg: "bg-green-100", text: "text-green-600", icon: FileText },
};

export default function ContentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/content/${id}`);
        setContent(res.data.content);
      } catch {
        setError("Content not found");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBuy = async () => {
    try {
      setPurchasing(true);
      const res = await api.post("/api/payments/create-order", {
        contentId: id,
      });

      const { orderId, amount, keyId } = res.data;

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          amount,
          currency: "INR",
          name: "ExamHub",
          description: content?.title,
          order_id: orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await api.post("/api/payments/verify", {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              // Refresh content after purchase
              const updated = await api.get(`/api/content/${id}`);
              setContent(updated.data.content);
            } catch {
              setError("Payment verification failed");
            }
          },
          prefill: { email: "" },
          theme: { color: "#534AB7" },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="font-semibold text-gray-900 mb-2">Content not found</h2>
        <button onClick={() => router.push("/browse")} className="text-indigo-600 text-sm underline">
          Back to Browse
        </button>
      </div>
    );
  }

  const config = typeConfig[content.type] ?? typeConfig.DOCUMENT;
  const Icon = config.icon;
  const isLocked = content.isPaid && content.locked !== false && !content.fileUrl;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="col-span-2">
          {/* Thumbnail */}
          <div className={`${config.bg} rounded-2xl h-56 flex items-center justify-center mb-6 relative`}>
            <Icon size={56} className={config.text} />
            <span className={`absolute top-4 left-4 text-xs font-bold ${config.text} bg-white px-3 py-1 rounded-lg`}>
              {content.type}
            </span>
            {content.isPaid && (
              <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1">
                <Lock size={11} /> ₹{content.priceInr}
              </span>
            )}
            {!content.isPaid && (
              <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                FREE
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <User size={14} /> @{content.uploader.userName}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {content.state.name}, {content.country.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {new Date(content.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 bg-gray-50 rounded-xl p-4">
              {content.description}
            </p>
          )}

          {/* Topics */}
          {content.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {content.topics.map(({ topic }) => (
                <span
                  key={topic.id}
                  className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full"
                >
                  <Tag size={11} /> {topic.name}
                </span>
              ))}
            </div>
          )}

          {/* University */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">University</p>
              <p className="text-sm font-medium text-gray-900">{content.university.name}</p>
              <p className="text-xs text-gray-400">{content.state.name} · {content.country.name}</p>
            </div>
          </div>
        </div>

        {/* Right — action card */}
        <div className="col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20">
            {/* Price */}
            <div className="mb-4">
              {content.isPaid ? (
                <div>
                  <span className="text-3xl font-bold text-gray-900">₹{content.priceInr}</span>
                  <p className="text-xs text-gray-400 mt-1">One-time purchase · Lifetime access</p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold text-green-600">Free</span>
                  <p className="text-xs text-gray-400 mt-1">No purchase required</p>
                </div>
              )}
            </div>

            {/* What you get */}
            <div className="space-y-2 mb-5">
              {[
                "Full document access",
                "Download anytime",
                "View on any device",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500" />
                  {f}
                </div>
              ))}
            </div>

            {/* CTA */}
            {isLocked ? (
              <button
                onClick={handleBuy}
                disabled={purchasing}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                {"Buy for ₹" + content.priceInr}
              </button>
            ) : (

              <a

                href={"http://localhost:3001" + content.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={15} />
                {"Download Free"}
              </a>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
            )}



            {/* Uploader info */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">
                  {content.uploader.userName[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Uploaded by</p>
                <p className="text-sm font-medium text-gray-900">@{content.uploader.userName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
