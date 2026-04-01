import {
    CreateBleBackendOptions,
    Libndx,
    LibndxAdapterOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: CreateBleBackendOptions[] = []

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public createBleBackend(options: CreateBleBackendOptions) {
        FakeLibndx.callsToCreateBleBackend.push(options)
        return ''
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
    }
}
