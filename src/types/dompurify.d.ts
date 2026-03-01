declare module 'dompurify' {
    const DOMPurify: {
        sanitize: (source: string | Node, config?: any) => string;
        addHook: (hook: string, cb: (currentNode: Element, data: any, config: any) => void) => void;
        isValidAttribute: (tag: string, attr: string, value: string) => boolean;
        removeHook: (entryPoint: string) => void;
        removeHooks: (entryPoint: string) => void;
        removeAllHooks: () => void;
    };
    export default DOMPurify;
}
