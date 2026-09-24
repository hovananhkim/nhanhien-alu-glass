import type { Metadata } from "next";
import TrackOrderClient from "@/components/store/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your NhanHien furniture order status in real time. Enter your order number or email to see your order progress.",
  robots: { index: true, follow: false },
};

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <TrackOrderClient initialQuery={searchParams.q || ""} />;
}
