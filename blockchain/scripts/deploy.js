import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying PollutionTracker contract...");

  const PollutionTracker = await hre.ethers.getContractFactory("PollutionTracker");
  const tracker = await PollutionTracker.deploy();

  await tracker.waitForDeployment();
  const address = await tracker.getAddress();

  console.log(`PollutionTracker deployed to: ${address}`);

  // Save the contract's artifact and address to the frontend and backend directories
  saveFrontendFiles(address);
}

function saveFrontendFiles(contractAddress) {
  const contractsDir = path.join(__dirname, "..", "abi");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ PollutionTracker: contractAddress }, undefined, 2)
  );

  const TrackerArtifact = hre.artifacts.readArtifactSync("PollutionTracker");

  fs.writeFileSync(
    path.join(contractsDir, "PollutionTracker.json"),
    JSON.stringify(TrackerArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
