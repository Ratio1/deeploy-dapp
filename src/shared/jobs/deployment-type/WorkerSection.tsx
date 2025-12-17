import { GITHUB_REPO_REGEX } from '@lib/deeploy-utils';
import Label from '@shared/Label';
import { SmallTag } from '@shared/SmallTag';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiInformationLine } from 'react-icons/ri';
import InputWithLabel from '../../InputWithLabel';
import WorkerCommandsSection from './WorkerCommandsSection';

const REPOS_CACHE: Record<string, 'public' | 'private'> = {};

export default function WorkerSection({
    isEditingRunningJob,
    baseName = 'deployment',
}: {
    isEditingRunningJob?: boolean;
    baseName?: string;
}) {
    const { watch, setValue, register } = useFormContext();

    const repositoryUrl: string | undefined = watch(`${baseName}.deploymentType.repositoryUrl`);
    const repositoryVisibility: 'public' | 'private' | undefined = watch(`${baseName}.deploymentType.repositoryVisibility`);

    useEffect(() => {
        register(`${baseName}.deploymentType.repositoryVisibility`);
    }, [register]);

    useEffect(() => {
        if (isEditingRunningJob && repositoryUrl) {
            checkRepositoryVisibility(repositoryUrl);
        }
    }, [isEditingRunningJob, repositoryUrl]);

    const checkRepositoryVisibility = async (value?: string) => {
        const url = value ?? repositoryUrl;

        if (!url) {
            console.error('No repository URL provided');
            setValue(`${baseName}.deploymentType.repositoryVisibility`, undefined);

            return;
        }

        const trimmedUrl = url.trim();
        const match = trimmedUrl.match(GITHUB_REPO_REGEX);

        if (!match) {
            console.error('Not a valid GitHub repository URL');
            setValue(`${baseName}.deploymentType.repositoryVisibility`, undefined);
            return;
        }

        if (REPOS_CACHE[trimmedUrl]) {
            // console.log('Repository visibility cached', REPOS_CACHE[trimmedUrl]);
            setValue(`${baseName}.deploymentType.repositoryVisibility`, REPOS_CACHE[trimmedUrl]);
            return;
        }

        const [, owner, rawRepo] = match;
        const repo = rawRepo.replace(/\.git$/i, '');

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

            if (response.ok) {
                // 200 - Repository is public
                setValue(`${baseName}.deploymentType.repositoryVisibility`, 'public');
                REPOS_CACHE[trimmedUrl] = 'public';
            } else if (response.status === 404) {
                // 404 - Repository is private or doesn't exist
                setValue(`${baseName}.deploymentType.repositoryVisibility`, 'private');
                REPOS_CACHE[trimmedUrl] = 'private';
            } else {
                // Other errors (e.g., 403 rate limit) - default to public (credentials optional)
                // If it's actually private, user will get an error during deployment
                console.warn(`GitHub API returned status ${response.status}, defaulting to public`);
                setValue(`${baseName}.deploymentType.repositoryVisibility`, 'public');
                // Don't cache rate-limited results
            }
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                return;
            }

            // Network error - default to public (credentials optional)
            console.error('Failed to check repository visibility:', error);
            setValue(`${baseName}.deploymentType.repositoryVisibility`, 'public');
            // Don't cache network errors
        }
    };

    return (
        <div className="col gap-4">
            <InputWithLabel
                name={`${baseName}.deploymentType.repositoryUrl`}
                label="GitHub Repository URL"
                placeholder="e.g., https://github.com/org/repository"
                onBlur={() => checkRepositoryVisibility()}
                onPasteValue={(value) => checkRepositoryVisibility(value)}
                customLabel={
                    repositoryVisibility ? (
                        <div className="row gap-1.5">
                            <Label value="GitHub Repository URL" />
                            <SmallTag variant={repositoryVisibility === 'public' ? 'emerald' : 'red'}>
                                <div className="capitalize">{repositoryVisibility}</div>
                            </SmallTag>
                        </div>
                    ) : null
                }
                endContent="paste"
            />

            <InputWithLabel name={`${baseName}.deploymentType.image`} label="Image" placeholder="node:22" />

            {repositoryVisibility === 'public' && (
                <div className="text-warning-800 bg-warning-100 col gap-2 rounded-md p-3 text-sm">
                    <div className="row gap-1.5">
                        <RiInformationLine className="mb-px text-[20px]" />
                        <div className="font-medium">Restricted Monitoring</div>
                    </div>

                    <div>
                        Monitoring public repositories without authentication is limited. Add your GitHub credentials for
                        consistent monitoring.
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <InputWithLabel
                    name={`${baseName}.deploymentType.username`}
                    label="GitHub Username"
                    placeholder="Username"
                    isOptional={repositoryVisibility === 'public'}
                />

                <InputWithLabel
                    name={`${baseName}.deploymentType.accessToken`}
                    label="Personal Access Token"
                    placeholder="None"
                    isOptional={repositoryVisibility === 'public'}
                    endContent="paste"
                />
            </div>

            <WorkerCommandsSection baseName={baseName} />
        </div>
    );
}
