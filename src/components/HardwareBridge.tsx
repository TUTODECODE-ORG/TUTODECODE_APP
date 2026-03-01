import { useState, useEffect } from 'react';
import { Usb, RefreshCw, Zap, Monitor, Activity, Radio } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HardwareBridge() {
    const [devices, setDevices] = useState<any[]>([]);
    const [isSupported, setIsSupported] = useState(false);
    const [scanActive, setScanActive] = useState(false);

    useEffect(() => {
        // Safe check for USB API availability
        if (typeof navigator !== 'undefined' && 'usb' in navigator) {
            try {
                // @ts-ignore - TS might not know about usb in standard lib
                navigator.usb.getDevices().then(devices => setDevices(devices)).catch(e => console.warn("USB Access denied", e));
                setIsSupported(true);

                // @ts-ignore
                navigator.usb.addEventListener('connect', (event) => {
                    setDevices(prev => [...prev, (event as any).device]);
                });

                // @ts-ignore
                navigator.usb.addEventListener('disconnect', (event) => {
                    setDevices(prev => prev.filter(d => d !== (event as any).device));
                });
            } catch (e) {
                console.warn("WebUSB check failed", e);
                setIsSupported(false);
            }
        } else {
            setIsSupported(false);
        }
    }, []);

    const requestDevice = async () => {
        try {
            setScanActive(true);
            if (!('usb' in navigator)) return;

            // @ts-ignore
            const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x2341 }] }); // Arduino example
            // In a real scenario, we would open a session here
            console.log("Device selected:", device);
            // Re-fetch list
            // @ts-ignore
            const d = await navigator.usb.getDevices();
            setDevices(d);
        } catch (err) {
            console.log("User cancelled scan or error:", err);
        } finally {
            setScanActive(false);
        }
    };

    return (
        <Card className="bg-zinc-900 border border-zinc-700 overflow-hidden relative group">
            <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(0deg,transparent,black)]" />

            <CardHeader className="relative z-10 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <Usb className="w-5 h-5 text-indigo-400" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo- to-indigo-">
                            Cyber-Physical Bridge
                        </span>
                    </CardTitle>
                    <Badge variant={isSupported ? "outline" : "destructive"} className="font-mono text-[10px]">
                        {isSupported ? 'WEBUSB READY' : 'UNSUPPORTED'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${devices.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                        <span className="text-sm text-zinc-400 font-mono">
                            {devices.length} DEVICE(S) CONNECTED
                        </span>
                    </div>
                    {isSupported && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs bg-indigo-/10 text-indigo-400 hover:bg-indigo-/20 border-indigo-/30"
                            onClick={requestDevice}
                            disabled={scanActive}
                        >
                            {scanActive ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                            SCAN BUS
                        </Button>
                    )}
                </div>

                {devices.length > 0 && (
                    <div className="space-y-2">
                        {devices.map((device, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300 p-2 bg-zinc-800/50 rounded">
                                <Monitor className="w-3 h-3" />
                                <span className="font-mono">
                                    VID:{device.vendorId.toString(16).padStart(4, '0').toUpperCase()}
                                    PID:{device.productId.toString(16).padStart(4, '0').toUpperCase()}
                                </span>
                                <span className="ml-auto text-[10px] text-green-500 flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> LIVE
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2 mt-2">
                    <Radio className="w-3 h-3" />
                    LISTENING FOR HID/USB EVENTS...
                </div>
            </CardContent>
        </Card>
    );
}
