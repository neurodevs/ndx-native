import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, { Libndx } from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import { DataType, define, OpenParams } from 'ffi-rs'
import { LibxdfBindings } from '../../impl/LibxdfAdapter.js'
import { FfiRsDefineOptions } from '../../types.js'
import FakeLibndx from '../../testDoubles/Libndx/FakeLibndx.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    public static ffiRsDefine = define

    private static instance: Libndx
    private static libndxPath = this.generateId()
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibxdfBindings

    private static ffiRsOpenOptions?: OpenParams
    private static ffiRsDefineOptions?: FfiRsDefineOptions

    protected static async beforeEach() {
        await super.beforeEach()

        this.shouldThrowWhenLoadingBindings = false
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

    private static resetInstance() {
        LibndxAdapter.resetInstance()
    }

    private static LibndxAdapter() {
        return LibndxAdapter.getInstance({
            libndxPath: this.libndxPath,
        })
    }
}
