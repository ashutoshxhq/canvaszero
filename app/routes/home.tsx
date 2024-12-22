import type { Route } from "./+types/home";
import SketchingCanvas from "~/components/SketchingCanvas/SketchingCanvas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CanvasZero - Build WebApp from Sketches" },
    {
      name: "description",
      content: "Build WebApps from Sketches using Canvaszero",
    },
  ];
}

export default function Home() {
  return <SketchingCanvas />;
}
