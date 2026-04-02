import { DataType, define, open } from 'ffi-rs'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static ffiRsOpen = open
    public static ffiRsDefine = define

    private static instance?: Libndx

    private libndxPath: string
    private bindings!: LibndxBindings

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
        this.bindings = this.ffiRsDefine({
            create_ble_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            start_ble_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            stop_ble_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            destroy_ble_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            create_ftdi_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            start_ftdi_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            stop_ftdi_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
            destroy_ftdi_backend: {
                library: 'ndx',
                retType: DataType.String,
                paramsType: [DataType.String],
            },
        }) as LibndxBindings
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

    public createBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        return this.bindings.create_ble_backend([deviceUuid])
    }

    public startBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        return this.bindings.start_ble_backend([deviceUuid])
    }

    public stopBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        return this.bindings.stop_ble_backend([deviceUuid])
    }

    public destroyBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        return this.bindings.destroy_ble_backend([deviceUuid])
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.create_ftdi_backend([serialNumber])
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.start_ftdi_backend([serialNumber])
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.stop_ftdi_backend([serialNumber])
    }

    private get ffiRsOpen() {
        return LibndxAdapter.ffiRsOpen
    }

    private get ffiRsDefine() {
        return LibndxAdapter.ffiRsDefine
    }
}

export interface Libndx {
    createBleBackend(options: BleBackendOptions): string
    startBleBackend(options: BleBackendOptions): string
    stopBleBackend(options: BleBackendOptions): string
    destroyBleBackend(options: BleBackendOptions): string
    createFtdiBackend(options: FtdiBackendOptions): string
    startFtdiBackend(options: FtdiBackendOptions): string
    stopFtdiBackend(options: FtdiBackendOptions): string
}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}

export interface BleBackendOptions {
    deviceUuid: string
}

export interface FtdiBackendOptions {
    serialNumber: string
}

export interface LibndxBindings {
    create_ble_backend(args: [string]): string
    start_ble_backend(args: [string]): string
    stop_ble_backend(args: [string]): string
    destroy_ble_backend(args: [string]): string
    create_ftdi_backend(args: [string]): string
    start_ftdi_backend(args: [string]): string
    stop_ftdi_backend(args: [string]): string
    destroy_ftdi_backend(args: [string]): string
}
