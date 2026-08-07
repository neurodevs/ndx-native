import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, {
    CharacteristicCallback,
    LibndxBindings,
} from '../../impl/LibndxAdapter.js'
import type { NativePeripheral } from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import FakeLibndx from '../../testDoubles/Libndx/FakeLibndx.js'
import SpyLibndx from '../../testDoubles/Libndx/SpyLibndx.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    private static instance: SpyLibndx
    private static libndxPath = '/opt/local/lib/libndx.dylib'
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibndxBindings

    private static koffiLoadPath?: string
    private static koffiFuncSignatures?: string[]
    private static koffiProtoCalls?: string[]
    private static koffiStructCalls?: { name: string; fields: object }[]
    private static koffiDecodeCalls?: unknown[][]
    private static fakeDecodedUsbData?: Buffer

    private static readonly bleDeviceUuid = this.generateId()
    private static readonly bleCharacteristicUuid = this.generateId()
    private static readonly bleValueToWrite = this.generateId()
    private static readonly bleGattRssiIntervalMs = Math.random()

    private static readonly usbSerialNumber = this.generateId()
    private static readonly usbValueToWrite = this.generateId()

    private static readonly charCallbacks = [
        {
            charUuid: this.generateId(),
            charName: this.generateId(),
            onData: (
                _data: Buffer,
                _length: number,
                _timestampSec: number
            ) => {},
        },
    ]

    private static receivedUsbData: Buffer
    private static receivedUsbLength: number
    private static receivedTimestampSec: number

    private static readonly usbOnDataCallback = (
        data: Buffer,
        length: number,
        timestampSec: number
    ) => {
        this.receivedUsbData = data
        this.receivedUsbLength = length
        this.receivedTimestampSec = timestampSec
    }

    private static readonly successfulResult = { status: 200 }

    private static readonly bleNamePrefix = this.generateId()

    private static readonly callsToDiscoverBle: {
        namePrefix: string
        onDiscovered: unknown
    }[] = []
    private static readonly callsToCreateBleGatt: string[][] = []
    private static readonly callsToStartBleGatt: {
        uuid: string
        onConnected: unknown
        charCallbacks: CharacteristicCallback[]
    }[] = []
    private static readonly callsToRegisterBleGattCharCallbacks: {
        uuid: string
        charCallbacks: unknown
        numCallbacks: number
    }[] = []
    private static readonly callsToWriteBleGatt: string[][] = []
    private static readonly callsToStartBleGattRssiPolling: {
        uuid: string
        intervalMs: number
        onRssi: unknown
    }[] = []
    private static readonly callsToStopBleGattRssiPolling: string[][] = []
    private static readonly callsToStopBleGatt: string[][] = []

    private static readonly callsToCreateUsb: string[][] = []
    private static readonly callsToStartUsb: unknown[][] = []
    private static readonly callsToWriteUsb: string[][] = []
    private static readonly callsToStopUsb: string[][] = []

    protected static async beforeEach() {
        await super.beforeEach()

        this.shouldThrowWhenLoadingBindings = false
        this.fakeBindings = this.FakeBindings()
        this.resetCallsToFakeBindings()
        this.clearAndFakeFfi()

        LibndxAdapter.Class = SpyLibndx

        this.resetInstance()
        this.instance = this.LibndxAdapter()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async throwsWhenBindingsFailToLoad() {
        this.resetInstance()
        this.shouldThrowWhenLoadingBindings = true

        const err = assert.doesThrow(() => this.LibndxAdapter())
        const actual = (err.message ?? err.stack).replace(/\s+/g, '')

        assert.isEqual(
            actual,
            this.failedToLoadError,
            'Did not receive the expected error!'
        )
    }

    @test()
    protected static async callsKoffiLoadWithLibndxPath() {
        assert.isEqual(
            this.koffiLoadPath,
            this.libndxPath,
            'Did not call koffiLoad with the expected library path!'
        )
    }

    @test()
    protected static async registersExpectedKoffiFuncSignatures() {
        assert.isEqualDeep(
            this.koffiFuncSignatures,
            [
                'str discover_ble_uuid(str name_prefix, OnDiscoveredFn *on_discovered)',
                'str create_ble_gatt_backend(str config)',
                'str start_ble_gatt_backend(str uuid, OnConnectedFn *on_connected, CharCallback *callbacks, int num_callbacks)',
                'str register_ble_gatt_char_callbacks(str uuid, CharCallback *callbacks, int num_callbacks)',
                'str write_ble_gatt_char(str uuid, str charUuid, str value)',
                'str start_ble_gatt_rssi_polling(str uuid, int interval_ms, OnRssiFn *on_rssi)',
                'str stop_ble_gatt_rssi_polling(str uuid)',
                'str stop_ble_gatt_backend(str uuid)',
                'str create_usb_backend(str config)',
                'str start_usb_backend(str serial, OnUsbDataFn *on_data)',
                'str write_usb_backend(str serial, str value)',
                'str stop_usb_backend(str serial)',
            ],
            'Did not register expected koffi func signatures!'
        )
    }

    @test()
    protected static async registersExpectedKoffiProtoSignatures() {
        assert.isEqualDeep(
            this.koffiProtoCalls,
            [
                'void CharCallbackFn(uint8 *data, int length, double timestamp_sec)',
                'void OnDiscoveredFn(str uuid)',
                'void OnConnectedFn(str uuid, str name)',
                'void OnRssiFn(int rssi)',
                'void OnUsbDataFn(uint8 *data, uint64 length, double timestamp_sec)',
            ],
            'Did not register expected koffi proto signatures! Note that OnUsbDataFn must declare length as uint64 to match the native size_t parameter!'
        )
    }

    @test()
    protected static async registersExpectedKoffiStructs() {
        assert.isEqualDeep(
            this.koffiStructCalls,
            [
                {
                    name: 'CharCallback',
                    fields: {
                        charUuid: 'str',
                        charName: 'str',
                        onData: {},
                    },
                },
            ],
            'Did not register CharCallback struct with expected fields!'
        )
    }

    @test()
    protected static async registersOnRssiProtoBeforeLoadingBindings() {
        const onRssiProtoIdx = this.koffiProtoCalls!.findIndex((s) =>
            s.includes('OnRssiFn')
        )
        const firstFuncIdx = this.koffiFuncSignatures!.findIndex((s) =>
            s.includes('OnRssiFn')
        )
        assert.isAbove(
            onRssiProtoIdx,
            -1,
            'Did not register OnRssiFn proto before loading bindings!'
        )
        assert.isBelow(
            onRssiProtoIdx,
            firstFuncIdx + this.koffiProtoCalls!.length,
            'OnRssiFn proto must be registered before bindings are loaded!'
        )
    }

    @test()
    protected static async registersOnDiscoveredProtoBeforeLoadingBindings() {
        const onDiscoveredProtoIdx = this.koffiProtoCalls!.findIndex((s) =>
            s.includes('OnDiscoveredFn')
        )
        const firstFuncIdx = this.koffiFuncSignatures!.findIndex((s) =>
            s.includes('OnDiscoveredFn')
        )
        assert.isAbove(
            onDiscoveredProtoIdx,
            -1,
            'Did not register OnDiscoveredFn proto before loading bindings!'
        )
        assert.isBelow(
            onDiscoveredProtoIdx,
            firstFuncIdx + this.koffiProtoCalls!.length,
            'OnDiscoveredFn proto must be registered before bindings are loaded!'
        )
    }

    @test()
    protected static async onConnectedReceivesPeripheral() {
        let received: NativePeripheral | undefined = undefined

        this.startBleGattBackend((peripheral: NativePeripheral) => {
            received = peripheral
        })

        const peripheral = { uuid: this.generateId(), name: 'Muse-1234' }

        const registeredOnConnected = this.callsToStartBleGatt[0]
            .onConnected as (uuid: string, name: string) => void
        registeredOnConnected(peripheral.uuid, peripheral.name)

        assert.isEqualDeep(
            received,
            peripheral,
            'onConnected was not called with the peripheral!'
        )
    }

    @test()
    protected static async getInstanceReturnsASingleton() {
        assert.isEqual(LibndxAdapter.getInstance(), LibndxAdapter.getInstance())
    }

    @test()
    protected static canSetInstance() {
        const fake = new FakeLibndx()
        LibndxAdapter.setInstance(fake)
        assert.isEqual(LibndxAdapter.getInstance(), fake)
    }

    @test()
    protected static async discoverBleUuidCallsBindingWithExpectedArgs() {
        this.discoverBleUuid()

        assert.isEqual(
            this.callsToDiscoverBle[0].namePrefix,
            this.bleNamePrefix,
            'discoverBleUuid did not pass expected namePrefix to binding!'
        )

        assert.isFunction(
            this.callsToDiscoverBle[0].onDiscovered,
            'discoverBleUuid did not pass an onDiscovered callback to the binding!'
        )
    }

    @test()
    protected static async discoverBleUuidReturnsJson() {
        const json = this.discoverBleUuid()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'discoverBleUuid did not return a JSON string!'
        )
    }

    @test()
    protected static async discoverBleUuidInvokesOnDiscoveredWithUuid() {
        let received: string | undefined

        this.discoverBleUuid((uuid: string) => {
            received = uuid
        })

        const discoveredUuid = this.generateId()
        const registeredOnDiscovered = this.callsToDiscoverBle[0]
            .onDiscovered as (uuid: string) => void
        registeredOnDiscovered(discoveredUuid)

        assert.isEqual(
            received,
            discoveredUuid,
            'onDiscovered was not invoked with discovered uuid!'
        )
    }

    @test()
    protected static async createBleGattBackendCallsBindingWithExpectedArgs() {
        this.createBleGattBackend()

        assert.isEqualDeep(
            this.callsToCreateBleGatt[0][0],
            JSON.stringify({ uuid: this.bleDeviceUuid }),
            'createBleGattBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async createBleGattBackendReturnsJson() {
        const json = this.createBleGattBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'createBleGattBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async startBleGattBackendCallsBindingWithExpectedArgs() {
        this.startBleGattBackend()

        assert.isEqual(
            this.callsToStartBleGatt[0].uuid,
            this.bleDeviceUuid,
            'startBleGattBackend did not pass expected uuid to binding!'
        )

        debugger

        assert.isEqualDeep(
            this.callsToStartBleGatt[0].charCallbacks,
            this.charCallbacks,
            'startBleGattBackend did not pass expected charCallbacks to binding!'
        )
    }

    @test()
    protected static async startBleGattBackendReturnsJson() {
        const json = this.startBleGattBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'startBleGattBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async registerBleGattCharCallbacksCallsBindingWithExpectedArgs() {
        this.registerBleGattCharCallbacks()

        const call = this.callsToRegisterBleGattCharCallbacks[0]

        assert.isEqual(
            call.uuid,
            this.bleDeviceUuid,
            'registerBleGattCharCallbacks did not pass expected uuid to binding!'
        )

        assert.isEqual(
            call.numCallbacks,
            this.charCallbacks.length,
            'registerBleGattCharCallbacks did not pass expected callback count to binding!'
        )
    }

    @test()
    protected static async registerBleGattCharCallbacksReturnsJson() {
        const json = this.registerBleGattCharCallbacks()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'registerBleGattCharCallbacks did not return a JSON string!'
        )
    }

    @test()
    protected static async writeBleGattCharCallsBindingWithExpectedArgs() {
        this.writeBleGattChar()

        assert.isEqualDeep(
            this.callsToWriteBleGatt[0],
            [
                this.bleDeviceUuid,
                this.bleCharacteristicUuid,
                this.bleValueToWrite,
            ],
            'writeBleGattChar did not call binding with expected args!'
        )
    }

    @test()
    protected static async writeBleGattCharReturnsJson() {
        const json = this.writeBleGattChar()

        assert.isEqualDeep(
            json,
            { status: 200 },
            'writeBleGattChar did not return a JSON string!'
        )
    }

    @test()
    protected static async startBleGattRssiPollingCallsBindingWithExpectedArgs() {
        this.startBleGattRssiPolling()

        const { uuid, intervalMs } = this.callsToStartBleGattRssiPolling[0]

        assert.isEqualDeep(
            { uuid, intervalMs },
            {
                uuid: this.bleDeviceUuid,
                intervalMs: this.bleGattRssiIntervalMs,
            },
            'startBleGattRssiPolling did not call binding with expected args!'
        )

        assert.isFunction(
            this.callsToStartBleGattRssiPolling[0].onRssi,
            'startBleGattRssiPolling did not pass an onRssi callback to the binding!'
        )
    }

    @test()
    protected static async startBleGattRssiPollingReturnsJson() {
        const json = this.startBleGattRssiPolling()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'startBleGattRssiPolling did not return a JSON string!'
        )
    }

    @test()
    protected static async startBleGattRssiPollingInvokesOnRssiWithRssiValue() {
        let received: number | undefined

        this.startBleGattRssiPolling((rssi: number) => {
            received = rssi
        })

        const registeredOnRssi = this.callsToStartBleGattRssiPolling[0]
            .onRssi as (rssi: number) => void
        registeredOnRssi(-72)

        assert.isEqual(received, -72, 'onRssi was not invoked with rssi value!')
    }

    @test()
    protected static async stopBleGattBackendCallsBindingWithExpectedArgs() {
        this.stopBleGattBackend()

        assert.isEqual(
            this.callsToStopBleGatt[0][0],
            this.bleDeviceUuid,
            'stopBleGattBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async stopBleGattBackendReturnsJson() {
        const json = this.stopBleGattBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'stopBleGattBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async createUsbBackendCallsBindingWithExpectedArgs() {
        this.createUsbBackend()

        assert.isEqualDeep(
            this.callsToCreateUsb[0][0],
            JSON.stringify({ serial_number: this.usbSerialNumber }),
            'createUsbBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async createUsbBackendReturnsJson() {
        const json = this.createUsbBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'createUsbBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async startUsbBackendCallsBindingWithExpectedArgs() {
        this.startUsbBackend()

        assert.isEqual(
            this.callsToStartUsb[0][0],
            this.usbSerialNumber,
            'startUsbBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async startUsbBackendPassesOnDataCallbackToBinding() {
        this.startUsbBackend()

        assert.isFunction(
            this.callsToStartUsb[0][1],
            'startUsbBackend did not pass an onData callback to the binding!'
        )
    }

    @test()
    protected static async startUsbBackendDecodesRawPointerBeforeInvokingOnData() {
        this.startUsbBackend()

        const registeredOnData = this.callsToStartUsb[0][1] as (
            data: unknown,
            length: number,
            timestampSec: number
        ) => void

        const fakePointer = 49611948672n
        registeredOnData(fakePointer, 3, 123.456)

        assert.isEqualDeep(
            this.koffiDecodeCalls![0],
            [fakePointer, 'uint8_t', 3],
            'onData did not decode the raw pointer via koffi.decode!'
        )

        assert.isEqualDeep(
            {
                receivedData: this.receivedUsbData,
                receivedLength: this.receivedUsbLength,
                receivedTimestamp: this.receivedTimestampSec,
            },
            {
                receivedData: this.fakeDecodedUsbData,
                receivedLength: 3,
                receivedTimestamp: 123.456,
            },
            'onData was not invoked with the decoded Buffer, length, and timestampSec!'
        )

        assert.isTrue(
            Buffer.isBuffer(this.receivedUsbData),
            'onData was not invoked with a real Buffer instance!'
        )
    }

    @test()
    protected static async startUsbBackendRetainsOnDataCallbackToPreventGc() {
        this.startUsbBackend()

        const registeredOnData = this.callsToStartUsb[0][1]
        const retainedCallbacks = this.instance.getRegisteredCallbacks()

        assert.isTrue(
            retainedCallbacks.includes(registeredOnData),
            'startUsbBackend did not retain the registered onData callback! Without a reference kept alive, koffi will garbage collect the callback and the native backend will stop invoking it after the first sample.'
        )
    }

    @test()
    protected static async startUsbBackendReturnsJson() {
        const json = this.startUsbBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'startUsbBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async writeUsbBackendCallsBindingWithExpectedArgs() {
        this.writeUsbBackend()

        assert.isEqualDeep(
            this.callsToWriteUsb[0],
            [this.usbSerialNumber, this.usbValueToWrite],
            'writeUsbBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async writeUsbBackendReturnsJson() {
        const json = this.writeUsbBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'writeUsbBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async stopUsbBackendCallsBindingWithExpectedArgs() {
        this.stopUsbBackend()

        assert.isEqual(
            this.callsToStopUsb[0][0],
            this.usbSerialNumber,
            'stopUsbBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async stopUsbBackendReturnsJson() {
        const json = this.stopUsbBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'stopUsbBackend did not return a JSON string!'
        )
    }

    private static discoverBleUuid(onDiscovered?: (uuid: string) => void) {
        return this.instance.discoverBleUuid({
            namePrefix: this.bleNamePrefix,
            onDiscovered: onDiscovered ?? (() => {}),
        })
    }

    private static createBleGattBackend() {
        return this.instance.createBleGattBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static startBleGattBackend(
        onConnected?: (peripheral: NativePeripheral) => void
    ) {
        return this.instance.startBleGattBackend({
            deviceUuid: this.bleDeviceUuid,
            onConnected: onConnected || (() => {}),
            charCallbacks: this.charCallbacks,
        })
    }

    private static registerBleGattCharCallbacks() {
        return this.instance.registerBleGattCharCallbacks({
            deviceUuid: this.bleDeviceUuid,
            charCallbacks: this.charCallbacks,
        })
    }

    private static writeBleGattChar() {
        return this.instance.writeBleGattChar({
            deviceUuid: this.bleDeviceUuid,
            charUuid: this.bleCharacteristicUuid,
            value: this.bleValueToWrite,
        })
    }

    private static stopBleGattBackend() {
        return this.instance.stopBleGattBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static startBleGattRssiPolling(onRssi?: (rssi: number) => void) {
        return this.instance.startBleGattRssiPolling({
            deviceUuid: this.bleDeviceUuid,
            intervalMs: this.bleGattRssiIntervalMs,
            onRssi: onRssi ?? (() => {}),
        })
    }

    private static createUsbBackend() {
        return this.instance.createUsbBackend({
            serialNumber: this.usbSerialNumber,
        })
    }

    private static startUsbBackend() {
        return this.instance.startUsbBackend({
            serialNumber: this.usbSerialNumber,
            onData: this.usbOnDataCallback,
        })
    }

    private static writeUsbBackend() {
        return this.instance.writeUsbBackend({
            serialNumber: this.usbSerialNumber,
            value: this.usbValueToWrite,
        })
    }

    private static stopUsbBackend() {
        return this.instance.stopUsbBackend({
            serialNumber: this.usbSerialNumber,
        })
    }

    private static FakeBindings(): LibndxBindings {
        return {
            discover_ble_uuid: (args: any) => {
                this.callsToDiscoverBle.push({
                    namePrefix: args[0],
                    onDiscovered: args[1],
                })
                return JSON.stringify(this.successfulResult)
            },
            create_ble_gatt_backend: (args) => {
                this.callsToCreateBleGatt.push(args)
                return JSON.stringify(this.successfulResult)
            },
            start_ble_gatt_backend: (args: any) => {
                this.callsToStartBleGatt.push({
                    uuid: args[0],
                    onConnected: args[1],
                    charCallbacks: args[2],
                })
                return JSON.stringify(this.successfulResult)
            },
            register_ble_gatt_char_callbacks: (args: any) => {
                this.callsToRegisterBleGattCharCallbacks.push({
                    uuid: args[0],
                    charCallbacks: args[1],
                    numCallbacks: args[2],
                })
                return JSON.stringify(this.successfulResult)
            },
            write_ble_gatt_char: (args) => {
                this.callsToWriteBleGatt.push(args)
                return JSON.stringify(this.successfulResult)
            },
            start_ble_gatt_rssi_polling: (args) => {
                this.callsToStartBleGattRssiPolling.push({
                    uuid: args[0],
                    intervalMs: args[1],
                    onRssi: args[2],
                })
                return JSON.stringify(this.successfulResult)
            },
            stop_ble_gatt_rssi_polling: (args) => {
                this.callsToStopBleGattRssiPolling.push(args)
                return JSON.stringify(this.successfulResult)
            },
            stop_ble_gatt_backend: (args) => {
                this.callsToStopBleGatt.push(args)
                return JSON.stringify(this.successfulResult)
            },
            create_usb_backend: (args) => {
                this.callsToCreateUsb.push(args)
                return JSON.stringify(this.successfulResult)
            },
            start_usb_backend: (args: any) => {
                this.callsToStartUsb.push(args)
                return JSON.stringify(this.successfulResult)
            },
            write_usb_backend: (args) => {
                this.callsToWriteUsb.push(args)
                return JSON.stringify(this.successfulResult)
            },
            stop_usb_backend: (args) => {
                this.callsToStopUsb.push(args)
                return JSON.stringify(this.successfulResult)
            },
        }
    }

    private static resetCallsToFakeBindings() {
        this.callsToDiscoverBle.length = 0
        this.callsToCreateBleGatt.length = 0
        this.callsToStartBleGatt.length = 0
        this.callsToRegisterBleGattCharCallbacks.length = 0
        this.callsToStopBleGatt.length = 0
        this.callsToStartBleGattRssiPolling.length = 0
        this.callsToStopBleGattRssiPolling.length = 0
        this.callsToCreateUsb.length = 0
        this.callsToStartUsb.length = 0
        this.callsToWriteUsb.length = 0
        this.callsToStopUsb.length = 0
    }

    private static clearAndFakeFfi() {
        delete this.koffiLoadPath
        this.koffiFuncSignatures = []
        this.koffiProtoCalls = []
        this.koffiStructCalls = []
        this.koffiDecodeCalls = []
        LibndxAdapter.resetKoffiCache()
        this.fakeKoffiLoad()
        this.fakeKoffiRegister()
        this.fakeKoffiProto()
        this.fakeKoffiPointer()
        this.fakeKoffiStruct()
        this.fakeKoffiDecode()
    }

    private static fakeKoffiDecode() {
        this.fakeDecodedUsbData = Buffer.from([1, 2, 3])

        LibndxAdapter.koffiDecode = ((...args: unknown[]) => {
            this.koffiDecodeCalls!.push(args)
            return this.fakeDecodedUsbData
        }) as any
    }

    private static fakeKoffiRegister() {
        LibndxAdapter.koffiRegister = (fn) => fn as any
    }

    private static fakeKoffiPointer() {
        LibndxAdapter.koffiPointer = (() => ({})) as any
    }

    private static fakeKoffiProto() {
        LibndxAdapter.koffiProto = ((sig: string) => {
            this.koffiProtoCalls!.push(sig)
            return {} as any
        }) as any
    }

    private static fakeKoffiStruct() {
        LibndxAdapter.koffiStruct = ((name: string, fields: object) => {
            this.koffiStructCalls!.push({ name, fields })
            return {} as any
        }) as any
    }

    private static fakeKoffiLoad() {
        LibndxAdapter.koffiLoad = (path) => {
            this.koffiLoadPath = path as string
            return {
                func: (sig: string) => {
                    this.koffiFuncSignatures!.push(sig)

                    if (this.shouldThrowWhenLoadingBindings) {
                        throw new Error(this.fakeErrorMessage)
                    }

                    const name = sig.match(
                        /\w+\s+(\w+)\s*\(/
                    )![1] as keyof LibndxBindings
                    return (...args: unknown[]) =>
                        (this.fakeBindings[name] as (a: unknown) => string)(
                            args
                        )
                },
            } as any
        }
    }

    private static get failedToLoadError() {
        return `
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
            \n Original error: ${this.fakeErrorMessage}
            \n
        `.replace(/\s+/g, '')
    }

    private static resetInstance() {
        LibndxAdapter.resetInstance()
    }

    private static LibndxAdapter() {
        return LibndxAdapter.getInstance() as SpyLibndx
    }
}
