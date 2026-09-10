import { redirect } from "next/navigation";

// A raiz do site é o catálogo.
export default function HomePage() {
  redirect("/imoveis");
}
