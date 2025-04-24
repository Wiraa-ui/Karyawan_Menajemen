// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Langsung redirect ke /login
  redirect("/login");
}
