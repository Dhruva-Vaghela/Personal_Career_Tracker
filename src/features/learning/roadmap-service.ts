import roadmapData from "../../data/roadmap.json";
import type { Roadmap } from "./types";

export const roadmapService = {
  async getRoadmap(): Promise<Roadmap> {
    return roadmapData as unknown as Roadmap;
  }
};
