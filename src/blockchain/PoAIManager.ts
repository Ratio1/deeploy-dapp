export const PoAIManagerAbi = [
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
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'OwnableInvalidOwner',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
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
                name: 'oracle',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'remainingCooldownTime',
                type: 'uint256',
            },
        ],
        name: 'ConsensusCooldownEnforced',
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
                name: 'oraclesCount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'proposalsCount',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'maxAgreementCount',
                type: 'uint256',
            },
        ],
        name: 'ConsensusNotReached',
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
            {
                indexed: false,
                internalType: 'address[]',
                name: 'participants',
                type: 'address[]',
            },
        ],
        name: 'ConsensusReachedV2',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'escrow',
                type: 'address',
            },
        ],
        name: 'EscrowDeployed',
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
                indexed: true,
                internalType: 'address',
                name: 'escrow',
                type: 'address',
            },
        ],
        name: 'JobRegistered',
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
                name: 'oracle',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address[]',
                name: 'newActiveNodes',
                type: 'address[]',
            },
            {
                indexed: false,
                internalType: 'bytes32',
                name: 'nodesHash',
                type: 'bytes32',
            },
        ],
        name: 'NodeUpdateSubmittedV2',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
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
                name: 'totalAmount',
                type: 'uint256',
            },
        ],
        name: 'RewardsClaimed',
        type: 'event',
    },
    {
        inputs: [],
        name: 'CONSENSUS_COOLDOWN_PERIOD',
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
                name: '',
                type: 'uint256',
            },
        ],
        name: 'allEscrows',
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
        inputs: [],
        name: 'allocateRewardsAcrossAllEscrows',
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
        ],
        name: 'claimRewardsForNode',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address[]',
                name: 'nodeAddrs',
                type: 'address[]',
            },
        ],
        name: 'claimRewardsForNodes',
        outputs: [],
        stateMutability: 'nonpayable',
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
        inputs: [],
        name: 'cspEscrowBeacon',
        outputs: [
            {
                internalType: 'contract UpgradeableBeacon',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'deployCspEscrow',
        outputs: [],
        stateMutability: 'nonpayable',
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
        name: 'escrowToOwner',
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
        inputs: [],
        name: 'getAllCspsWithOwner',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'cspAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'cspOwner',
                        type: 'address',
                    },
                ],
                internalType: 'struct CspWithOwner[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getAllEscrows',
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
                name: 'nodeAddress',
                type: 'address',
            },
        ],
        name: 'getEscrowsWithRewardsForNode',
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
        inputs: [],
        name: 'getIsLastEpochAllocated',
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
                    {
                        internalType: 'address',
                        name: 'escrowAddress',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'escrowOwner',
                        type: 'address',
                    },
                ],
                internalType: 'struct JobWithAllDetails',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getNewJobId',
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
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
        ],
        name: 'getNodePoAIRewards',
        outputs: [
            {
                internalType: 'uint256',
                name: 'usdcRewards',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'r1Rewards',
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
        name: 'getRemainingCooldownTime',
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
        name: 'getTotalEscrowsBalance',
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
                name: 'oracle',
                type: 'address',
            },
        ],
        name: 'getUnvalidatedJobIds',
        outputs: [
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
        name: 'hasReconciled',
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
                name: '_cspEscrowImplementation',
                type: 'address',
            },
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
                name: '_uniswapV2Router',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_uniswapV2Pair',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'newOwner',
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
        name: 'isJobUnvalidated',
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
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'jobConsensusTimestamp',
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
                name: '',
                type: 'uint256',
            },
        ],
        name: 'jobIdToEscrow',
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
        inputs: [],
        name: 'lastAllocatedEpoch',
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
        name: 'nextJobId',
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
                name: '',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'nodeToEscrowsWithRewards',
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
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'nodesTransactionProposals',
        outputs: [
            {
                internalType: 'address',
                name: 'proposer',
                type: 'address',
            },
            {
                internalType: 'bytes32',
                name: 'newActiveNodesHash',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
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
        name: 'ownerToEscrow',
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
        inputs: [],
        name: 'r1Token',
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
        inputs: [],
        name: 'reconcileAllJobsBalance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
        ],
        name: 'registerNodeWithRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'nodeAddress',
                type: 'address',
            },
        ],
        name: 'removeNodeFromRewardsList',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
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
                internalType: 'address[]',
                name: 'newActiveNodes',
                type: 'address[]',
            },
        ],
        name: 'submitNodeUpdate',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'uniswapV2Pair',
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
        inputs: [],
        name: 'uniswapV2Router',
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
                name: '',
                type: 'uint256',
            },
        ],
        name: 'unvalidatedJobIds',
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
] as const;
