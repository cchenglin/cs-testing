async function main() {
  const Recorder = await ethers.getContractFactory("AttendanceRecorder");
  const recorder = await Recorder.deploy();
  await recorder.waitForDeployment();

  const addr = await recorder.getAddress();
  console.log("✅ AttendanceRecorder deployed to:", addr);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
