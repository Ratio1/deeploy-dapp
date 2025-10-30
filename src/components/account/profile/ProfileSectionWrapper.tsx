import { BorderedCard } from '@shared/cards/BorderedCard';

export default function ProfileSectionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <BorderedCard disableWrapper>
            <div className="col gap-4 px-4 py-3 sm:px-5 sm:py-4">{children}</div>
        </BorderedCard>
    );
}
