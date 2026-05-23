import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, {
    Libndx,
    LibndxBindings,
} from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import FakeLibndx from '../../testDoubles/Libndx/FakeLibndx.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    private static instance: Libndx
    private static libndxPath = '/opt/local/lib/libndx.dylib'
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibndxBindings

    private static koffiLoadPath?: string
    private static koffiFuncSignatures?: string[]

    private static readonly bleDeviceUuid = this.generateId()
    private static readonly bleCharacteristicUuid = this.generateId()
    private static readonly bleValueToWrite = this.generateId()

    private static readonly ftdiSerialNumber = this.generateId()

    private static readonly callsToCreateBle: string[][] = []
    private static readonly callsToStartBle: string[][] = []
    private static readonly callsToWriteBle: string[][] = []
    private static readonly callsToReadRssi: string[][] = []
    private static readonly callsToStopBle: string[][] = []
    private static readonly callsToDestroyBle: string[][] = []
    private static readonly callsToCreateFtdi: string[][] = []
    private static readonly callsToStartFtdi: string[][] = []
    private static readonly callsToStopFtdi: string[][] = []
    private static readonly callsToDestroyFtdi: string[][] = []

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
                'str create_ble_backend(str config)',
                'str start_ble_backend(str uuid)',
                'str write_ble_characteristic(str uuid, str charUuid, str value)',
                'str read_ble_rssi(str uuid)',
                'str stop_ble_backend(str uuid)',
                'str destroy_ble_backend(str uuid)',
                'str create_ftdi_backend(str config)',
                'str start_ftdi_backend(str serial)',
                'str stop_ftdi_backend(str serial)',
                'str destroy_ftdi_backend(str serial)',
            ],
            'Did not register expected koffi func signatures!'
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
    protected static async createBleBackendCallsBindingWithExpectedArgs() {
        this.createBleBackend()

        assert.isEqualDeep(
            this.callsToCreateBle[0][0],
            JSON.stringify({ uuid: this.bleDeviceUuid }),
            'createBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async createBleBackendReturnsJsonString() {
        const raw = this.createBleBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'createBleBackend did not return a JSON string!')
    }

    @test()
    protected static async startBleBackendCallsBindingWithExpectedArgs() {
        this.startBleBackend()

        assert.isEqual(
            this.callsToStartBle[0][0],
            this.bleDeviceUuid,
            'startBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async startBleBackendReturnsJsonString() {
        const raw = this.startBleBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'startBleBackend did not return a JSON string!')
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
    protected static async writeBleCharacteristicReturnsJsonString() {
        const raw = this.writeBleCharacteristic()
        const json = JSON.parse(raw)

        assert.isTruthy(
            json,
            'writeBleCharacteristic did not return a JSON string!'
        )
    }

    @test()
    protected static async getRssiBleBackendCallsBindingWithExpectedArgs() {
        this.getRssiBleBackend()

        assert.isEqual(
            this.callsToReadRssi[0][0],
            this.bleDeviceUuid,
            'getRssiBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async getRssiBleBackendReturnsJson() {
        const raw = this.getRssiBleBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'getRssiBleBackend did not return a JSON string!')
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
    protected static async stopBleBackendReturnsJsonString() {
        const raw = this.stopBleBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'stopBleBackend did not return a JSON string!')
    }

    @test()
    protected static async destroyBleBackendCallsBindingWithExpectedArgs() {
        this.destroyBleBackend()

        assert.isEqual(
            this.callsToDestroyBle[0][0],
            this.bleDeviceUuid,
            'destroyBleBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async destroyBleBackendReturnsJson() {
        const raw = this.destroyBleBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'destroyBleBackend did not return a JSON string!')
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
    protected static async createFtdiBackendReturnsJsonString() {
        const raw = this.createFtdiBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'createFtdiBackend did not return a JSON string!')
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
    protected static async startFtdiBackendReturnsJsonString() {
        const raw = this.startFtdiBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'startFtdiBackend did not return a JSON string!')
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
    protected static async stopFtdiBackendReturnsJsonString() {
        const raw = this.stopFtdiBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'stopFtdiBackend did not return a JSON string!')
    }

    @test()
    protected static async destroyFtdiBackendCallsBindingWithExpectedArgs() {
        this.destroyFtdiBackend()

        assert.isEqual(
            this.callsToDestroyFtdi[0][0],
            this.ftdiSerialNumber,
            'destroyFtdiBackend did not call binding with expected args!'
        )
    }

    @test()
    protected static async destroyFtdiBackendReturnsJsonString() {
        const raw = this.destroyFtdiBackend()
        const json = JSON.parse(raw)

        assert.isTruthy(
            json,
            'destroyFtdiBackend did not return a JSON string!'
        )
    }

    private static createBleBackend() {
        return this.instance.createBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static startBleBackend() {
        return this.instance.startBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static writeBleCharacteristic() {
        return this.instance.writeBleCharacteristic({
            deviceUuid: this.bleDeviceUuid,
            characteristicUuid: this.bleCharacteristicUuid,
            value: this.bleValueToWrite,
        })
    }

    private static stopBleBackend() {
        return this.instance.stopBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static destroyBleBackend() {
        return this.instance.destroyBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
    }

    private static getRssiBleBackend() {
        return this.instance.readBleRssi({
            deviceUuid: this.bleDeviceUuid,
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

    private static destroyFtdiBackend() {
        return this.instance.destroyFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
    }

    private static FakeBindings(): LibndxBindings {
        return {
            create_ble_backend: (args) => {
                this.callsToCreateBle.push(args)
                return JSON.stringify({})
            },
            start_ble_backend: (args) => {
                this.callsToStartBle.push(args)
                return JSON.stringify({})
            },
            write_ble_characteristic: (args) => {
                this.callsToWriteBle.push(args)
                return JSON.stringify({})
            },
            read_ble_rssi: (args) => {
                this.callsToReadRssi.push(args)
                return JSON.stringify({})
            },
            stop_ble_backend: (args) => {
                this.callsToStopBle.push(args)
                return JSON.stringify({})
            },
            destroy_ble_backend: (args) => {
                this.callsToDestroyBle.push(args)
                return JSON.stringify({})
            },
            create_ftdi_backend: (args) => {
                this.callsToCreateFtdi.push(args)
                return JSON.stringify({})
            },
            start_ftdi_backend: (args) => {
                this.callsToStartFtdi.push(args)
                return JSON.stringify({})
            },
            stop_ftdi_backend: (args) => {
                this.callsToStopFtdi.push(args)
                return JSON.stringify({})
            },
            destroy_ftdi_backend: (args) => {
                this.callsToDestroyFtdi.push(args)
                return JSON.stringify({})
            },
        }
    }

    private static resetCallsToFakeBindings() {
        this.callsToCreateBle.length = 0
        this.callsToStartBle.length = 0
        this.callsToStopBle.length = 0
        this.callsToDestroyBle.length = 0
        this.callsToReadRssi.length = 0
        this.callsToCreateFtdi.length = 0
        this.callsToStartFtdi.length = 0
        this.callsToStopFtdi.length = 0
        this.callsToDestroyFtdi.length = 0
    }

    private static clearAndFakeFfi() {
        delete this.koffiLoadPath
        this.koffiFuncSignatures = []
        this.fakeKoffiLoad()
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

                    const name = sig.match(/\w+\s+(\w+)\s*\(/)![1] as keyof LibndxBindings
                    return (...args: string[]) =>
                        this.fakeBindings[name](args as any)
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
