import {
    BleBackendOptions,
    Libndx,
    LibndxAdapterOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: BleBackendOptions[] = []

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public createBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToCreateBleBackend.push(options)
        return ''
    }

    public startBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToStartBleBackend.push(options)
        return ''
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
    }
}
