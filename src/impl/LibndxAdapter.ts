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
    private static onDiscoveredProto?: ReturnType<typeof koffi.proto>
    private static onConnectedProto?: ReturnType<typeof koffi.proto>
    private static onRssiProto?: ReturnType<typeof koffi.proto>

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
        delete this.onDiscoveredProto
        delete this.onConnectedProto
        delete this.onRssiProto
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
        LibndxAdapter.getOnDiscoveredProto()
        LibndxAdapter.getOnConnectedProto()
        LibndxAdapter.getOnRssiProto()
        const lib = LibndxAdapter.koffiLoad(this.libndxPath)

        const wrap1 = (f: (a: string) => string) => (args: [string]) =>
            f(args[0])

        const wrap3 =
            (f: (a: string, b: string, c: string) => string) =>
            (args: [string, string, string]) =>
                f(args[0], args[1], args[2])

        const wrapStartBle =
            (f: (a: string, b: unknown, c: unknown, d: number) => string) =>
            (args: [string, unknown, unknown, number]) =>
                f(args[0], args[1], args[2], args[3])

        const wrapSetBleRssiInterval =
            (f: (a: string, b: number, c: unknown) => string) =>
            (args: [string, number, unknown]) =>
                f(args[0], args[1], args[2])

        const wrapDiscoverBleUuid =
            (f: (a: string, b: unknown) => string) =>
            (args: [string, unknown]) =>
                f(args[0], args[1])

        this.bindings = {
            discover_ble_uuid: wrapDiscoverBleUuid(
                lib.func(
                    'str discover_ble_uuid(str name_prefix, OnDiscoveredFn *on_discovered)'
                )
            ),
            create_ble_backend: wrap1(
                lib.func('str create_ble_backend(str config)')
            ),
            start_ble_backend: wrapStartBle(
                lib.func(
                    'str start_ble_backend(str uuid, OnConnectedFn *on_connected, CharCallback *callbacks, int num_callbacks)'
                )
            ),
            write_ble_characteristic: wrap3(
                lib.func(
                    'str write_ble_characteristic(str uuid, str charUuid, str value)'
                )
            ),
            set_ble_rssi_interval: wrapSetBleRssiInterval(
                lib.func(
                    'str set_ble_rssi_interval(str uuid, int interval_ms, OnRssiFn *on_rssi)'
                )
            ),
            stop_ble_backend: wrap1(lib.func('str stop_ble_backend(str uuid)')),
            create_ftdi_backend: wrap1(
                lib.func('str create_ftdi_backend(str config)')
            ),
            start_ftdi_backend: wrap1(
                lib.func('str start_ftdi_backend(str serial)')
            ),
            stop_ftdi_backend: wrap1(
                lib.func('str stop_ftdi_backend(str serial)')
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

    public discoverBleUuid(options: DiscoverBleUuidOptions) {
        const { namePrefix, onDiscovered } = options

        const registeredOnDiscovered = LibndxAdapter.koffiRegister(
            onDiscovered,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnDiscoveredProto()!)
        )

        return JSON.parse(
            this.bindings.discover_ble_uuid([
                namePrefix,
                registeredOnDiscovered,
            ])
        )
    }

    public createBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        const configJson = JSON.stringify({ uuid: deviceUuid })

        return JSON.parse(this.bindings.create_ble_backend([configJson]))
    }

    public startBleBackend(options: StartBleBackendOptions) {
        const { deviceUuid, onConnected, charCallbacks } = options

        const registeredOnConnected = LibndxAdapter.koffiRegister(
            (uuid: string, name: string) => onConnected({ uuid, name }),
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnConnectedProto()!)
        )

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

        return JSON.parse(
            this.bindings.start_ble_backend([
                deviceUuid,
                registeredOnConnected,
                this.registeredCallbacks,
                this.registeredCallbacks.length,
            ])
        )
    }

    public writeBleCharacteristic(options: WriteBleCharacteristicOptions) {
        const { deviceUuid, charUuid: characteristicUuid, value } = options

        return JSON.parse(
            this.bindings.write_ble_characteristic([
                deviceUuid,
                characteristicUuid,
                value,
            ])
        )
    }

    public setBleRssiInterval(options: BleRssiOptions) {
        const { deviceUuid, intervalMs, onRssi } = options

        const registeredOnRssi = LibndxAdapter.koffiRegister(
            onRssi,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnRssiProto()!)
        )

        return JSON.parse(
            this.bindings.set_ble_rssi_interval([
                deviceUuid,
                intervalMs,
                registeredOnRssi,
            ])
        )
    }

    public stopBleBackend(options: BleBackendOptions) {
        const { deviceUuid } = options
        return JSON.parse(this.bindings.stop_ble_backend([deviceUuid]))
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        const configJson = JSON.stringify({ serialNumber })

        return JSON.parse(this.bindings.create_ftdi_backend([configJson]))
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return JSON.parse(this.bindings.start_ftdi_backend([serialNumber]))
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        const { serialNumber } = options
        return JSON.parse(this.bindings.stop_ftdi_backend([serialNumber]))
    }

    private static getCharCallbackProto() {
        if (!this.charCallbackProto) {
            this.charCallbackProto = LibndxAdapter.koffiProto(
                'void CharCallbackFn(uint8 *data, int length, double timestamp_sec)'
            )
        }
        return this.charCallbackProto
    }

    private static getOnConnectedProto() {
        if (!this.onConnectedProto) {
            this.onConnectedProto = LibndxAdapter.koffiProto(
                'void OnConnectedFn(str uuid, str name)'
            )
        }
        return this.onConnectedProto
    }

    private static getOnRssiProto() {
        if (!this.onRssiProto) {
            this.onRssiProto = LibndxAdapter.koffiProto(
                'void OnRssiFn(int rssi)'
            )
        }
        return this.onRssiProto
    }

    private static getOnDiscoveredProto() {
        if (!this.onDiscoveredProto) {
            this.onDiscoveredProto = LibndxAdapter.koffiProto(
                'void OnDiscoveredFn(str uuid)'
            )
        }
        return this.onDiscoveredProto
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
}

export interface Libndx {
    discoverBleUuid(options: DiscoverBleUuidOptions): NativeResult
    createBleBackend(options: BleBackendOptions): NativeResult
    startBleBackend(options: StartBleBackendOptions): NativeResult
    writeBleCharacteristic(options: WriteBleCharacteristicOptions): NativeResult
    setBleRssiInterval(options: BleRssiOptions): NativeResult
    stopBleBackend(options: BleBackendOptions): NativeResult
    createFtdiBackend(options: FtdiBackendOptions): NativeResult
    startFtdiBackend(options: FtdiBackendOptions): NativeResult
    stopFtdiBackend(options: FtdiBackendOptions): NativeResult
}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}

export interface DiscoverBleUuidOptions {
    namePrefix: string
    onDiscovered: (uuid: string) => void
}

export interface BleBackendOptions {
    deviceUuid: string
}

export interface StartBleBackendOptions extends BleBackendOptions {
    onConnected: (peripheral: NativePeripheral) => void
    charCallbacks: CharacteristicCallback[]
}

export interface BleRssiOptions extends BleBackendOptions {
    intervalMs: number
    onRssi: (rssi: number) => void
}

export interface WriteBleCharacteristicOptions {
    deviceUuid: string
    charUuid: string
    value: string
}

export interface CharacteristicCallback {
    charUuid: string
    charName?: string
    onData: (data: Buffer, length: number, timestampSec: number) => void
}

export interface FtdiBackendOptions {
    serialNumber: string
}

export interface LibndxBindings {
    discover_ble_uuid(args: [string, unknown]): string
    create_ble_backend(args: [string]): string
    start_ble_backend(args: [string, unknown, unknown, number]): string
    write_ble_characteristic(args: [string, string, string]): string
    set_ble_rssi_interval(args: [string, number, unknown]): string
    stop_ble_backend(args: [string]): string
    create_ftdi_backend(args: [string]): string
    start_ftdi_backend(args: [string]): string
    stop_ftdi_backend(args: [string]): string
}

export interface NativePeripheral {
    uuid: string
    name: string
}

export interface NativeResult {
    status: number
    error?: string
}
