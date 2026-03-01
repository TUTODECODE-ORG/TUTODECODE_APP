import { useState } from 'react';
import { migrateData } from '@/utils/migrate';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function AdminMigration() {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const handleMigration = async () => {
        setStatus('running');
        setLogs(prev => [...prev, 'Starting migration...']);

        try {
            const results = await migrateData();
            console.log(results);
            setLogs(prev => [...prev, `Success: ${results.success}, Failed: ${results.failed}`]);
            results.errors.forEach(err => setLogs(prev => [...prev, `Error: ${err}`]));

            if (results.failed === 0) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err: any) {
            console.error(err);
            setLogs(prev => [...prev, `Fatal error: ${err.message}`]);
            setStatus('error');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle>Admin Migration Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-zinc-950 p-4 rounded-md h-64 overflow-y-auto text-xs font-mono text-zinc-300">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                    {status === 'idle' && <div className="text-zinc-500">Ready to migrate...</div>}
                </div>

                <Button
                    onClick={handleMigration}
                    disabled={status === 'running'}
                    className="w-full"
                >
                    {status === 'running' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {status === 'success' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                    {status === 'error' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                    Start Migration
                </Button>
            </CardContent>
        </Card>
    );
}
