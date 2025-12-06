export const CspEscrowAbi = [
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
                indexed: true,
                internalType: 'address',
                name: 'delegate',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'permissions',
                type: 'uint256',
            },
        ],
        name: 'DelegatePermissionsUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'delegate',
                type: 'address',
            },
        ],
        name: 'DelegateRemoved',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'oldJobType',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newJobType',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newPricePerEpoch',
                type: 'uint256',
            },
        ],
        name: 'DeprecatedJobMigrated',
        type: 'event',
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
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'burnCorrection',
                type: 'uint256',
            },
        ],
        name: 'JobBalanceReconciled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'closeTimestamp',
                type: 'uint256',
            },
        ],
        name: 'JobClosed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'jobType',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'pricePerEpoch',
                type: 'uint256',
            },
        ],
        name: 'JobCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newLastExecutionEpoch',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'additionalAmount',
                type: 'uint256',
            },
        ],
        name: 'JobDurationExtended',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'oldLastExecutionEpoch',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newLastExecutionEpoch',
                type: 'uint256',
            },
        ],
        name: 'JobLastExecutionEpochReconciled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newNumberOfNodesRequested',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'additionalAmount',
                type: 'uint256',
            },
        ],
        name: 'JobNodesExtended',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'refundAmount',
                type: 'uint256',
            },
        ],
        name: 'JobRedeemed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'startTimestamp',
                type: 'uint256',
            },
        ],
        name: 'JobStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address[]',
                name: 'activeNodes',
                type: 'address[]',
            },
        ],
        name: 'NodesUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'usdcAmount',
                type: 'uint256',
            },
        ],
        name: 'RewardsAllocatedV3',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'nodeAddr',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'nodeOwner',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'usdcAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'r1Amount',
                type: 'uint256',
            },
        ],
        name: 'RewardsClaimedV2',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'usdcAmount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'r1Amount',
                type: 'uint256',
            },
        ],
        name: 'TokensBurned',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'activeJobs',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'allocateRewardsToNodes',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'nodeAddr',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'nodeOwner',
                type: 'address',
            },
        ],
        name: 'claimRewardsForNode',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'closedJobs',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
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
                components: [
                    {
                        internalType: 'uint256',
                        name: 'jobType',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'projectHash',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastExecutionEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'numberOfNodesRequested',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct JobCreationRequest[]',
                name: 'jobCreationRequests',
                type: 'tuple[]',
            },
        ],
        name: 'createJobs',
        outputs: [
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cspOwner',
        outputs: [
            {
                internalType: 'address',
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
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'newLastExecutionEpoch',
                type: 'uint256',
            },
        ],
        name: 'extendJobDuration',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'newNumberOfNodesRequested',
                type: 'uint256',
            },
        ],
        name: 'extendJobNodes',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getActiveJobs',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'projectHash',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: 'requestTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'startTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastNodesChangeTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'jobType',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pricePerEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastExecutionEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'numberOfNodesRequested',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'balance',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastAllocatedEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address[]',
                        name: 'activeNodes',
                        type: 'address[]',
                    },
                ],
                internalType: 'struct JobDetails[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getActiveJobsCount',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getClosedJobs',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'projectHash',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: 'requestTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'startTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastNodesChangeTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'jobType',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pricePerEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastExecutionEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'numberOfNodesRequested',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'balance',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastAllocatedEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address[]',
                        name: 'activeNodes',
                        type: 'address[]',
                    },
                ],
                internalType: 'struct JobDetails[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getCurrentEpoch',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'delegate',
                type: 'address',
            },
        ],
        name: 'getDelegatePermissions',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getDelegatedAddresses',
        outputs: [
            {
                internalType: 'address[]',
                name: '',
                type: 'address[]',
            },
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getFirstClosableJobId',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
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
                name: 'jobId',
                type: 'uint256',
            },
        ],
        name: 'getJobActiveNodes',
        outputs: [
            {
                internalType: 'address[]',
                name: '',
                type: 'address[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
        ],
        name: 'getJobDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes32',
                        name: 'projectHash',
                        type: 'bytes32',
                    },
                    {
                        internalType: 'uint256',
                        name: 'requestTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'startTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastNodesChangeTimestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'jobType',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'pricePerEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastExecutionEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'numberOfNodesRequested',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'balance',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastAllocatedEpoch',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address[]',
                        name: 'activeNodes',
                        type: 'address[]',
                    },
                ],
                internalType: 'struct JobDetails',
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
                name: 'jobType',
                type: 'uint256',
            },
        ],
        name: 'getPriceForJobType',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTotalJobsBalance',
        outputs: [
            {
                internalType: 'int256',
                name: 'totalBalance',
                type: 'int256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_cspOwner',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_poaiManager',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_usdcToken',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_r1Token',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_controller',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_uniswapV2Router',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_uniswapV2Pair',
                type: 'address',
            },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'jobDetails',
        outputs: [
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256',
            },
            {
                internalType: 'bytes32',
                name: 'projectHash',
                type: 'bytes32',
            },
            {
                internalType: 'uint256',
                name: 'requestTimestamp',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'startTimestamp',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'lastNodesChangeTimestamp',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'jobType',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'pricePerEpoch',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'lastExecutionEpoch',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'numberOfNodesRequested',
                type: 'uint256',
            },
            {
                internalType: 'int256',
                name: 'balance',
                type: 'int256',
            },
            {
                internalType: 'uint256',
                name: 'lastAllocatedEpoch',
                type: 'uint256',
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
        name: 'r1Token',
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
        inputs: [],
        name: 'reconcileAllJobs',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'reconcileJobsBalance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
        ],
        name: 'redeemUnusedJob',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'delegate',
                type: 'address',
            },
        ],
        name: 'removeDelegate',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'delegate',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'permissions',
                type: 'uint256',
            },
        ],
        name: 'setDelegatePermissions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'uniswapV2Pair',
        outputs: [
            {
                internalType: 'contract IUniswapV2Pair',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'uniswapV2Router',
        outputs: [
            {
                internalType: 'contract IUniswapV2Router02',
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
                internalType: 'uint256',
                name: 'jobId',
                type: 'uint256',
            },
            {
                internalType: 'address[]',
                name: 'newActiveNodes',
                type: 'address[]',
            },
        ],
        name: 'updateActiveNodes',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'usdcToken',
        outputs: [
            {
                internalType: 'address',
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
                name: '',
                type: 'address',
            },
        ],
        name: 'virtualWalletBalance',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;
