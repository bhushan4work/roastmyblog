import { ScrapedData, AnalysisResult } from "../types";
import { analyzeStructure } from "../analyzers/structureAnalyzer";
import { analyzeReadability } from "../analyzers/readabilityAnalyzer";

export function runAnalysis(data: ScrapedData): AnalysisResult {
  const issues = [
    ...analyzeStructure(data),
    ...analyzeReadability(data),
  ];

  return { issues };
}
