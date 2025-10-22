import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { useCallback, useState } from 'react';

export default function JsonEditor({
    initialValue = '{}',
    height = '300px',
    onChange,
}: {
    initialValue?: string;
    height?: string;
    onChange: (value: string) => void;
}) {
    const [code, setCode] = useState(initialValue);

    const [isJsonInvalid, setJsonInvalid] = useState<boolean>(false);

    const handleChange = useCallback((value: string) => {
        setCode(value);
        setJsonInvalid(false);
        onChange(value);
    }, []);

    const handleBlur = useCallback(() => {
        const trimmed = code.trim();

        if (!trimmed) {
            return;
        }

        try {
            const parsed = JSON.parse(trimmed);
            const formatted = JSON.stringify(parsed, null, 2);

            if (formatted !== code) {
                setCode(formatted);
            }
        } catch {
            setJsonInvalid(true);
        }
    }, [code]);

    return (
        <div className="border-default-200 col w-full overflow-hidden rounded-lg border">
            <CodeMirror
                value={code}
                height={height}
                basicSetup={{ lineNumbers: true, highlightActiveLine: true }}
                extensions={[json(), linter(jsonParseLinter()), closeBrackets(), keymap.of(closeBracketsKeymap)]}
                onChange={handleChange}
                onBlur={handleBlur}
            />

            {isJsonInvalid && (
                <div className="border-default-200 w-full border-t bg-red-50 px-2 py-1 text-sm text-red-600">Invalid JSON</div>
            )}
        </div>
    );
}
