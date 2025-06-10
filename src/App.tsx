import { Button } from '@heroui/button';
import { useState } from 'react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="center-all h-full w-full p-12">
            <div className="col gap-4">
                <div className="bg-blue-100 py-1 text-center font-medium">{count}</div>

                <Button
                    color="default"
                    variant="bordered"
                    onPress={() => {
                        setCount(count + 1);
                    }}
                >
                    Press
                </Button>
            </div>
        </div>
    );
}

export default App;
