export default {
    app_alias: 'some_app_name',
    plugin_signature: 'CONTAINER_APP_RUNNER',
    nonce: 0, // hex(int(time() * 1000)), recoverable via int(nonce, 16)
    target_nodes: ['0xai_node_1', '0xai_node_2'],
    target_nodes_count: 0,
    node_res_req: {
        cpu: 4,
        memory: '16GiB',
    },
    app_params: {
        IMAGE: 'repo/image:tag',
        CR_DATA: {
            SERVER: 'docker.io',
            USERNAME: 'user',
            PASSWORD: 'password',
        },
        CONTAINER_RESOURCES: {
            cpu: 1,
            memory: '512m',
            ports: {
                '31250': 1849,
                '31251': 80,
            },
        },
        PORT: 'None',
        NGROK_AUTH_TOKEN: 'None',
        NGROK_EDGE_LABEL: 'None',
        NGROK_ENABLED: 'False',
        NGROK_USE_API: 'True',
        VOLUMES: {
            vol1: '/host/path/vol1',
            vol2: '/host/path/vol2',
        },
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
                    value: 'None',
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
        RESTART_POLICY: 'always',
        IMAGE_PULL_POLICY: 'always',
    },
    pipeline_input_type: 'void',
    pipeline_input_uri: 'None',
    chainstore_response: 'True',
};
