import { config } from '@lib/config';
import { http, HttpResponse } from 'msw';

const backendUrl = config.backendUrl;
const deeployUrl = config.deeployUrl;
const tunnelsUrl = 'https://1f8b266e9dbf.ratio1.link';

const defaultAccount = {
    email: 'default@example.com',
    emailConfirmed: true,
    pendingEmail: '',
    address: '0x0000000000000000000000000000000000000000',
    applicantType: 'individual',
    uuid: 'default-uuid',
    kycStatus: 'approved',
    isActive: true,
    isBlacklisted: false,
    blacklistedReason: '',
    receiveUpdates: false,
    referral: null,
    usdBuyLimit: 0,
    vatPercentage: 0,
    viesRegistered: false,
};

export const handlers = [
    http.get(`${backendUrl}/accounts/account`, () =>
        HttpResponse.json({
            data: defaultAccount,
            error: '',
        }),
    ),
    http.get(`${backendUrl}/branding/get-platforms`, () =>
        HttpResponse.json({
            data: ['Linkedin'],
            error: '',
        }),
    ),
    http.post(`${backendUrl}/branding/get-brands`, () =>
        HttpResponse.json({
            data: {
                brands: [],
            },
            error: '',
        }),
    ),
    http.post(`${backendUrl}/branding/edit`, () =>
        HttpResponse.json({
            data: {},
            error: '',
        }),
    ),
    http.post(`${backendUrl}/branding/edit-logo`, () =>
        HttpResponse.json({
            data: {},
            error: '',
        }),
    ),
    http.get(`${backendUrl}/branding/get-brand-logo`, () =>
        new HttpResponse(null, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        }),
    ),
    http.post(`${deeployUrl}/get_apps`, () =>
        HttpResponse.json({
            result: {
                status: 'success',
                apps: {},
            },
        }),
    ),
    http.get(`${tunnelsUrl}/check_secrets_exist`, () =>
        HttpResponse.json({
            result: { exists: false },
        }),
    ),
    http.post(`${tunnelsUrl}/get_secrets`, () =>
        HttpResponse.json({
            result: undefined,
        }),
    ),
    http.post(`${tunnelsUrl}/add_secrets`, () =>
        HttpResponse.json({
            result: { success: true },
        }),
    ),
    http.get(`${tunnelsUrl}/get_tunnels`, () =>
        HttpResponse.json({
            result: {},
        }),
    ),
    http.get(`${tunnelsUrl}/get_tunnel`, () =>
        HttpResponse.json({
            result: {
                id: 'tunnel-default',
                status: 'healthy',
                connections: [],
                metadata: {
                    alias: 'default',
                    creator: 'ratio1',
                    dns_name: 'default.example.com',
                    tunnel_token: 'token',
                    custom_hostnames: [],
                    aliases: [],
                },
            },
        }),
    ),
    http.delete(`${tunnelsUrl}/delete_tunnel`, () =>
        HttpResponse.json({
            result: { success: true },
        }),
    ),
    http.post(`${tunnelsUrl}/add_custom_hostname`, () =>
        HttpResponse.json({
            result: { success: true },
        }),
    ),
    http.post(`${tunnelsUrl}/add_alias`, () =>
        HttpResponse.json({
            result: { success: true },
        }),
    ),
    http.post(`${tunnelsUrl}/new_tunnel`, () =>
        HttpResponse.json({
            result: {
                id: 'tunnel-default',
                metadata: {
                    alias: 'default',
                    dns_name: 'default.example.com',
                    tunnel_token: 'token',
                    custom_hostnames: [],
                    aliases: [],
                },
            },
        }),
    ),
    http.post(`${tunnelsUrl}/rename_tunnel`, () =>
        HttpResponse.json({
            result: { success: true },
        }),
    ),
];
