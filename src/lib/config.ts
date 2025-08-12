import { EthAddress } from '@typedefs/blockchain';
import { addSeconds } from 'date-fns';
import { Chain } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';

// TODO: Clean-up unused values

type Config = {
    deeployUrl: string;
    backendUrl: string;
    oraclesUrl: string;
    poAIManagerContractAddress: EthAddress;
    r1ContractAddress: EthAddress;
    ndContractAddress: EthAddress;
    mndContractAddress: EthAddress;
    safeAddress: EthAddress;
    usdcContractAddress: EthAddress;
    explorerUrl: string;
    genesisDate: Date;
    epochDurationInSeconds: number;
    networks: [Chain, ...Chain[]];
};

const configs: {
    [key in 'mainnet' | 'testnet' | 'devnet']: Config;
} = {
    mainnet: {
        deeployUrl: 'https://deeploy-api.ratio1.ai',
        backendUrl: 'https://dapp-api.ratio1.ai',
        oraclesUrl: 'https://oracle.ratio1.ai',
        poAIManagerContractAddress: '0xa8d7FFCE91a888872A9f5431B4Dd6c0c135055c1',
        r1ContractAddress: '0x6444C6c2D527D85EA97032da9A7504d6d1448ecF',
        ndContractAddress: '0xE658DF6dA3FB5d4FBa562F1D5934bd0F9c6bd423',
        mndContractAddress: '0x0C431e546371C87354714Fcc1a13365391A549E2',
        safeAddress: '0x2265539ae09c7A605A707E11a6ED4aF1d018750e',
        usdcContractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        explorerUrl: 'https://basescan.org',
        genesisDate: new Date('2025-05-23T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        networks: [base],
    },
    testnet: {
        deeployUrl: 'https://testnet-deeploy-api.ratio1.ai',
        backendUrl: 'https://testnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://testnet-oracle.ratio1.ai',
        poAIManagerContractAddress: '0xCc7C4e0f4f25b57807F34227Fb446E68c8c36ce5',
        r1ContractAddress: '0xCC96f389F45Fc08b4fa8e2bC4C7DA9920292ec64',
        ndContractAddress: '0x18E86a5829CA1F02226FA123f30d90dCd7cFd0ED',
        mndContractAddress: '0xa8d7FFCE91a888872A9f5431B4Dd6c0c135055c1',
        safeAddress: '0x5afF90797f717Fe8432A1809b6b53A18863061D6',
        usdcContractAddress: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-05-23T16:00:00.000Z'),
        epochDurationInSeconds: 86400, // 24 hours
        networks: [baseSepolia],
    },
    devnet: {
        deeployUrl: 'https://devnet-deeploy-api.ratio1.ai', // 'https://2b1e1f9b0d35.ratio1.link' // 'https://devnet-deeploy-api.ratio1.ai'
        backendUrl: 'https://devnet-dapp-api.ratio1.ai',
        oraclesUrl: 'https://devnet-oracle.ratio1.ai',
        poAIManagerContractAddress: '0xCc7C4e0f4f25b57807F34227Fb446E68c8c36ce5',
        r1ContractAddress: '0x277CbD0Cf25F4789Bc04035eCd03d811FAf73691',
        ndContractAddress: '0x90025B92240E3070d5CdcB3f44D6411855c55a73',
        mndContractAddress: '0x17B8934dc5833CdBa1eF42D13D65D677C4727748',
        safeAddress: '0x20b1ebc9c13A6F4f3dfBdF9bc9299ec40Ac988e3',
        usdcContractAddress: '0xfD9A4a17D76087f7c94950b67c3A5b7638427ECF',
        explorerUrl: 'https://sepolia.basescan.org',
        genesisDate: new Date('2025-06-30T07:00:00.000Z'),
        epochDurationInSeconds: 3600, // 1 hour
        networks: [baseSepolia],
    },
};

const domain = window.location.hostname;

const domainMainnet = 'deeploy.ratio1.ai';
const domainDevnet = 'devnet-deeploy.ratio1.ai';
const domainTestnet = 'testnet-deeploy.ratio1.ai';

export const domains = {
    mainnet: domainMainnet,
    devnet: domainDevnet,
    testnet: domainTestnet,
};

export const environment: 'mainnet' | 'testnet' | 'devnet' =
    domain === domainMainnet
        ? ('mainnet' as const)
        : domain === domainDevnet
          ? ('devnet' as const)
          : domain === domainTestnet
            ? ('testnet' as const)
            : ('devnet' as const);

export const config = configs[environment];

export const projectId = '80c4246b66c9d5c722dcd0874be1647e';

export const getCurrentEpoch = () =>
    Math.floor((Date.now() / 1000 - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getNextEpochTimestamp = (): Date =>
    addSeconds(config.genesisDate, (getCurrentEpoch() + 1) * config.epochDurationInSeconds);

export const getLicenseAssignEpoch = (assignTimestamp: bigint) =>
    Math.floor((Number(assignTimestamp) - config.genesisDate.getTime() / 1000) / config.epochDurationInSeconds);

export const getDevAddress = (): {
    address: EthAddress;
} => ({
    address: import.meta.env.VITE_DEV_ADDRESS,
});

export const isUsingDevAddress = process.env.NODE_ENV === 'development' && false;
