import { test, assert } from '@neurodevs/node-tdd'

import LibndxAdapter, { Libndx } from '../../impl/LibndxAdapter.js'
import AbstractPackageTest from '../AbstractPackageTest.js'

export default class LibndxAdapterTest extends AbstractPackageTest {
    private static instance: Libndx

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = this.LibndxAdapter()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    private static LibndxAdapter() {
        return LibndxAdapter.Create()
    }
}
