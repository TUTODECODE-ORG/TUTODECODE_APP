import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebContainer } from '@webcontainer/api';
import 'xterm/css/xterm.css';

export function WASMLab() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        let terminal: XTerminal;

        const init = async () => {
            terminal = new XTerminal({
                cursorBlink: true,
                theme: {
                    background: '#020617',
                    foreground: '#94a3b8',
                },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
            });

            const fitAddon = new FitAddon();
            terminal.loadAddon(fitAddon);

            if (terminalRef.current) {
                terminal.open(terminalRef.current);
                fitAddon.fit();

                const handleResize = () => fitAddon.fit();
                window.addEventListener('resize', handleResize);
                // @ts-ignore
                terminal.onDispose(() => window.removeEventListener('resize', handleResize));
            }

            terminal.writeln('🚀 INITIALISATION DU LABORATOIRE GHOST v3.0...');

            try {
                const wc = await WebContainer.boot();
                setWebcontainer(wc);
                terminal.writeln('✓ WebContainer chargé.');

                const shellProcess = await wc.spawn('jsh', {
                    terminal: {
                        cols: terminal.cols,
                        rows: terminal.rows,
                    },
                });

                shellProcess.output.pipeTo(new WritableStream({
                    write(data) {
                        terminal.write(data);
                    }
                }));

                const input = shellProcess.input.getWriter();
                terminal.onData((data) => {
                    input.write(data);
                });

            } catch (err) {
                terminal.writeln('\x1b[31m❌ Échec de l\'initialisation du WebContainer.\x1b[0m');
                terminal.writeln('Note: WebContainers nécessitent un navigateur moderne et HTTPS.');
            }
        };

        init();

        return () => {
            terminal?.dispose();
        };
    }, []);

    return (
        <div className="w-full h-[500px] bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-2xl">
            <div ref={terminalRef} className="w-full h-full" />
        </div>
    );
}
