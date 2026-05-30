import {
    BleBackendOptions,
    WriteBleCharacteristicOptions,
    FtdiBackendOptions,
    Libndx,
    LibndxAdapterOptions,
    StartBleBackendOptions,
    NativeResult,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: StartBleBackendOptions[] = []
    public static callsToWriteBleChar: WriteBleCharacteristicOptions[] = []
    public static callsToStopBleBackend: BleBackendOptions[] = []
    public static callsToGetRssiBleBackend: BleBackendOptions[] = []
    public static callsToCreateFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStartFtdiBackend: FtdiBackendOptions[] = []
    public static callsToStopFtdiBackend: FtdiBackendOptions[] = []

    public static fakeResult: NativeResult = { status: 200 }

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public createBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToCreateBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleBackend(options: StartBleBackendOptions) {
        FakeLibndx.callsToStartBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeBleCharacteristic(options: WriteBleCharacteristicOptions) {
        FakeLibndx.callsToWriteBleChar.push(options)
        return FakeLibndx.fakeResult
    }

    public readBleRssi(options: BleBackendOptions) {
        FakeLibndx.callsToGetRssiBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToStopBleBackend.push(options)
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

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
        FakeLibndx.callsToWriteBleChar = []
        FakeLibndx.callsToStopBleBackend = []
        FakeLibndx.callsToGetRssiBleBackend = []
        FakeLibndx.callsToCreateFtdiBackend = []
        FakeLibndx.callsToStartFtdiBackend = []
        FakeLibndx.callsToStopFtdiBackend = []
    }
}
