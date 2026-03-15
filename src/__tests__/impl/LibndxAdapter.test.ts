import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, { Libndx } from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'
import { define } from 'ffi-rs'
import { LibxdfBindings } from '../../impl/LibxdfAdapter.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    public static ffiRsDefine = define

    private static instance: Libndx
    private static libndxPath = this.generateId()
    private static shouldThrowWhenLoadingBindings: boolean
    private static fakeBindings: LibxdfBindings

    protected static async beforeEach() {
        await super.beforeEach()

        this.shouldThrowWhenLoadingBindings = false
        this.fakeFfiRsDefine()

        this.instance = this.LibndxAdapter()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async throwsWhenBindingsFailToLoad() {
        this.shouldThrowWhenLoadingBindings = true

        const err = await assert.doesThrowAsync(async () =>
            this.LibndxAdapter()
        )

        const actual = (err.message ?? err.stack).replace(/\s+/g, '')

        assert.isEqual(
            actual,
            this.failedToLoadError,
            'Did not receive the expected error!'
        )
    }

    private static fakeFfiRsDefine() {
        LibndxAdapter.ffiRsDefine = ((_options) => {
            if (this.shouldThrowWhenLoadingBindings) {
                throw new Error(this.fakeErrorMessage)
            }

            this.ffiRsDefine = define

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

    private static LibndxAdapter() {
        return LibndxAdapter.Create({
            libndxPath: this.libndxPath,
        })
    }
}
