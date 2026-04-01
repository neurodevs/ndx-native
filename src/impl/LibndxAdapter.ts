import { DataType, define, open } from 'ffi-rs'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static ffiRsOpen = open
    public static ffiRsDefine = define

    private static instance?: Libndx

    private libndxPath: string

    protected constructor(options?: LibndxAdapterOptions) {
        const { libndxPath = '' } = options ?? {}

        this.libndxPath = libndxPath

        this.tryToLoadBindings()
    }

    public static getInstance(options?: LibndxAdapterOptions) {
        if (!this.instance) {
            this.setInstance(new this(options))
        }
        return this.instance!
    }

    public static setInstance(instance: Libndx) {
        this.instance = instance
    }

    public static resetInstance() {
        delete this.instance
    }

    private tryToLoadBindings() {
        try {
            this.openLibndx()
            this.defineBindings()
        } catch (err: unknown) {
            this.throwFailedToLoadLiblsl(err as Error)
        }
    }

    private openLibndx() {
        this.ffiRsOpen({
            library: 'ndx',
            path: this.libndxPath,
        })
    }

    private defineBindings() {
        this.ffiRsDefine({
            createBleBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            startBleBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            stopBleBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            destroyBleBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            createFtdiBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            startFtdiBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            stopFtdiBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            destroyFtdiBackend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
        })
    }

    private throwFailedToLoadLiblsl(err: Error) {
        throw new Error(
            `
            \n -----------------------------------
            \n Failed to load libndx! Tried to load from: 
            \n     ${this.libndxPath}
            \n Instructions to save your day (on MacOS):
            \n     1. git clone https://github.com/neurodevs/libndx.git
            \n     2. cd libndx && cmake -S . -B build && cmake --build build
            \n     3. sudo cp build/libndx.dylib /opt/local/lib/
            \n     4. Try whatever you were doing again!
            \n Modify step 3 for your OS if you are not on MacOS.
            \n If you're still unsure, ask an LLM with this error and your OS. 
            \n You could also post an issue on the repo:
            \n     https://github.com/neurodevs/ndx-native/issues
            \n Good luck!
            \n @ericthecurious
            \n -----------------------------------
            \n Original error: ${err.message}
            \n
        `.replace(/\s+/g, '')
        )
    }

    private get ffiRsOpen() {
        return LibndxAdapter.ffiRsOpen
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
