import {
    AddBleCharCallbacksOptions,
    BleBackendOptions,
    WriteBleCharacteristicOptions,
    FtdiBackendOptions,
    Libndx,
    LibndxAdapterOptions,
    StartBleBackendOptions,
    NativeResult,
    BleRssiOptions,
    DiscoverBleUuidOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []
    public static callsToDiscoverBleUuid: DiscoverBleUuidOptions[] = []
    public static callsToCreateBleBackend: BleBackendOptions[] = []
    public static callsToStartBleBackend: StartBleBackendOptions[] = []
    public static callsToAddBleCharCallbacks: AddBleCharCallbacksOptions[] = []
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

    public discoverBleUuid(options: DiscoverBleUuidOptions) {
        FakeLibndx.callsToDiscoverBleUuid.push(options)
        return FakeLibndx.fakeResult
    }

    public createBleBackend(options: BleBackendOptions) {
        FakeLibndx.callsToCreateBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleBackend(options: StartBleBackendOptions) {
        FakeLibndx.callsToStartBleBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public addBleCharCallbacks(options: AddBleCharCallbacksOptions) {
        FakeLibndx.callsToAddBleCharCallbacks.push(options)
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
        FakeLibndx.callsToDiscoverBleUuid = []
        FakeLibndx.callsToCreateBleBackend = []
        FakeLibndx.callsToStartBleBackend = []
        FakeLibndx.callsToAddBleCharCallbacks = []
        FakeLibndx.callsToWriteBleCharacteristic = []
        FakeLibndx.callsToStopBleBackend = []
        FakeLibndx.callsToSetBleRssiInterval = []
        FakeLibndx.callsToCreateFtdiBackend = []
        FakeLibndx.callsToStartFtdiBackend = []
        FakeLibndx.callsToStopFtdiBackend = []
    }
}
