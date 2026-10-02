// Wrangler/esbuild compiles .wasm imports into WebAssembly.Module instances.
declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

// jsquash ships auto-generated ".wasm.d.ts" files next to some binaries that
// describe raw wasm exports; they'd otherwise shadow the wildcard above.
// Wrangler ignores them and yields a compiled module, so re-declare those
// two specifically.
declare module "*squoosh_png_bg.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
declare module "*squoosh_resize_bg.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
