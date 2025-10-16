import { Skeleton } from '@heroui/skeleton';
import { GITHUB_REPO_REGEX } from '@lib/deeploy-utils';
import { extractRepositoryPath, getShortAddressOrHash } from '@lib/utils';
import { CopyableValue } from '@shared/CopyableValue';
import ItemWithBoldValue from '@shared/jobs/ItemWithBoldValue';
import { JobConfigVCSData } from '@typedefs/deeployApi';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import JobSimpleTagsSection from '../JobSimpleTagsSection';
import ConfigSectionTitle from './ConfigSectionTitle';

export default function ConfigWAR({
    vcsData,
    commands,
    image,
}: {
    vcsData: JobConfigVCSData;
    commands?: string[];
    image: string;
}) {
    const [repositoryVisibility, setRepositoryVisibility] = useState<'public' | 'private' | '—' | undefined>();

    useEffect(() => {
        if (vcsData) {
            fetchRepositoryVisibility(vcsData.REPO_URL);
        }
    }, [vcsData]);

    const fetchRepositoryVisibility = async (url: string) => {
        const match = url.match(GITHUB_REPO_REGEX);

        if (!match) {
            console.error('Not a valid GitHub repository URL');
            setRepositoryVisibility('—');
            return;
        }

        const [, owner, rawRepo] = match;
        const repo = rawRepo.replace(/\.git$/i, '');

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

            if (!response.ok) {
                throw new Error(`GitHub repository lookup failed with status ${response.status}`);
            }

            setRepositoryVisibility('public');
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                return;
            }

            console.error('Repository visibility is: private');
            setRepositoryVisibility('private');
        }
    };

    return (
        <>
            <ConfigSectionTitle title="Worker App Runner" />

            <div className="grid grid-cols-2 gap-3">
                <ItemWithBoldValue
                    label="GitHub Repository"
                    value={<CopyableValue value={vcsData.REPO_URL}>{extractRepositoryPath(vcsData.REPO_URL)}</CopyableValue>}
                />

                <ItemWithBoldValue
                    label="Repository Visibility"
                    value={repositoryVisibility ?? <Skeleton className="my-0.5 min-h-5 w-20 rounded-md" />}
                    capitalize
                />

                <ItemWithBoldValue label="GitHub Username" value={vcsData.USERNAME || '—'} />

                <ItemWithBoldValue
                    label="Personal Access Token"
                    value={
                        vcsData.TOKEN ? (
                            <CopyableValue value={vcsData.TOKEN}>
                                {getShortAddressOrHash(vcsData.TOKEN, 4, false)}
                            </CopyableValue>
                        ) : (
                            '—'
                        )
                    }
                />

                {!!commands && (
                    <ItemWithBoldValue
                        label="Worker Commands"
                        value={isEmpty(commands) ? '—' : <JobSimpleTagsSection array={commands} type="col" label="COMMAND" />}
                    />
                )}

                <ItemWithBoldValue label="Image" value={image} />
            </div>
        </>
    );
}
