import { getApps } from '@lib/api/deeploy';
import { buildDeeployMessage, generateNonce } from '@lib/deeploy-utils';
import { EthAddress } from '@typedefs/blockchain';
import { JobType, ProjectPage } from '@typedefs/deeploys';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSignMessage } from 'wagmi';
import { DeploymentContext } from './context';

export const DeploymentProvider = ({ children }) => {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isFetchingApps, setFetchingApps] = useState<boolean>(false);

    // Only 'undefined' if never fetched
    const [isFetchAppsRequired, setFetchAppsRequired] = useState<boolean | undefined>();

    const [jobType, setJobType] = useState<JobType | undefined>();
    const [step, setStep] = useState<number>(1);
    const [projectPage, setProjectPage] = useState<ProjectPage>(ProjectPage.Overview);

    const fetchApps = async () => {
        if (!address) {
            toast.error('Please connect your wallet.');
            return;
        }

        setFetchingApps(true);

        try {
            const request = await signAndBuildGetAppsRequest(address);
            const response = await getApps(request);

            // Setting this to false will trigger a re-render of the App component which in turn will navigate the user to the home page
            setFetchAppsRequired(false);

            console.log(response);
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh running jobs.');
        } finally {
            setFetchingApps(false);
        }
    };

    const signAndBuildGetAppsRequest = async (address: EthAddress) => {
        const nonce = generateNonce();

        const message = buildDeeployMessage({
            nonce,
        });

        const signature = await signMessageAsync({
            account: address,
            message,
        });

        const request = {
            nonce,
            EE_ETH_SIGN: signature,
            EE_ETH_SENDER: address,
        };

        return request;
    };

    return (
        <DeploymentContext.Provider
            value={{
                jobType,
                setJobType,
                step,
                setStep,
                projectPage,
                setProjectPage,
                // Apps
                isFetchAppsRequired,
                setFetchAppsRequired,
                isFetchingApps,
                fetchApps,
            }}
        >
            {children}
        </DeploymentContext.Provider>
    );
};
