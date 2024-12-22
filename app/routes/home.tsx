import type { Route } from "./+types/home";
import SketchingCanvas from "~/components/SketchingCanvas/SketchingCanvas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Canvas Zero - Build apps from wireframes using AI" },
    {
      name: "description",
      content: "Build apps from wireframes using AI",
    },
  ];
}

export default function Home() {
  return <SketchingCanvas />;
}
