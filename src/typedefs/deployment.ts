enum FormType {
    Generic = 'Generic',
    Native = 'Native',
    Service = 'Service',
}

type Project = {
    id: number;
    name: string;
    color: string;
    datetime: string;
};

export { FormType };
export type { Project };
