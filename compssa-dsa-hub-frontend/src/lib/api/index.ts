// Export all API functions for easier imports
export * from "./auth";
export * from "./users";
export {
  getProblems,
  getDailyQuestion,
  getProblemBySlug,
  getProblemById,
  getProblemStats,
  createProblem,
  bulkImportProblems,
  updateProblem,
  deleteProblem,
} from "./problems";
export type { Problem, ProblemDetail } from "./problems";
export * from "./contests";
export * from "./sessions";
export * from "./submissions";
export * from "./leaderboard";
export * from "./achievements";
export * from "./notifications";
export * from "./attendance";
export * from "./activity";
export * from "./github";
export * from "./admin";
export { default as apiClient } from "./client";
