"use client";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardContent {
  id: string;
  title: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "IMAGE";
  isPaid: boolean;
  priceInr?: number;
  university: { name: string };
  uploader: { userName: string };
}

const typeConfig = {
  PDF: { bg: "bg-red-100", text: "text-red-600", label: "PDF" },
  VIDEO: { bg: "bg-purple-100", text: "text-purple-600", label: "VIDEO" },
  DOCUMENT: { bg: "bg-blue-100", text: "text-blue-600", label: "DOC" },
  IMAGE: { bg: "bg-green-100", text: "text-green-600", label: "IMG" },
};

export default function ContentCard({ content }: { content: CardContent }) {
  const router = useRouter();
  const config = typeConfig[content.type] ?? typeConfig.DOCUMENT;

  return (
    <div
      onClick={() => router.push(`/content/${content.id}`)}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className={`${config.bg} h-28 flex flex-col items-start justify-between p-3`}>
        <span className={`text-xs font-bold ${config.text} bg-white px-2 py-0.5 rounded-md`}>
          {config.label}
        </span>
        <div className="self-end">
          {content.isPaid ? (
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Lock size={10} /> ₹{content.priceInr}
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
              FREE
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2">
          {content.title}
        </h3>
        <p className="text-xs text-gray-400 mb-1">{content.university?.name}</p>
        <p className="text-xs text-gray-400">by @{content.uploader?.userName}</p>
      </div>
    </div>
  );
}
