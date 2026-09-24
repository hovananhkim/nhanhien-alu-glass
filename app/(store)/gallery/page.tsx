import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import GalleryClient from "@/components/store/GalleryClient";

export const metadata: Metadata = buildMetadata({
  title: "Project Gallery – Our Work",
  description:
    "Browse NhanHien's portfolio of completed furniture projects — hotels, homes, offices and commercial spaces across India. Handcrafted premium furniture.",
  path: "/gallery",
  keywords: [
    "furniture portfolio India",
    "handcrafted furniture gallery",
    "hotel furniture projects",
    "interior furniture Ahmedabad",
  ],
});

export default function GalleryPage() {
  return <GalleryClient />;
}
