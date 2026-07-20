import { redirect } from "next/navigation";

// Стартовий екран застосунку — Capture.
export default function Home() {
  redirect("/capture");
}
