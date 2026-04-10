import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, {
    Libndx,
    LibndxBindings,
} from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import { DataType, define, OpenParams } from 'ffi-rs'
import { FfiRsDefineOptions } from '../../types.js'
import FakeLibndx from '../../testDoubles/Libndx/FakeLibndx.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    public static ffiRsDefine = define

    private static instance: Libndx
    private static libndxPath = '/opt/local/lib/libndx.dylib'
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibndxBindings

    private static ffiRsOpenOptions?: OpenParams
    private static ffiRsDefineOptions?: FfiRsDefineOptions

    private static readonly bleDeviceUuid = this.generateId()
    private static readonly ftdiSerialNumber = this.generateId()

    protected static async beforeEach() {
        await super.beforeEach()

        this.shouldThrowWhenLoadingBindings = false
        this.fakeBindings = this.FakeBindings()
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
    protected static async callsFfiRsOpenWithRequiredOptions() {
        assert.isEqualDeep(this.ffiRsOpenOptions, {
            library: 'ndx',
            path: this.libndxPath,
        })
    }

    @test()
    protected static async callsFfiRsDefineWithRequiredOptions() {
        assert.isEqualDeep(
            this.ffiRsDefineOptions,
            {
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
            },
            'Did not pass valid options to ffiRsDefine!'
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
    protected static async createBleBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.createBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'createBleBackend did not return a JSON string!')
    }

    @test()
    protected static async startBleBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.startBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'startBleBackend did not return a JSON string!')
    }

    @test()
    protected static async stopBleBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.stopBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'stopBleBackend did not return a JSON string!')
    }

    @test()
    protected static async destroyBleBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.destroyBleBackend({
            deviceUuid: this.bleDeviceUuid,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'destroyBleBackend did not return a JSON string!')
    }

    @test()
    protected static async createFtdiBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.createFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'createFtdiBackend did not return a JSON string!')
    }

    @test()
    protected static async startFtdiBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.startFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'startFtdiBackend did not return a JSON string!')
    }

    @test()
    protected static async stopFtdiBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.stopFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(json, 'stopFtdiBackend did not return a JSON string!')
    }

    @test()
    protected static async destroyFtdiBackendCallsBindingAndReturnsJsonString() {
        const raw = this.instance.destroyFtdiBackend({
            serialNumber: this.ftdiSerialNumber,
        })
        const json = JSON.parse(raw)

        assert.isTruthy(
            json,
            'destroyFtdiBackend did not return a JSON string!'
        )
    }

    private static clearAndFakeFfi() {
        delete this.ffiRsOpenOptions
        delete this.ffiRsDefineOptions
        this.fakeFfiRsOpen()
        this.fakeFfiRsDefine()
    }

    private static fakeFfiRsOpen() {
        LibndxAdapter.ffiRsOpen = (options) => {
            this.ffiRsOpenOptions = options
        }
    }

    private static fakeFfiRsDefine() {
        LibndxAdapter.ffiRsDefine = ((options) => {
            this.ffiRsDefineOptions = options

            if (this.shouldThrowWhenLoadingBindings) {
                throw new Error(this.fakeErrorMessage)
            }

            return this.fakeBindings as any
        }) as typeof define
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

    private static FakeBindings(): LibndxBindings {
        return {
            create_ble_backend: () => JSON.stringify({}),
            start_ble_backend: () => JSON.stringify({}),
            stop_ble_backend: () => JSON.stringify({}),
            destroy_ble_backend: () => JSON.stringify({}),
            create_ftdi_backend: () => JSON.stringify({}),
            start_ftdi_backend: () => JSON.stringify({}),
            stop_ftdi_backend: () => JSON.stringify({}),
            destroy_ftdi_backend: () => JSON.stringify({}),
        }
    }

    private static resetInstance() {
        LibndxAdapter.resetInstance()
    }

    private static LibndxAdapter() {
        return LibndxAdapter.getInstance()
    }
}
