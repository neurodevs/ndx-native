import koffi from 'koffi'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static koffiLoad: typeof koffi.load = koffi.load.bind(koffi)
    public static koffiRegister = koffi.register.bind(koffi)

    private static readonly dataCallbackProto = koffi.proto(
        'void DataCallback(uint8 *data, int length, double timestamp)'
    )

    private static instance?: Libndx

    private libndxPath: string
    private bindings!: LibndxBindings

    protected constructor(options?: LibndxAdapterOptions) {
        const { libndxPath = '/opt/local/lib/libndx.dylib' } = options ?? {}

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
            this.defineBindings()
        } catch (err: unknown) {
            this.throwFailedToLoadLibndx(err as Error)
        }
    }

    private defineBindings() {
        const lib = LibndxAdapter.koffiLoad(this.libndxPath)

        const wrap1 = (f: (a: string) => string) => (args: [string]) =>
            f(args[0])

        const wrap2 =
            (f: (a: string, b: unknown) => string) =>
            (args: [string, unknown]) =>
                f(args[0], args[1])

        const wrap3 =
            (f: (a: string, b: string, c: string) => string) =>
            (args: [string, string, string]) =>
                f(args[0], args[1], args[2])

        this.bindings = {
            create_ble_backend: wrap1(
                lib.func('str create_ble_backend(str config)')
            ),
            start_ble_backend: wrap2(
                lib.func('str start_ble_backend(str uuid, DataCallback *cb)')
            ),
            write_ble_characteristic: wrap3(
                lib.func(
                    'str write_ble_characteristic(str uuid, str charUuid, str value)'
                )
            ),
            read_ble_rssi: wrap1(lib.func('str read_ble_rssi(str uuid)')),
            stop_ble_backend: wrap1(lib.func('str stop_ble_backend(str uuid)')),
            destroy_ble_backend: wrap1(
                lib.func('str destroy_ble_backend(str uuid)')
            ),
            create_ftdi_backend: wrap1(
                lib.func('str create_ftdi_backend(str config)')
            ),
            start_ftdi_backend: wrap1(
                lib.func('str start_ftdi_backend(str serial)')
            ),
            stop_ftdi_backend: wrap1(
                lib.func('str stop_ftdi_backend(str serial)')
            ),
            destroy_ftdi_backend: wrap1(
                lib.func('str destroy_ftdi_backend(str serial)')
            ),
        }
    }

    private throwFailedToLoadLibndx(err: Error) {
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
        const configJson = JSON.stringify({ uuid: deviceUuid })
        return this.bindings.create_ble_backend([configJson])
    }

    public startBleBackend(options: StartBleBackendOptions) {
        const { deviceUuid, onData } = options

        const cb = LibndxAdapter.koffiRegister(
            onData,
            koffi.pointer(LibndxAdapter.dataCallbackProto)
        )
        return this.bindings.start_ble_backend([deviceUuid, cb])
    }

    public writeBleCharacteristic(options: BleWriteOptions) {
        const { deviceUuid, characteristicUuid, value } = options
        return this.bindings.write_ble_characteristic([
            deviceUuid,
            characteristicUuid,
            value,
        ])
    }

    public readBleRssi(options: BleBackendOptions) {
        const { deviceUuid } = options
        return this.bindings.read_ble_rssi([deviceUuid])
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
        const configJson = JSON.stringify({ serialNumber })
        return this.bindings.create_ftdi_backend([configJson])
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.start_ftdi_backend([serialNumber])
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.stop_ftdi_backend([serialNumber])
    }

    public destroyFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return this.bindings.destroy_ftdi_backend([serialNumber])
    }
}

export interface Libndx {
    createBleBackend(options: BleBackendOptions): string
    startBleBackend(options: StartBleBackendOptions): string
    writeBleCharacteristic(options: BleWriteOptions): string
    readBleRssi(options: BleBackendOptions): string
    stopBleBackend(options: BleBackendOptions): string
    destroyBleBackend(options: BleBackendOptions): string
    createFtdiBackend(options: FtdiBackendOptions): string
    startFtdiBackend(options: FtdiBackendOptions): string
    stopFtdiBackend(options: FtdiBackendOptions): string
    destroyFtdiBackend(options: FtdiBackendOptions): string
}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}

export interface BleBackendOptions {
    deviceUuid: string
}

export interface StartBleBackendOptions extends BleBackendOptions {
    onData: (data: Buffer, length: number, timestamp: number) => void
}

export interface BleWriteOptions {
    deviceUuid: string
    characteristicUuid: string
    value: string
}

export interface FtdiBackendOptions {
    serialNumber: string
}

export interface LibndxBindings {
    create_ble_backend(args: [string]): string
    start_ble_backend(args: [string, unknown]): string
    write_ble_characteristic(args: [string, string, string]): string
    read_ble_rssi(args: [string]): string
    stop_ble_backend(args: [string]): string
    destroy_ble_backend(args: [string]): string
    create_ftdi_backend(args: [string]): string
    start_ftdi_backend(args: [string]): string
    stop_ftdi_backend(args: [string]): string
    destroy_ftdi_backend(args: [string]): string
}
