import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, {
    CharacteristicCallback,
    Libndx,
    LibndxBindings,
} from '../../impl/LibndxAdapter.js'
import type { NativePeripheral } from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import FakeLibndx from '../../testDoubles/Libndx/FakeLibndx.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    private static instance: Libndx
    private static libndxPath = '/opt/local/lib/libndx.dylib'
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibndxBindings

    private static koffiLoadPath?: string
    private static koffiFuncSignatures?: string[]
    private static koffiProtoCalls?: string[]
    private static koffiStructCalls?: { name: string; fields: object }[]

    private static readonly bleDeviceUuid = this.generateId()
    private static readonly bleCharacteristicUuid = this.generateId()
    private static readonly bleValueToWrite = this.generateId()
    private static readonly bleRssiIntervalMs = Math.random()

    private static readonly ftdiSerialNumber = this.generateId()

    private static readonly charCallbacks = [
        {
            charUuid: this.generateId(),
            charName: this.generateId(),
            onData: (_data: Buffer, _length: number, _timestamp: number) => {},
        },
    ]

    private static readonly successfulResult = { status: 200 }

    private static readonly bleNamePrefix = this.generateId()

    private static readonly callsToDiscoverBle: {
        namePrefix: string
        onDiscovered: unknown
    }[] = []
    private static readonly callsToCreateBle: string[][] = []
    private static readonly callsToStartBle: {
        uuid: string
        onConnected: unknown
        charCallbacks: CharacteristicCallback[]
    }[] = []
    private static readonly callsToWriteBle: string[][] = []
    private static readonly callsToSetBleRssiInterval: {
        uuid: string
        intervalMs: number
        onRssi: unknown
    }[] = []
    private static readonly callsToStopBle: string[][] = []

    private static readonly callsToCreateFtdi: string[][] = []
    private static readonly callsToStartFtdi: string[][] = []
    private static readonly callsToStopFtdi: string[][] = []

    protected static async beforeEach() {
        await super.beforeEach()

        this.shouldThrowWhenLoadingBindings = false
        this.fakeBindings = this.FakeBindings()
        this.resetCallsToFakeBindings()
        this.clearAndFakeFfi()

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
                'str create_ble_backend(str config)',
                'str start_ble_backend(str uuid, OnConnectedFn *on_connected, CharCallback *callbacks, int num_callbacks)',
                'str write_ble_characteristic(str uuid, str charUuid, str value)',
                'str set_ble_rssi_interval(str uuid, int interval_ms, OnRssiFn *on_rssi)',
                'str stop_ble_backend(str uuid)',
                'str create_ftdi_backend(str config)',
                'str start_ftdi_backend(str serial)',
                'str stop_ftdi_backend(str serial)',
            ],
            'Did not register expected koffi func signatures!'
        )
    }

    @test()
    protected static async registersCharCallbackStruct() {
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

        this.startBleBackend((peripheral: NativePeripheral) => {
            received = peripheral
        })

        const peripheral = { uuid: this.generateId(), name: 'Muse-1234' }

        const registeredOnConnected = this.callsToStartBle[0].onConnected as (
            uuid: string,
            name: string
        ) => void
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
    protected static async createBleBackendCallsBindingWithExpectedArgs() {
        this.createBleBackend()

        assert.isEqualDeep(
            this.callsToCreateBle[0][0],
            JSON.stringify({ uuid: this.bleDeviceUuid }),
            'createBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async createBleBackendReturnsJson() {
        const json = this.createBleBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'createBleBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async startBleBackendCallsBindingWithExpectedArgs() {
        this.startBleBackend()

        assert.isEqual(
            this.callsToStartBle[0].uuid,
            this.bleDeviceUuid,
            'startBleBackend did not pass expected uuid to binding!'
        )

        debugger

        assert.isEqualDeep(
            this.callsToStartBle[0].charCallbacks,
            this.charCallbacks,
            'startBleBackend did not pass expected charCallbacks to binding!'
        )
    }

    @test()
    protected static async startBleBackendReturnsJson() {
        const json = this.startBleBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'startBleBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async writeBleCharacteristicCallsBindingWithExpectedArgs() {
        this.writeBleCharacteristic()

        assert.isEqualDeep(
            this.callsToWriteBle[0],
            [
                this.bleDeviceUuid,
                this.bleCharacteristicUuid,
                this.bleValueToWrite,
            ],
            'writeBleCharacteristic did not call binding with expected args!'
        )
    }

    @test()
    protected static async writeBleCharacteristicReturnsJson() {
        const json = this.writeBleCharacteristic()

        assert.isEqualDeep(
            json,
            { status: 200 },
            'writeBleCharacteristic did not return a JSON string!'
        )
    }

    @test()
    protected static async setBleRssiIntervalCallsBindingWithExpectedArgs() {
        this.setBleRssiInterval()

        const { uuid, intervalMs } = this.callsToSetBleRssiInterval[0]

        assert.isEqualDeep(
            { uuid, intervalMs },
            {
                uuid: this.bleDeviceUuid,
                intervalMs: this.bleRssiIntervalMs,
            },
            'setBleRssiInterval did not call binding with expected args!'
        )

        assert.isFunction(
            this.callsToSetBleRssiInterval[0].onRssi,
            'setBleRssiInterval did not pass an onRssi callback to the binding!'
        )
    }

    @test()
    protected static async setBleRssiIntervalReturnsJson() {
        const json = this.setBleRssiInterval()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'setBleRssiInterval did not return a JSON string!'
        )
    }

    @test()
    protected static async setBleRssiIntervalInvokesOnRssiWithRssiValue() {
        let received: number | undefined

        this.setBleRssiInterval((rssi: number) => {
            received = rssi
        })

        const registeredOnRssi = this.callsToSetBleRssiInterval[0].onRssi as (
            rssi: number
        ) => void
        registeredOnRssi(-72)

        assert.isEqual(received, -72, 'onRssi was not invoked with rssi value!')
    }

    @test()
    protected static async stopBleBackendCallsBindingWithExpectedArgs() {
        this.stopBleBackend()

        assert.isEqual(
            this.callsToStopBle[0][0],
            this.bleDeviceUuid,
            'stopBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async stopBleBackendReturnsJson() {
        const json = this.stopBleBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'stopBleBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async createFtdiBackendCallsBindingWithExpectedArgs() {
        this.createFtdiBackend()

        assert.isEqualDeep(
            this.callsToCreateFtdi[0][0],
            JSON.stringify({ serialNumber: this.ftdiSerialNumber }),
            'createFtdiBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async createFtdiBackendReturnsJson() {
        const json = this.createFtdiBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'createFtdiBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async startFtdiBackendCallsBindingWithExpectedArgs() {
        this.startFtdiBackend()

        assert.isEqual(
            this.callsToStartFtdi[0][0],
            this.ftdiSerialNumber,
            'startFtdiBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async startFtdiBackendReturnsJson() {
        const json = this.startFtdiBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'startFtdiBackend did not return a JSON string!'
        )
    }

    @test()
    protected static async stopFtdiBackendCallsBindingWithExpectedArgs() {
        this.stopFtdiBackend()

        assert.isEqual(
            this.callsToStopFtdi[0][0],
            this.ftdiSerialNumber,
            'stopFtdiBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async stopFtdiBackendReturnsJson() {
        const json = this.stopFtdiBackend()

        assert.isEqualDeep(
            json,
            this.successfulResult,
            'stopFtdiBackend did not return a JSON string!'
        )
    }

    private static discoverBleUuid(onDiscovered?: (uuid: string) => void) {
        return this.instance.discoverBleUuid({
            namePrefix: this.bleNamePrefix,
            onDiscovered: onDiscovered ?? (() => {}),
        })
    }

    private static createBleBackend() {
        return this.instance.createBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static startBleBackend(
        onConnected?: (peripheral: NativePeripheral) => void
    ) {
        return this.instance.startBleBackend({
            deviceUuid: this.bleDeviceUuid,
            onConnected: onConnected || (() => {}),
            charCallbacks: this.charCallbacks,
        })
    }

    private static writeBleCharacteristic() {
        return this.instance.writeBleCharacteristic({
            deviceUuid: this.bleDeviceUuid,
            charUuid: this.bleCharacteristicUuid,
            value: this.bleValueToWrite,
        })
    }

    private static stopBleBackend() {
        return this.instance.stopBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static setBleRssiInterval(onRssi?: (rssi: number) => void) {
        return this.instance.setBleRssiInterval({
            deviceUuid: this.bleDeviceUuid,
            intervalMs: this.bleRssiIntervalMs,
            onRssi: onRssi ?? (() => {}),
        })
    }

    private static createFtdiBackend() {
        return this.instance.createFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
    }

    private static startFtdiBackend() {
        return this.instance.startFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
    }

    private static stopFtdiBackend() {
        return this.instance.stopFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
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
            create_ble_backend: (args) => {
                this.callsToCreateBle.push(args)
                return JSON.stringify(this.successfulResult)
            },
            start_ble_backend: (args: any) => {
                this.callsToStartBle.push({
                    uuid: args[0],
                    onConnected: args[1],
                    charCallbacks: args[2],
                })
                return JSON.stringify(this.successfulResult)
            },
            write_ble_characteristic: (args) => {
                this.callsToWriteBle.push(args)
                return JSON.stringify(this.successfulResult)
            },
            set_ble_rssi_interval: (args) => {
                this.callsToSetBleRssiInterval.push({
                    uuid: args[0],
                    intervalMs: args[1],
                    onRssi: args[2],
                })
                return JSON.stringify(this.successfulResult)
            },
            stop_ble_backend: (args) => {
                this.callsToStopBle.push(args)
                return JSON.stringify(this.successfulResult)
            },
            create_ftdi_backend: (args) => {
                this.callsToCreateFtdi.push(args)
                return JSON.stringify(this.successfulResult)
            },
            start_ftdi_backend: (args) => {
                this.callsToStartFtdi.push(args)
                return JSON.stringify(this.successfulResult)
            },
            stop_ftdi_backend: (args) => {
                this.callsToStopFtdi.push(args)
                return JSON.stringify(this.successfulResult)
            },
        }
    }

    private static resetCallsToFakeBindings() {
        this.callsToDiscoverBle.length = 0
        this.callsToCreateBle.length = 0
        this.callsToStartBle.length = 0
        this.callsToStopBle.length = 0
        this.callsToSetBleRssiInterval.length = 0
        this.callsToCreateFtdi.length = 0
        this.callsToStartFtdi.length = 0
        this.callsToStopFtdi.length = 0
    }

    private static clearAndFakeFfi() {
        delete this.koffiLoadPath
        this.koffiFuncSignatures = []
        this.koffiProtoCalls = []
        this.koffiStructCalls = []
        LibndxAdapter.resetKoffiCache()
        this.fakeKoffiLoad()
        this.fakeKoffiRegister()
        this.fakeKoffiProto()
        this.fakeKoffiPointer()
        this.fakeKoffiStruct()
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
        return LibndxAdapter.getInstance()
    }
}
