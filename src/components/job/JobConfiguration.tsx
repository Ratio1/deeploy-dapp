import { getShortAddressOrHash } from '@lib/utils';
import { BorderedCard } from '@shared/cards/BorderedCard';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfig } from '@typedefs/deeployApi';
import { isEmpty } from 'lodash';
import JobDynamicEnvSection from './JobDynamicEnvSection';
import JobKeyValueSection from './JobKeyValueSection';

export default function JobConfiguration({ config }: { config: JobConfig }) {
    return (
        <BorderedCard isLight={false} disableWrapper>
            <div className="col gap-3 p-4">
                <div className="text-lg font-semibold">Configuration</div>

                <div className="col gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <ItemWithBoldValue label="Image" value={config.IMAGE} />
                        <ItemWithBoldValue label="Port" value={config.PORT} />
                        <ItemWithBoldValue label="Tunnel Engine" value={config.TUNNEL_ENGINE} capitalize />
                        <ItemWithBoldValue
                            label="Tunnel Engine Enabled"
                            value={config.TUNNEL_ENGINE_ENABLED.toString()}
                            capitalize
                        />
                        <ItemWithBoldValue label="NGROK Use API" value={config.NGROK_USE_API.toString()} capitalize />

                        <ItemWithBoldValue
                            label="Cloudflare Token"
                            value={
                                config.CLOUDFLARE_TOKEN ? (
                                    <CopyableValue value={config.CLOUDFLARE_TOKEN}>
                                        {getShortAddressOrHash(config.CLOUDFLARE_TOKEN, 6, false)}
                                    </CopyableValue>
                                ) : (
                                    '—'
                                )
                            }
                        />
                        <ItemWithBoldValue label="Restart Policy" value={config.RESTART_POLICY} capitalize />
                        <ItemWithBoldValue label="Image Pull Policy" value={config.IMAGE_PULL_POLICY} capitalize />
                    </div>

                    <ItemWithBoldValue
                        label="ENV Variables"
                        value={isEmpty(config.ENV) ? '—' : <JobKeyValueSection obj={config.ENV} />}
                    />

                    <ItemWithBoldValue
                        label="Volumes"
                        value={isEmpty(config.VOLUMES) ? '—' : <JobKeyValueSection obj={config.VOLUMES} />}
                    />

                    <ItemWithBoldValue
                        label="Dynamic ENV Variables"
                        value={isEmpty(config.DYNAMIC_ENV) ? '—' : <JobDynamicEnvSection dynamicEnv={config.DYNAMIC_ENV} />}
                    />
                </div>
            </div>
        </BorderedCard>
    );
}
