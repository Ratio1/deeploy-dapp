'use client';

import { Button } from '@heroui/button';
import { SelectItem } from '@heroui/select';
import { config, environment, getDevAddress, isUsingDevAddress } from '@lib/config';
import { InteractionContextType, useInteractionContext } from '@lib/contexts/interaction';
import { deepSort } from '@lib/utils';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import StyledSelect from '@shared/StyledSelect';
import StyledTextarea from '@shared/StyledTextarea';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount, useSignMessage } from 'wagmi';

function buildMessage(data: Record<string, any>): string {
    console.log('buildMessage', data);

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
    const { openSignMessageModal, closeSignMessageModal } = useInteractionContext() as InteractionContextType;

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const [isLoading, setLoading] = useState(false);

    const [userInput, setUserInput] = useState<string>('');
    const [responseInput, setResponseInput] = useState<string>('');
    const [endpoint, setEndpoint] = useState<string>('/create_pipeline');
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        const nonce = `0x${Date.now().toString(16)}`;

        console.log(nonce);

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

    const onSend = async () => {
        setLoading(true);

        try {
            const parsed = JSON.parse(userInput).request;
            const message = buildMessage(parsed);

            console.log(JSON.stringify(message));

            openSignMessageModal();

            const signature = await signMessageAsync({
                account: address,
                message,
            });

            closeSignMessageModal();

            console.log('Signature', signature);

            const request = {
                ...parsed,
                EE_ETH_SIGN: signature,
                EE_ETH_SENDER: address,
            };

            console.log('Data to send', {
                request,
            });

            const res = await _doPost(`${config.deeployUrl}${endpoint}`, {
                request,
            });

            console.log('Response', res);
            setResponseInput(JSON.stringify(res, null, 2));

            toast.success('Request sent successfully.');
        } catch (error: any) {
            console.error(error);

            if (error.message.includes('Expected') && error.message.includes('JSON')) {
                toast.error('Invalid JSON format.');
            } else {
                if (error?.message.includes('User rejected the request')) {
                    toast.error('Please sign the message to continue.');
                } else {
                    toast.error('Error sending request.');
                }
            }

            closeSignMessageModal();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col gap-6">
            <div className="flex items-start justify-between">
                <div className="col w-full gap-2">
                    <Label value="Endpoint" />

                    <StyledSelect
                        className="max-w-[300px]"
                        selectedKeys={[endpoint]}
                        onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;
                            setEndpoint(selectedKey);
                        }}
                        placeholder="Select an endpoint"
                    >
                        <SelectItem key="/create_pipeline" textValue="/create_pipeline">
                            <div className="row gap-2 py-1">
                                <div className="font-medium">/create_pipeline</div>
                            </div>
                        </SelectItem>
                        <SelectItem key="/delete_pipeline" textValue="/delete_pipeline">
                            <div className="row gap-2 py-1">
                                <div className="font-medium">/delete_pipeline</div>
                            </div>
                        </SelectItem>
                        <SelectItem key="/get_apps" textValue="/get_apps">
                            <div className="row gap-2 py-1">
                                <div className="font-medium">/get_apps</div>
                            </div>
                        </SelectItem>
                    </StyledSelect>
                </div>

                <div className="row gap-1.5">
                    <Label value="Environment:" />

                    <SmallTag variant="blue" isLarge>
                        {environment}
                    </SmallTag>
                </div>
            </div>

            <div className="row gap-4">
                <StyledTextarea
                    inputWrapperClassnames="h-[50vh]!"
                    placeholder="Enter JSON"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    minRows={30}
                    disableAutosize
                />

                <StyledTextarea
                    inputWrapperClassnames="h-[50vh]!"
                    placeholder="Enter JSON"
                    value={responseInput}
                    onChange={(e) => setResponseInput(e.target.value)}
                    minRows={30}
                    disableAutosize
                />
            </div>

            <div className="center-all">
                <Button color="primary" variant="solid" onPress={onSend} isLoading={isLoading}>
                    Sign and send
                </Button>
            </div>
        </div>
    );
}

export default LegacyRequester;
