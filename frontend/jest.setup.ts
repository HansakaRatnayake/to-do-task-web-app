// jest.setup.ts

// Mock import.meta.env for Jest
Object.defineProperty(global, "importMeta", {
    value: {
        env: {
            VITE_API_BASE_URL: "http://localhost:5000", // replace with your test API URL
        },
    },
});

// For ts-jest to access it
(global as any).import = (global as any).importMeta;
