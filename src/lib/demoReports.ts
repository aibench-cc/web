import { seedReport, type Report, type Signal } from "./report";

export function getDemoReport(reportId: string): Report | null {
  if (reportId === "sample-yellow") {
    return { ...seedReport, reportId };
  }
  if (reportId === "sample-green") {
    return demoVariant(reportId, "green", "官方直连表现优秀", "这份示例用于验证旧版绿色报告视觉仍保持不变。");
  }
  if (reportId === "sample-red") {
    return demoVariant(reportId, "red", "发现明显异常,不建议直接采购", "这份示例用于验证旧版红色报告视觉仍保持不变。");
  }
  return null;
}

function demoVariant(
  reportId: string,
  overall: Exclude<Signal, "skipped">,
  verdictTitle: string,
  verdictDetail: string,
): Report {
  return {
    ...seedReport,
    reportId,
    overall,
    verdictTitle,
    verdictDetail,
  };
}
