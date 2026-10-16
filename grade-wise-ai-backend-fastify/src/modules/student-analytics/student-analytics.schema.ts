import { z } from "zod";

export const TimeRangeEnum = z.enum(["7d", "30d", "90d", "all"]);
export type TimeRange = z.infer<typeof TimeRangeEnum>;

export const StudentPerformanceQuerySchema = z.object({
  timeRange: TimeRangeEnum.optional().default("30d"),
});
export type StudentPerformanceQuery = z.infer<typeof StudentPerformanceQuerySchema>;
