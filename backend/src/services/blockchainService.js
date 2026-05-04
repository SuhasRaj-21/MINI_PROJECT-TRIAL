const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const getContract = () => {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!privateKey || !contractAddress) {
        console.error('Missing blockchain config');
        return null;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Minimal ABI for addRecord
    const abi = [
        "function addRecord(string calldata _zone, uint256 _aqi, string calldata _riskLevel, uint256 _timestamp, string calldata _dataHash) external",
        "function getRecord(uint256 _index) external view returns (tuple(string zone, uint256 aqi, string riskLevel, uint256 timestamp, string dataHash))",
        "function getAllRecords() external view returns (tuple(string zone, uint256 aqi, string riskLevel, uint256 timestamp, string dataHash)[])"
    ];

    return new ethers.Contract(contractAddress, abi, wallet);
};

const logToBlockchain = async (zone, aqi, riskLevel) => {
    try {
        const contract = getContract();
        if (!contract) return false;

        const timestamp = Math.floor(Date.now() / 1000);
        const dataHash = ethers.id(`${zone}-${aqi}-${timestamp}`);

        console.log(`Logging to blockchain: ${zone}, AQI: ${aqi}`);
        const tx = await contract.addRecord(zone, aqi, riskLevel, timestamp, dataHash);
        await tx.wait();
        console.log(`Blockchain logging successful: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error('Blockchain error:', error);
        return null;
    }
};

module.exports = { logToBlockchain, getContract };
