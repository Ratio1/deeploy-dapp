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
    onBlur,
    errorMessage,
}: {
    initialValue?: string;
    height?: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    errorMessage?: string;
}) {
    const [code, setCode] = useState(initialValue);

    const handleChange = useCallback(
        (value: string) => {
            setCode(value);
            onChange(value);
        },
        [onChange],
    );

    const handleBlur = useCallback(() => {
        const trimmed = code.trim();

        if (!trimmed) {
            onBlur();
            return;
        }

        try {
            const parsed = JSON.parse(trimmed);
            const formatted = JSON.stringify(parsed, null, 2);

            if (formatted !== code) {
                setCode(formatted);
            }
        } catch {
            onBlur();
            return;
        }

        onBlur();
    }, [code, onBlur]);

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

            {!!errorMessage && (
                <div className="border-default-200 text-danger w-full border-t bg-red-50 px-2 py-1 text-sm">{errorMessage}</div>
            )}
        </div>
    );
}
