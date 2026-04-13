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
    public static callsToGetRssiBleBackend: BleBackendOptions[] = []
    public static callsToCreateFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStartFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStopFtdiBackend: FtdiBackendOptions[] = []
    public static callsToDestroyFtdiBackend: FtdiBackendOptions[] = []

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

    public getRssiBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToGetRssiBleBackend.push(options)
        return ''
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToCreateFtdiBackend.push(options)
        return ''
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToStartFtdiBackend.push(options)
        return ''
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToStopFtdiBackend.push(options)
        return ''
    }

    public destroyFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToDestroyFtdiBackend.push(options)
        return ''
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
        FakeLibndx.callsToStopBleBacked = []
        FakeLibndx.callsToGetRssiBleBackend = []
        FakeLibndx.callsToDestroyBleBackend = []
        FakeLibndx.callsToCreateFtdiBackend = []
        FakeLibndx.callsToStartFtdiBackend = []
        FakeLibndx.callsToStopFtdiBackend = []
        FakeLibndx.callsToDestroyFtdiBackend = []
    }
}
