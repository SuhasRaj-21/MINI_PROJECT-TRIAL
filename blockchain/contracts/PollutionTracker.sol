// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PollutionTracker {
    address public admin;

    struct Record {
        string zone;
        uint256 aqi;
        string riskLevel;
        uint256 timestamp;
        string dataHash;
    }

    Record[] private records;

    event RecordAdded(
        uint256 indexed id,
        string zone,
        uint256 aqi,
        string riskLevel,
        uint256 timestamp,
        string dataHash
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addRecord(
        string calldata _zone,
        uint256 _aqi,
        string calldata _riskLevel,
        uint256 _timestamp,
        string calldata _dataHash
    ) external onlyAdmin {
        records.push(Record({
            zone: _zone,
            aqi: _aqi,
            riskLevel: _riskLevel,
            timestamp: _timestamp,
            dataHash: _dataHash
        }));

        emit RecordAdded(records.length - 1, _zone, _aqi, _riskLevel, _timestamp, _dataHash);
    }

    function getRecord(uint256 _index) external view returns (Record memory) {
        require(_index < records.length, "Record does not exist");
        return records[_index];
    }

    function getAllRecords() external view returns (Record[] memory) {
        return records;
    }

    function verifyHash(uint256 _index, string calldata _hash) external view returns (bool) {
        require(_index < records.length, "Record does not exist");
        return keccak256(abi.encodePacked(records[_index].dataHash)) == keccak256(abi.encodePacked(_hash));
    }

    function totalRecords() external view returns (uint256) {
        return records.length;
    }
}
