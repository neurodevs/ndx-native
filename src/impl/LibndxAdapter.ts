import { define } from 'ffi-rs'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static ffiRsDefine = define

    private libndxPath: string

    protected constructor(options?: LibndxAdapterOptions) {
        const { libndxPath = '' } = options ?? {}

        this.libndxPath = libndxPath

        this.tryToLoadBindings()
    }

    public static Create(options?: LibndxAdapterOptions) {
        return new (this.Class ?? this)(options)
    }

    private tryToLoadBindings() {
        try {
            this.ffiRsDefine({})
        } catch (err: unknown) {
            this.throwFailedToLoadLiblsl(err as Error)
        }
    }

    private throwFailedToLoadLiblsl(err: Error) {
        throw new Error(
            `
            \n -----------------------------------
            \n Failed to load libxdf! Tried to load from: 
            \n     ${this.libndxPath}
            \n Instructions to save your day (on MacOS):
            \n     1. git clone https://github.com/neurodevs/libxdf.git
            \n     2. cd libxdf && cmake -S . -B build && cmake --build build
            \n     3. sudo cp build/libxdf.dylib /opt/local/lib/
            \n     4. Try whatever you were doing again!
            \n Modify step 3 for your OS if you are not on MacOS.
            \n Check the official repo for OS-specific instructions:
            \n     https://github.com/xdf-modules/libxdf
            \n If you're still unsure, ask an LLM with this error and your OS. 
            \n You could also post an issue on the repo:
            \n     https://github.com/neurodevs/node-xdf/issues
            \n Good luck!
            \n @ericthecurious
            \n -----------------------------------
            \n Original error: ${err.message}
            \n
        `.replace(/\s+/g, '')
        )
    }

    private get ffiRsDefine() {
        return LibndxAdapter.ffiRsDefine
    }
}

export interface Libndx {}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}
