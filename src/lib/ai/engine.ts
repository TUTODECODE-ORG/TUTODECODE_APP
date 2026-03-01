// SPDX-License-Identifier: MIT
// TUTODECODE AI bridge integration layer
// @ts-nocheck
type InitProgressReport = {
    progress: number;
    text: string;
};

type MLCEngine = any;

const PRIMARY_MODEL_ID = "SmolLM2-135M-Instruct-q0f32-MLC";
const PRIMARY_MODEL = "https://huggingface.co/mlc-ai/SmolLM2-135M-Instruct-q0f32-MLC";
const PRIMARY_MODEL_LIB = "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_80/SmolLM2-135M-Instruct-q0f32-ctx4k_cs1k-webgpu.wasm";

const FALLBACK_MODEL_ID = "SmolLM2-360M-Instruct-q4f32_1-MLC";
const FALLBACK_MODEL = "https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f32_1-MLC";
const FALLBACK_MODEL_LIB = "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_80/SmolLM2-360M-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm";

const WEBLLM_CDN_CANDIDATES = [
    'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.80/+esm'
];

let engine: MLCEngine | null = null;
let createMLCEngineRef: ((model: string, options?: any) => Promise<MLCEngine>) | null = null;

const ensureWebLLMLoader = async () => {
    if (createMLCEngineRef) return createMLCEngineRef;

    let lastError: unknown = null;

    for (const candidate of WEBLLM_CDN_CANDIDATES) {
        try {
            const webLLMModule = await import(
                /* @vite-ignore */ candidate
            );

            if (typeof webLLMModule.CreateMLCEngine === 'function') {
                createMLCEngineRef = webLLMModule.CreateMLCEngine;
                return createMLCEngineRef;
            }
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Impossible de charger WebLLM (CDN indisponible).');
};

const createAppConfig = (model: string, modelId: string, modelLib: string) => ({
    useIndexedDBCache: false,
    model_list: [
        {
            model,
            model_id: modelId,
            model_lib: modelLib,
            low_resource_required: true,
            overrides: { context_window_size: 1024 }
        }
    ]
});

const isRuntimeMismatchError = (error: unknown) => {
    const message = String((error as any)?.message || error || '').toLowerCase();
    return message.includes('detectgpudevice') || message.includes('wasm') || message.includes('exports');
};

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export const initEngine = async (
    onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngine> => {
    if (engine) return engine;

    try {
        console.log('Initializing AI Engine with Model:', PRIMARY_MODEL_ID);
        const createMLCEngine = await ensureWebLLMLoader();

        engine = await createMLCEngine(PRIMARY_MODEL_ID, {
            initProgressCallback: onProgress,
            logLevel: 'INFO',
            appConfig: createAppConfig(PRIMARY_MODEL, PRIMARY_MODEL_ID, PRIMARY_MODEL_LIB)
        });
        return engine;
    } catch (error) {
        console.warn('Primary WebLLM init failed, retrying with fallback model...', error);

        if (isRuntimeMismatchError(error)) {
            try {
                const createMLCEngine = await ensureWebLLMLoader();
                engine = await createMLCEngine(FALLBACK_MODEL_ID, {
                    initProgressCallback: onProgress,
                    logLevel: 'INFO',
                    appConfig: createAppConfig(FALLBACK_MODEL, FALLBACK_MODEL_ID, FALLBACK_MODEL_LIB)
                });
                return engine;
            } catch (fallbackError) {
                console.error('Fallback WebLLM init failed:', fallbackError);
                throw fallbackError;
            }
        }

        console.error('Failed to initialize WebLLM engine:', error);
        throw error;
    }
};

export const generateResponse = async (
    messages: ChatMessage[],
    onUpdate: (currentText: string) => void
) => {
    if (!engine) throw new Error("Engine not initialized");

    const chunks = await engine.chat.completions.create({
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
    });

    let fullResponse = "";
    for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        onUpdate(fullResponse);
    }

    return fullResponse;
};

export const isEngineReady = () => !!engine;
