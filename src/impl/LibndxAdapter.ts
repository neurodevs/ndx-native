import koffi from 'koffi'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static koffiLoad = koffi.load.bind(koffi)
    public static koffiRegister = koffi.register.bind(koffi)
    public static koffiStruct = koffi.struct.bind(koffi)
    public static koffiProto = koffi.proto.bind(koffi)
    public static koffiPointer: typeof koffi.pointer = koffi.pointer.bind(koffi)

    private static charCallbackProto?: ReturnType<typeof koffi.proto>
    private static charCallbackStruct?: ReturnType<typeof koffi.struct>

    private static getCharCallbackProto() {
        if (!this.charCallbackProto) {
            this.charCallbackProto = LibndxAdapter.koffiProto(
                'void CharCallbackFn(uint8 *data, int length, double timestamp)'
            )
        }
        return this.charCallbackProto
    }

    private static getCharCallbackStruct() {
        if (!this.charCallbackStruct) {
            this.getCharCallbackProto()
            this.charCallbackStruct = LibndxAdapter.koffiStruct(
                'CharCallback',
                {
                    charUuid: 'str',
                    charName: 'str',
                    onData: LibndxAdapter.koffiPointer(this.charCallbackProto!),
                }
            )
        }
        return this.charCallbackStruct
    }

    private static instance?: Libndx

    private libndxPath: string
    private bindings!: LibndxBindings
    private registeredCallbacks: unknown[] = []

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

    public static resetKoffiCache() {
        delete this.charCallbackProto
        delete this.charCallbackStruct
    }

    private tryToLoadBindings() {
        try {
            this.defineBindings()
        } catch (err: unknown) {
            this.throwFailedToLoadLibndx(err as Error)
        }
    }

    private defineBindings() {
        LibndxAdapter.getCharCallbackStruct()
        const lib = LibndxAdapter.koffiLoad(this.libndxPath)

        const wrap1 = (f: (a: string) => string) => (args: [string]) =>
            f(args[0])

        const wrap3 =
            (f: (a: string, b: string, c: string) => string) =>
            (args: [string, string, string]) =>
                f(args[0], args[1], args[2])

        const wrapStartBle =
            (f: (a: string, b: unknown, c: number) => string) =>
            (args: [string, unknown, number]) =>
                f(args[0], args[1], args[2])

        this.bindings = {
            create_ble_backend: wrap1(
                lib.func('str create_ble_backend(str config)')
            ),
            start_ble_backend: wrapStartBle(
                lib.func(
                    'str start_ble_backend(str uuid, CharCallback *callbacks, int num_callbacks)'
                )
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

        const result = this.bindings.create_ble_backend([configJson])
        return JSON.parse(result)
    }

    public startBleBackend(options: StartBleBackendOptions) {
        const { deviceUuid, charCallbacks } = options

        this.registeredCallbacks = charCallbacks.map(
            ({ charUuid, charName, onData }) => ({
                charUuid,
                charName,
                onData: LibndxAdapter.koffiRegister(
                    onData,
                    LibndxAdapter.koffiPointer(
                        LibndxAdapter.getCharCallbackProto()!
                    )
                ),
            })
        )

        const result = this.bindings.start_ble_backend([
            deviceUuid,
            this.registeredCallbacks,
            this.registeredCallbacks.length,
        ])
        return JSON.parse(result)
    }

    public writeBleCharacteristic(options: WriteBleCharacteristicOptions) {
        const { deviceUuid, charUuid: characteristicUuid, value } = options

        const result = this.bindings.write_ble_characteristic([
            deviceUuid,
            characteristicUuid,
            value,
        ])
        return JSON.parse(result)
    }

    public readBleRssi(options: BleBackendOptions) {
        const { deviceUuid } = options
        const result = this.bindings.read_ble_rssi([deviceUuid])
        return JSON.parse(result)
    }

    public stopBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        const result = this.bindings.stop_ble_backend([deviceUuid])
        return JSON.parse(result)
    }

    public destroyBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        const result = this.bindings.destroy_ble_backend([deviceUuid])
        return JSON.parse(result)
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        const configJson = JSON.stringify({ serialNumber })

        const result = this.bindings.create_ftdi_backend([configJson])
        return JSON.parse(result)
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return JSON.parse(this.bindings.start_ftdi_backend([serialNumber]))
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        const result = this.bindings.stop_ftdi_backend([serialNumber])
        return JSON.parse(result)
    }

    public destroyFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        const result = this.bindings.destroy_ftdi_backend([serialNumber])
        return JSON.parse(result)
    }
}

export interface Libndx {
    createBleBackend(options: BleBackendOptions): NativeResult
    startBleBackend(options: StartBleBackendOptions): NativeResult
    writeBleCharacteristic(options: WriteBleCharacteristicOptions): NativeResult
    readBleRssi(options: BleBackendOptions): NativeResult
    stopBleBackend(options: BleBackendOptions): NativeResult
    destroyBleBackend(options: BleBackendOptions): NativeResult
    createFtdiBackend(options: FtdiBackendOptions): NativeResult
    startFtdiBackend(options: FtdiBackendOptions): NativeResult
    stopFtdiBackend(options: FtdiBackendOptions): NativeResult
    destroyFtdiBackend(options: FtdiBackendOptions): NativeResult
}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}

export interface BleBackendOptions {
    deviceUuid: string
}

export interface StartBleBackendOptions extends BleBackendOptions {
    charCallbacks: CharacteristicCallback[]
}

export interface WriteBleCharacteristicOptions {
    deviceUuid: string
    charUuid: string
    value: string
}

export interface CharacteristicCallback {
    charUuid: string
    charName?: string
    onData: (data: Buffer, length: number, timestamp: number) => void
}

export interface FtdiBackendOptions {
    serialNumber: string
}

export interface LibndxBindings {
    create_ble_backend(args: [string]): string
    start_ble_backend(args: [string, unknown, number]): string
    write_ble_characteristic(args: [string, string, string]): string
    read_ble_rssi(args: [string]): string
    stop_ble_backend(args: [string]): string
    destroy_ble_backend(args: [string]): string
    create_ftdi_backend(args: [string]): string
    start_ftdi_backend(args: [string]): string
    stop_ftdi_backend(args: [string]): string
    destroy_ftdi_backend(args: [string]): string
}

export interface NativeResult {
    status: number
    error?: string
}
