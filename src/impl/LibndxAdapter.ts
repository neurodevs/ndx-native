import koffi from 'koffi'

export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor
    public static koffiLoad = koffi.load.bind(koffi)
    public static koffiRegister = koffi.register.bind(koffi)
    public static koffiStruct = koffi.struct.bind(koffi)
    public static koffiProto = koffi.proto.bind(koffi)
    public static koffiPointer: typeof koffi.pointer = koffi.pointer.bind(koffi)
    public static koffiDecode: typeof koffi.decode = koffi.decode.bind(koffi)

    private static charCallbackProto?: ReturnType<typeof koffi.proto>
    private static charCallbackStruct?: ReturnType<typeof koffi.struct>
    private static onDiscoveredProto?: ReturnType<typeof koffi.proto>
    private static onScannedProto?: ReturnType<typeof koffi.proto>
    private static onConnectedProto?: ReturnType<typeof koffi.proto>
    private static onLostProto?: ReturnType<typeof koffi.proto>
    private static onReconnectProto?: ReturnType<typeof koffi.proto>
    private static onDisconnectedProto?: ReturnType<typeof koffi.proto>
    private static onRssiProto?: ReturnType<typeof koffi.proto>
    private static onDataProto?: ReturnType<typeof koffi.proto>
    private static onAdvertisementProto?: ReturnType<typeof koffi.proto>

    private static instance?: Libndx

    protected registeredCallbacks: RegisteredCallbackPointer[] = []

    private readonly onScannedByPrefix = new Map<string, OnScannedCallback>()
    private readonly registeredOnScannedByPrefix = new Map<
        string,
        RegisteredCallbackPointer
    >()

    private libndxPath: string
    private bindings!: LibndxBindings

    protected constructor(options?: LibndxAdapterOptions) {
        const { libndxPath = '/opt/local/lib/libndx.dylib' } = options ?? {}

        this.libndxPath = libndxPath

        this.tryToLoadBindings()
    }

    public static getInstance(options?: LibndxAdapterOptions) {
        if (!this.instance) {
            this.setInstance(new (this.Class ?? this)(options))
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
        delete this.onScannedProto
        delete this.onConnectedProto
        delete this.onLostProto
        delete this.onReconnectProto
        delete this.onDisconnectedProto
        delete this.onRssiProto
        delete this.onDataProto
        delete this.onAdvertisementProto
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
        LibndxAdapter.getOnScannedProto()
        LibndxAdapter.getOnConnectedProto()
        LibndxAdapter.getOnLostProto()
        LibndxAdapter.getOnReconnectProto()
        LibndxAdapter.getOnDisconnectedProto()
        LibndxAdapter.getOnRssiProto()
        LibndxAdapter.getOnDataProto()
        LibndxAdapter.getOnAdvertisementProto()

        const lib = LibndxAdapter.koffiLoad(this.libndxPath)

        const wrap0 = (f: () => string) => () => f()

        const wrap1 = (f: (a: string) => string) => (args: [string]) =>
            f(args[0])

        const wrap2 =
            (f: (a: string, b: string) => string) => (args: [string, string]) =>
                f(args[0], args[1])

        const wrap3 =
            (f: (a: string, b: string, c: string) => string) =>
            (args: [string, string, string]) =>
                f(args[0], args[1], args[2])

        const wrapStartBleGatt =
            (f: (...args: StartBleGattArgs) => string) =>
            (args: StartBleGattArgs) =>
                f(...args)

        const wrapRegisterBleGattCharCallbacks =
            (f: (a: string, b: NativeCharCallback[], c: number) => string) =>
            (args: [string, NativeCharCallback[], number]) =>
                f(args[0], args[1], args[2])

        const wrapStartBleGattRssiPolling =
            (
                f: (
                    a: string,
                    b: number,
                    c: RegisteredCallbackPointer
                ) => string
            ) =>
            (args: [string, number, RegisteredCallbackPointer]) =>
                f(args[0], args[1], args[2])

        const wrapStrAndCallback =
            (f: (a: string, b: RegisteredCallbackPointer) => string) =>
            (args: [string, RegisteredCallbackPointer]) =>
                f(args[0], args[1])

        this.bindings = {
            discover_ble_uuid: wrapStrAndCallback(
                lib.func(
                    'str discover_ble_uuid(str name_prefix, OnDiscoveredFn *on_discovered)'
                )
            ),
            start_ble_scan: wrapStrAndCallback(
                lib.func(
                    'str start_ble_scan(str name_prefix, OnScannedFn *on_scanned)'
                )
            ),
            stop_ble_scan: wrap1(
                lib.func('str stop_ble_scan(str name_prefix)')
            ),
            create_ble_gatt_backend: wrap1(
                lib.func('str create_ble_gatt_backend(str config)')
            ),
            start_ble_gatt_backend: wrapStartBleGatt(
                lib.func(
                    'str start_ble_gatt_backend(str uuid, OnConnectedFn *on_connected, OnLostFn *on_lost, OnReconnectFn *on_reconnect, OnDisconnectedFn *on_disconnected, CharCallback *callbacks, int num_callbacks)'
                )
            ),
            register_ble_gatt_char_callbacks: wrapRegisterBleGattCharCallbacks(
                lib.func(
                    'str register_ble_gatt_char_callbacks(str uuid, CharCallback *callbacks, int num_callbacks)'
                )
            ),
            write_ble_gatt_char: wrap3(
                lib.func(
                    'str write_ble_gatt_char(str uuid, str charUuid, str value)'
                )
            ),
            start_ble_gatt_rssi_polling: wrapStartBleGattRssiPolling(
                lib.func(
                    'str start_ble_gatt_rssi_polling(str uuid, int interval_ms, OnRssiFn *on_rssi)'
                )
            ),
            stop_ble_gatt_rssi_polling: wrap1(
                lib.func('str stop_ble_gatt_rssi_polling(str uuid)')
            ),
            stop_ble_gatt_backend: wrap1(
                lib.func('str stop_ble_gatt_backend(str uuid)')
            ),
            create_ble_observer_backend: wrap1(
                lib.func('str create_ble_observer_backend(str config)')
            ),
            start_ble_observer_backend: wrapStrAndCallback(
                lib.func(
                    'str start_ble_observer_backend(str uuid, OnAdvertisementFn *on_advertisement)'
                )
            ),
            stop_ble_observer_backend: wrap1(
                lib.func('str stop_ble_observer_backend(str uuid)')
            ),
            discover_usb_serial_numbers: wrap0(
                lib.func('str discover_usb_serial_numbers()')
            ),
            create_usb_backend: wrap1(
                lib.func('str create_usb_backend(str config)')
            ),
            start_usb_backend: wrapStrAndCallback(
                lib.func('str start_usb_backend(str serial, OnDataFn *on_data)')
            ),
            write_usb_backend: wrap2(
                lib.func('str write_usb_backend(str serial, str value)')
            ),
            stop_usb_backend: wrap1(
                lib.func('str stop_usb_backend(str serial)')
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

    public startBleScan(options: StartBleScanOptions) {
        const { namePrefix, onScanned } = options

        this.onScannedByPrefix.set(namePrefix, onScanned)

        return JSON.parse(
            this.bindings.start_ble_scan([
                namePrefix,
                this.registeredOnScannedFor(namePrefix),
            ])
        )
    }

    public stopBleScan(options: StopBleScanOptions) {
        const { namePrefix } = options

        this.onScannedByPrefix.delete(namePrefix)

        return JSON.parse(this.bindings.stop_ble_scan([namePrefix]))
    }

    private registeredOnScannedFor(namePrefix: string) {
        if (!this.registeredOnScannedByPrefix.has(namePrefix)) {
            this.registeredOnScannedByPrefix.set(
                namePrefix,
                LibndxAdapter.koffiRegister(
                    (uuid: string, name: string) =>
                        this.onScannedByPrefix.get(namePrefix)?.(uuid, name),
                    LibndxAdapter.koffiPointer(
                        LibndxAdapter.getOnScannedProto()!
                    )
                )
            )
        }

        return this.registeredOnScannedByPrefix.get(namePrefix)!
    }

    public createBleGattBackend(options: BleOptions) {
        const { deviceUuid } = options
        const configJson = JSON.stringify({ uuid: deviceUuid })

        return JSON.parse(this.bindings.create_ble_gatt_backend([configJson]))
    }

    public startBleGattBackend(options: StartBleGattOptions) {
        const {
            deviceUuid,
            onConnected,
            onLost,
            onReconnect,
            onDisconnected,
            charCallbacks,
        } = options

        const registeredOnConnected = LibndxAdapter.koffiRegister(
            (uuid: string, name: string) => onConnected({ uuid, name }),
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnConnectedProto()!)
        )

        const registeredOnLost = LibndxAdapter.koffiRegister(
            onLost,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnLostProto()!)
        )

        const registeredOnReconnect = LibndxAdapter.koffiRegister(
            onReconnect,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnReconnectProto()!)
        )

        const registeredOnDisconnected = LibndxAdapter.koffiRegister(
            onDisconnected,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnDisconnectedProto()!)
        )

        const registered = charCallbacks.map(
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

        this.registeredCallbacks.push(...registered.map((c) => c.onData))

        return JSON.parse(
            this.bindings.start_ble_gatt_backend([
                deviceUuid,
                registeredOnConnected,
                registeredOnLost,
                registeredOnReconnect,
                registeredOnDisconnected,
                registered,
                registered.length,
            ])
        )
    }

    public registerBleGattCharCallbacks(
        options: RegisterBleGattCharCallbacksOptions
    ) {
        const { deviceUuid, charCallbacks } = options

        const registered = charCallbacks.map(
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

        this.registeredCallbacks.push(...registered.map((c) => c.onData))

        return JSON.parse(
            this.bindings.register_ble_gatt_char_callbacks([
                deviceUuid,
                registered,
                registered.length,
            ])
        )
    }

    public writeBleGattChar(options: WriteBleGattCharOptions) {
        const { deviceUuid, charUuid: characteristicUuid, value } = options

        return JSON.parse(
            this.bindings.write_ble_gatt_char([
                deviceUuid,
                characteristicUuid,
                value,
            ])
        )
    }

    public startBleGattRssiPolling(options: BleGattRssiOptions) {
        const { deviceUuid, intervalMs, onRssi } = options

        const registeredOnRssi = LibndxAdapter.koffiRegister(
            onRssi,
            LibndxAdapter.koffiPointer(LibndxAdapter.getOnRssiProto()!)
        )

        return JSON.parse(
            this.bindings.start_ble_gatt_rssi_polling([
                deviceUuid,
                intervalMs,
                registeredOnRssi,
            ])
        )
    }

    public stopBleGattRssiPolling(options: BleOptions) {
        const { deviceUuid } = options

        return JSON.parse(
            this.bindings.stop_ble_gatt_rssi_polling([deviceUuid])
        )
    }

    public stopBleGattBackend(options: BleOptions) {
        const { deviceUuid } = options
        return JSON.parse(this.bindings.stop_ble_gatt_backend([deviceUuid]))
    }

    public createBleObserverBackend(options: BleOptions) {
        const { deviceUuid } = options
        const configJson = JSON.stringify({ uuid: deviceUuid })

        return JSON.parse(
            this.bindings.create_ble_observer_backend([configJson])
        )
    }

    public startBleObserverBackend(options: StartBleObserverOptions) {
        const { deviceUuid, onAdvertisement } = options

        const registeredOnAdvertisement = LibndxAdapter.registerOnAdvertisement(
            onAdvertisement,
            LibndxAdapter.getOnAdvertisementProto()!
        )

        this.registeredCallbacks.push(registeredOnAdvertisement)

        return JSON.parse(
            this.bindings.start_ble_observer_backend([
                deviceUuid,
                registeredOnAdvertisement,
            ])
        )
    }

    public stopBleObserverBackend(options: BleOptions) {
        const { deviceUuid } = options

        return JSON.parse(this.bindings.stop_ble_observer_backend([deviceUuid]))
    }

    public discoverUsbSerialNumbers() {
        const { serial_numbers: serialNumbers, ...result } = JSON.parse(
            this.bindings.discover_usb_serial_numbers()
        )

        return { ...result, serialNumbers }
    }

    public createUsbBackend(options: UsbOptions) {
        const { serialNumber, baudRate, usesRtsCts } = options

        const configJson = JSON.stringify({
            serial_number: serialNumber,
            baud_rate: baudRate,
            flow_control: usesRtsCts ? 'rts_cts' : undefined,
        })

        return JSON.parse(this.bindings.create_usb_backend([configJson]))
    }

    public startUsbBackend(options: StartUsbOptions) {
        const { serialNumber, onData } = options

        const registeredOnData = LibndxAdapter.registerOnData(
            onData,
            LibndxAdapter.getOnDataProto()!
        )

        this.registeredCallbacks.push(registeredOnData)

        return JSON.parse(
            this.bindings.start_usb_backend([serialNumber, registeredOnData])
        )
    }

    public writeUsbBackend(options: WriteUsbOptions) {
        const { serialNumber, value } = options

        return JSON.parse(
            this.bindings.write_usb_backend([serialNumber, value])
        )
    }

    public stopUsbBackend(options: UsbOptions) {
        const { serialNumber } = options
        return JSON.parse(this.bindings.stop_usb_backend([serialNumber]))
    }

    private static registerOnAdvertisement(
        onAdvertisement: OnAdvertisementCallback,
        proto: ReturnType<typeof koffi.proto>
    ) {
        return this.koffiRegister((advertisementJson: string) => {
            onAdvertisement(JSON.parse(advertisementJson))
        }, this.koffiPointer(proto))
    }

    private static registerOnData(
        onData: OnDataCallback,
        proto: ReturnType<typeof koffi.proto>
    ) {
        return this.koffiRegister(
            (data: unknown, length: number, timestampSec: number) => {
                const decoded = this.koffiDecode(data, 'uint8_t', length)
                onData(Buffer.from(decoded), length, timestampSec)
            },
            this.koffiPointer(proto)
        )
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

    private static getOnLostProto() {
        if (!this.onLostProto) {
            this.onLostProto = LibndxAdapter.koffiProto('void OnLostFn()')
        }
        return this.onLostProto
    }

    private static getOnReconnectProto() {
        if (!this.onReconnectProto) {
            this.onReconnectProto = LibndxAdapter.koffiProto(
                'void OnReconnectFn()'
            )
        }
        return this.onReconnectProto
    }

    private static getOnDisconnectedProto() {
        if (!this.onDisconnectedProto) {
            this.onDisconnectedProto = LibndxAdapter.koffiProto(
                'void OnDisconnectedFn()'
            )
        }
        return this.onDisconnectedProto
    }

    private static getOnRssiProto() {
        if (!this.onRssiProto) {
            this.onRssiProto = LibndxAdapter.koffiProto(
                'void OnRssiFn(int rssi)'
            )
        }
        return this.onRssiProto
    }

    private static getOnDataProto() {
        if (!this.onDataProto) {
            this.onDataProto = LibndxAdapter.koffiProto(
                'void OnDataFn(uint8 *data, uint64 length, double timestamp_sec)'
            )
        }
        return this.onDataProto
    }

    private static getOnDiscoveredProto() {
        if (!this.onDiscoveredProto) {
            this.onDiscoveredProto = LibndxAdapter.koffiProto(
                'void OnDiscoveredFn(str uuid)'
            )
        }
        return this.onDiscoveredProto
    }

    private static getOnScannedProto() {
        if (!this.onScannedProto) {
            this.onScannedProto = LibndxAdapter.koffiProto(
                'void OnScannedFn(str uuid, str name)'
            )
        }
        return this.onScannedProto
    }

    private static getOnAdvertisementProto() {
        if (!this.onAdvertisementProto) {
            this.onAdvertisementProto = LibndxAdapter.koffiProto(
                'void OnAdvertisementFn(str advertisement_json)'
            )
        }
        return this.onAdvertisementProto
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
    startBleScan(options: StartBleScanOptions): NativeResult
    stopBleScan(options: StopBleScanOptions): NativeResult

    createBleGattBackend(options: BleOptions): NativeResult
    startBleGattBackend(options: StartBleGattOptions): NativeResult
    registerBleGattCharCallbacks(
        options: RegisterBleGattCharCallbacksOptions
    ): NativeResult
    writeBleGattChar(options: WriteBleGattCharOptions): NativeResult
    startBleGattRssiPolling(options: BleGattRssiOptions): NativeResult
    stopBleGattRssiPolling(options: BleOptions): NativeResult
    stopBleGattBackend(options: BleOptions): NativeResult

    createBleObserverBackend(options: BleOptions): NativeResult
    startBleObserverBackend(options: StartBleObserverOptions): NativeResult
    stopBleObserverBackend(options: BleOptions): NativeResult

    discoverUsbSerialNumbers(): NativeResult & { serialNumbers?: string[] }
    createUsbBackend(options: UsbOptions): NativeResult
    startUsbBackend(options: StartUsbOptions): NativeResult
    writeUsbBackend(options: WriteUsbOptions): NativeResult
    stopUsbBackend(options: UsbOptions): NativeResult
}

export type LibndxConstructor = new (options?: LibndxAdapterOptions) => Libndx

export interface LibndxAdapterOptions {
    libndxPath?: string
}

export type RegisteredCallbackPointer = ReturnType<typeof koffi.register>

export interface NativeCharCallback {
    charUuid: string
    charName?: string
    onData: RegisteredCallbackPointer
}

export interface DiscoverBleUuidOptions {
    namePrefix: string
    onDiscovered: (uuid: string) => void
}

export interface StartBleScanOptions {
    namePrefix: string
    onScanned: OnScannedCallback
}

export type OnScannedCallback = (uuid: string, name: string) => void

export interface StopBleScanOptions {
    namePrefix: string
}

export interface BleOptions {
    deviceUuid: string
}

export interface StartBleGattOptions extends BleOptions {
    onConnected: (peripheral: NativePeripheral) => void
    onLost: () => void
    onReconnect: () => void
    onDisconnected: () => void
    charCallbacks: readonly CharacteristicCallback[]
}

export interface RegisterBleGattCharCallbacksOptions extends BleOptions {
    charCallbacks: readonly CharacteristicCallback[]
}

export interface BleGattRssiOptions extends BleOptions {
    intervalMs: number
    onRssi: (rssi: number) => void
}

export interface WriteBleGattCharOptions {
    deviceUuid: string
    charUuid: string
    value: string
}

export interface CharacteristicCallback {
    charUuid: string
    charName?: string
    onData: OnDataCallback
}

export type OnDataCallback = (
    data: Buffer,
    length: number,
    timestampSec: number
) => void

export interface StartBleObserverOptions extends BleOptions {
    onAdvertisement: OnAdvertisementCallback
}

export type OnAdvertisementCallback = (
    advertisement: NativeAdvertisement
) => void

export interface NativeAdvertisement {
    localName: string
    companyId: number | null
    manufacturerData: string
    serviceUuids: string[]
    serviceData: Record<string, string>
    rssi: number | null
    txPowerLevel: number | null
    isConnectable: boolean
    timestampSec: number
}

export interface UsbOptions {
    serialNumber: string
    baudRate?: number
    usesRtsCts?: boolean
}

export interface StartUsbOptions extends UsbOptions {
    onData: (data: Buffer, length: number, timestampSec: number) => void
}

export interface WriteUsbOptions extends UsbOptions {
    value: string
}

export type StartBleGattArgs = [
    uuid: string,
    onConnected: RegisteredCallbackPointer,
    onLost: RegisteredCallbackPointer,
    onReconnect: RegisteredCallbackPointer,
    onDisconnected: RegisteredCallbackPointer,
    charCallbacks: NativeCharCallback[],
    numCallbacks: number,
]

export interface LibndxBindings {
    discover_ble_uuid(args: [string, RegisteredCallbackPointer]): string
    start_ble_scan(args: [string, RegisteredCallbackPointer]): string
    stop_ble_scan(args: [string]): string

    create_ble_gatt_backend(args: [string]): string
    start_ble_gatt_backend(args: StartBleGattArgs): string
    register_ble_gatt_char_callbacks(
        args: [string, NativeCharCallback[], number]
    ): string
    write_ble_gatt_char(args: [string, string, string]): string
    start_ble_gatt_rssi_polling(
        args: [string, number, RegisteredCallbackPointer]
    ): string
    stop_ble_gatt_rssi_polling(args: [string]): string
    stop_ble_gatt_backend(args: [string]): string

    create_ble_observer_backend(args: [string]): string
    start_ble_observer_backend(
        args: [string, RegisteredCallbackPointer]
    ): string
    stop_ble_observer_backend(args: [string]): string

    discover_usb_serial_numbers(): string
    create_usb_backend(args: [string]): string
    start_usb_backend(args: [string, RegisteredCallbackPointer]): string
    write_usb_backend(args: [string, string]): string
    stop_usb_backend(args: [string]): string
}

export interface NativePeripheral {
    uuid: string
    name: string
}

export interface NativeResult {
    status: number
    error?: string
}
