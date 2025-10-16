import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfigCRData } from '@typedefs/deeployApi';
import ConfigSectionTitle from './ConfigSectionTitle';

export default function ConfigCAR({ crData, image }: { crData?: JobConfigCRData; image: string }) {
    if (!crData) {
        return null;
    }

    return (
        <>
            <ConfigSectionTitle title="Container App Runner" />

            <div className="grid grid-cols-2 gap-3">
                <ItemWithBoldValue label="Image" value={<CopyableValue value={image}>{image}</CopyableValue>} />
                <ItemWithBoldValue label="Container Registry" value={!crData.SERVER ? 'docker.io' : crData.SERVER} />

                {!!crData.USERNAME && !!crData.PASSWORD && (
                    <>
                        <ItemWithBoldValue
                            label="Username"
                            value={<CopyableValue value={crData.USERNAME}>{crData.USERNAME}</CopyableValue>}
                        />
                        <ItemWithBoldValue
                            label="Password"
                            value={
                                <CopyableValue value={crData.PASSWORD}>
                                    <div className="font-roboto-mono font-medium">••••••</div>
                                </CopyableValue>
                            }
                        />
                    </>
                )}
            </div>
        </>
    );
}
