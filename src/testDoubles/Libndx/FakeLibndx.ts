import {
    BleBackendOptions,
    BleWriteOptions,
    FtdiBackendOptions,
    Libndx,
    LibndxAdapterOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: BleBackendOptions[] = []
    public static callsToWriteBle: BleWriteOptions[] = []
    public static callsToStopBleBacked: BleBackendOptions[] = []
    public static callsToDestroyBleBackend: BleBackendOptions[] = []
    public static callsToGetRssiBleBackend: BleBackendOptions[] = []
    public static callsToCreateFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStartFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStopFtdiBackend: FtdiBackendOptions[] = []
    public static callsToDestroyFtdiBackend: FtdiBackendOptions[] = []

    public static fakeResult = ''

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public createBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToCreateBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToStartBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeBleCharacteristic(options: BleWriteOptions) {
        FakeLibndx.callsToWriteBle.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToStopBleBacked.push(options)
        return FakeLibndx.fakeResult
    }

    public destroyBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToDestroyBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public getRssiBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToGetRssiBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public createFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToCreateFtdiBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToStartFtdiBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToStopFtdiBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public destroyFtdiBackend(options: FtdiBackendOptions) {
        FakeLibndx.callsToDestroyFtdiBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
        FakeLibndx.callsToWriteBle = []
        FakeLibndx.callsToStopBleBacked = []
        FakeLibndx.callsToGetRssiBleBackend = []
        FakeLibndx.callsToDestroyBleBackend = []
        FakeLibndx.callsToCreateFtdiBackend = []
        FakeLibndx.callsToStartFtdiBackend = []
        FakeLibndx.callsToStopFtdiBackend = []
        FakeLibndx.callsToDestroyFtdiBackend = []
    }
}
