import { config, environment } from '@lib/config';
import { deepSort } from '@lib/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

function buildMessage(data: Record<string, any>): string {
    const cleaned = structuredClone(data);
    delete cleaned.address;
    delete cleaned.signature;

    const sorted = deepSort(cleaned);
    const json = JSON.stringify(sorted, null, 1).replaceAll('": ', '":');
    return `Please sign this message for Deeploy: ${json}`;
}

async function _doPost(endpoint: string, body: any) {
    const { data } = await axios.post(endpoint, body);
    return data.result;
}

function LegacyRequester() {
    const { address } = useAccount();
    const [userInput, setUserInput] = useState<string>('');
    const [responseInput, setResponseInput] = useState<string>('');
    const [endpoint, setEndpoint] = useState<string>('/create_pipeline');
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        const nonce = `0x${Date.now().toString(16)}`;

        if (endpoint === '/get_apps') {
            setUserInput(
                JSON.stringify(
                    {
                        request: {
                            nonce,
                        },
                    },
                    null,
                    2,
                ),
            );
        }

        if (endpoint === '/create_pipeline') {
            setUserInput(
                JSON.stringify(
                    {
                        request: {
                            app_alias: 'some_app_name',
                            plugin_signature: 'SOME_PLUGIN_01',
                            nonce,
                            target_nodes: ['0xai_node_1', '0xETH_ADDR_NODE_2'],
                            target_nodes_count: 0,
                            app_params: {
                                CONTAINER_RESOURCES: {
                                    cpu: 1,
                                    memory: '512m',
                                },

                                CR: 'docker.io',
                                CR_PASSWORD: 'password',
                                CR_USER: 'user',
                                RESTART_POLICY: 'always',
                                IMAGE_PULL_POLICY: 'always',

                                NGROK_EDGE_LABEL: null,
                                NGROK_USE_API: false,

                                ENV: {
                                    ENV1: 'value1',
                                    ENV2: 'value2',
                                    ENV3: 'value3',
                                    ENV4: 'value4',
                                },
                                DYNAMIC_ENV: {
                                    ENV5: [
                                        {
                                            type: 'static',
                                            value: 'http://',
                                        },
                                        {
                                            type: 'host_ip',
                                            value: null,
                                        },
                                        {
                                            type: 'static',
                                            value: ':5080/test_api_endpoint',
                                        },
                                    ],
                                    ENV6: [
                                        {
                                            type: 'host_ip',
                                            value: 'http://',
                                        },
                                    ],
                                },
                                IMAGE: 'repo/image:tag',
                                OTHER_PARAM1: 'value1',
                                OTHER_PARAM2: 'value2',
                                OTHER_PARAM3: 'value3',
                                OTHER_PARAM4: 'value4',
                                OTHER_PARAM5: 'value5',
                                PORT: null,
                            },
                            pipeline_input_type: 'void',
                            pipeline_input_uri: null,
                            chainstore_response: false,
                        },
                    },
                    null,
                    2,
                ),
            );
        }

        if (endpoint === '/delete_pipeline') {
            setUserInput(
                JSON.stringify(
                    {
                        request: {
                            app_id: 'target_app_name_id_returned_by_get_apps_or_create_pipeline',
                            target_nodes: ['0xai_target_node_1', '0xai_target_node_2'],
                            nonce,
                        },
                    },
                    null,
                    2,
                ),
            );
        }
    }, [endpoint]);

    return (
        <div>
            <h3>Environment: {environment}</h3>
            <h3>Endpoint:</h3>
            <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="rounded-md border border-gray-300 p-2"
                style={{
                    width: '100%',
                    height: '50px',
                    marginBottom: '1rem',
                }}
            >
                <option value="/create_pipeline">/create_pipeline</option>
                <option value="/delete_pipeline">/delete_pipeline</option>
                <option value="/get_apps">/get_apps</option>
            </select>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                }}
            >
                <textarea
                    placeholder="Enter JSON"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="rounded-md border border-gray-300 p-2"
                    style={{
                        width: '100%',
                        height: '60vh',
                        marginBottom: '1rem',
                    }}
                />
                <textarea
                    placeholder="Enter JSON"
                    value={responseInput}
                    onChange={(e) => setResponseInput(e.target.value)}
                    className="rounded-md border border-gray-300 p-2"
                    style={{
                        width: '100%',
                        height: '60vh',
                        marginBottom: '1rem',
                    }}
                />
            </div>
            <button
                onClick={async () => {
                    try {
                        const parsed = JSON.parse(userInput).request;
                        const message = buildMessage(parsed);
                        console.log(JSON.stringify(message));
                        const signature = await signMessageAsync({
                            account: address,
                            message,
                        });
                        console.log('Signature:', signature);

                        const request = {
                            ...parsed,
                            EE_ETH_SIGN: signature,
                            EE_ETH_SENDER: address,
                        };
                        console.log('Data to send:', request);

                        const res = await _doPost(`${config.deeployUrl}${endpoint}`, {
                            request,
                        });
                        console.log('Response:', res);
                        setResponseInput(JSON.stringify(res, null, 2));
                    } catch (error) {
                        console.error('Error:', error);
                        alert(`Error: ${error}`);
                    }
                }}
                className="rounded-md bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
                style={{
                    width: '100%',
                    height: '50px',
                }}
            >
                Sign and send
            </button>
        </div>
    );
}

export default LegacyRequester;
