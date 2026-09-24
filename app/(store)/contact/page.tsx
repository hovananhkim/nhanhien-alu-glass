import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ContactClient from "@/components/store/ContactClient";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with NhanHien Fine Furniture. Visit our showroom in Ahmedabad, call us, or send a message. We respond within 24 hours.",
  path: "/contact",
  keywords: [
    "furniture showroom Ahmedabad",
    "contact furniture manufacturer",
    "furniture inquiry Gujarat",
  ],
});

export default function ContactPage() {
  return <ContactClient />;
}
