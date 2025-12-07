// 修正後的 Counter.ts (或者建議改名為 AttendanceModule.ts)
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AttendanceModule", (m) => {
  // 1. 確保字串是你的合約名稱
  const attendanceRecorder = m.contract("AttendanceRecorder");

  // 2. 移除不屬於你的合約的方法呼叫
  // 你的合約不需要在部署時呼叫 recordData

  // 3. 回傳部署後的實例
  return { attendanceRecorder };
});