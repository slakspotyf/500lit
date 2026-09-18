import { createFileRoute } from "@tanstack/react-router";
import { HomeApp } from "@/components/app/home-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HomeApp />;
}
