import {
    BleBackendOptions,
    FtdiBackendOptions,
    Libndx,
    LibndxAdapterOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: BleBackendOptions[] = []
    public static callsToStopBleBacked: BleBackendOptions[] = []
    public static callsToDestroyBleBackend: BleBackendOptions[] = []
    public static callsToCreateFtdiBackend: FtdiBackendOptions[] = []

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

    public stopBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToStopBleBacked.push(options)
        return ''
    }

    public destroyBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToDestroyBleBackend.push(options)
        return ''
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToCreateFtdiBackend.push(options)
        return ''
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
        FakeLibndx.callsToStopBleBacked = []
        FakeLibndx.callsToDestroyBleBackend = []
        FakeLibndx.callsToCreateFtdiBackend = []
    }
}
