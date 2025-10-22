export const ReaderContractAbi = [
    {
        inputs: [],
        name: 'InvalidInitialization',
        type: 'error',
    },
    {
        inputs: [],
        name: 'NotInitializing',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint64',
                name: 'version',
                type: 'uint64',
            },
        ],
        name: 'Initialized',
        type: 'event',
    },
    {
        inputs: [],
        name: 'controller',
        outputs: [
            {
                internalType: 'contract Controller',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: 'addresses',
                type: 'address[]',
            },
        ],
        name: 'getAddressesBalances',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'addr',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethBalance',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'r1Balance',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct AddressBalances[]',
                name: 'balances',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getAllMndsDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'firstMiningEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'remainingAmount',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct MndDetails[]',
                name: 'mnds',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getLicensesTotalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: 'mndSupply',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'ndSupply',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
        ],
        name: 'getMndLicenseDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'enum LicenseType',
                        name: 'licenseType',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'isBanned',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'usdcPoaiRewards',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'r1PoaiRewards',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct LicenseDetails',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
        ],
        name: 'getNdLicenseDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'enum LicenseType',
                        name: 'licenseType',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'isBanned',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'usdcPoaiRewards',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'r1PoaiRewards',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct LicenseDetails',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'node',
                type: 'address',
            },
        ],
        name: 'getNodeLicenseDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'enum LicenseType',
                        name: 'licenseType',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'isBanned',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'usdcPoaiRewards',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'r1PoaiRewards',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct LicenseDetails',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'node',
                type: 'address',
            },
        ],
        name: 'getNodeLicenseDetailsByNode',
        outputs: [
            {
                internalType: 'uint256',
                name: 'licenseId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'assignTimestamp',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getOraclesDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'oracleAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'signaturesCount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'additionTimestamp',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct OracleDetails[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
        ],
        name: 'getUserLicenses',
        outputs: [
            {
                components: [
                    {
                        internalType: 'enum LicenseType',
                        name: 'licenseType',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'licenseId',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'nodeAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalAssignedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalClaimedAmount',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastClaimEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assignTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'lastClaimOracle',
                        type: 'address',
                    },
                    {
                        internalType: 'bool',
                        name: 'isBanned',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'usdcPoaiRewards',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'r1PoaiRewards',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct LicenseDetails[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'wallet',
                type: 'address',
            },
        ],
        name: 'getWalletNodes',
        outputs: [
            {
                internalType: 'address[]',
                name: 'nodes',
                type: 'address[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
        ],
        name: 'hasOracleNode',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_ndContract',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_mndContract',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_controller',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_r1Contract',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_poaiManager',
                type: 'address',
            },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'mndContract',
        outputs: [
            {
                internalType: 'contract IMND',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'ndContract',
        outputs: [
            {
                internalType: 'contract IND',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'poaiManager',
        outputs: [
            {
                internalType: 'contract IPoAIManager',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'r1Contract',
        outputs: [
            {
                internalType: 'contract R1',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_controller',
                type: 'address',
            },
        ],
        name: 'setController',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_poaiManager',
                type: 'address',
            },
        ],
        name: 'setPoAIManager',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_r1Contract',
                type: 'address',
            },
        ],
        name: 'setR1Contract',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;
