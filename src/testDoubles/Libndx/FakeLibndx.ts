import {
    BleBackendOptions,
    WriteBleCharacteristicOptions,
    FtdiBackendOptions,
    Libndx,
    LibndxAdapterOptions,
    StartBleBackendOptions,
    NativeResult,
    BleRssiOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: StartBleBackendOptions[] = []
    public static callsToWriteBleCharacteristic: WriteBleCharacteristicOptions[] =
        []
    public static callsToStopBleBackend: BleBackendOptions[] = []
    public static callsToSetBleRssiInterval: BleRssiOptions[] = []
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
        FakeLibndx.callsToWriteBleCharacteristic.push(options)
        return FakeLibndx.fakeResult
    }

    public setBleRssiInterval(options: BleRssiOptions) {
        FakeLibndx.callsToSetBleRssiInterval.push(options)
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
        FakeLibndx.callsToWriteBleCharacteristic = []
        FakeLibndx.callsToStopBleBackend = []
        FakeLibndx.callsToSetBleRssiInterval = []
        FakeLibndx.callsToCreateFtdiBackend = []
        FakeLibndx.callsToStartFtdiBackend = []
        FakeLibndx.callsToStopFtdiBackend = []
    }
}
