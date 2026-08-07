import {
    RegisterBleGattCharCallbacksOptions,
    BleGattBackendOptions,
    WriteBleGattCharOptions,
    UsbBackendOptions,
    WriteUsbBackendOptions,
    Libndx,
    LibndxAdapterOptions,
    StartBleGattBackendOptions,
    NativeResult,
    BleGattRssiOptions,
    DiscoverBleUuidOptions,
    StartUsbBackendOptions,
    StartBleAdvertisementBackendOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []

    public static callsToDiscoverBleUuid: DiscoverBleUuidOptions[] = []

    public static callsToCreateBleGattBackend: BleGattBackendOptions[] = []
    public static callsToStartBleGattBackend: StartBleGattBackendOptions[] = []
    public static callsToRegisterBleGattCharCallbacks: RegisterBleGattCharCallbacksOptions[] =
        []
    public static callsToWriteBleGattChar: WriteBleGattCharOptions[] = []
    public static callsToStopBleGattBackend: BleGattBackendOptions[] = []
    public static callsToStartBleGattRssiPolling: BleGattRssiOptions[] = []
    public static callsToStopBleGattRssiPolling: BleGattBackendOptions[] = []

    public static callsToCreateBleAdvertisement: BleGattBackendOptions[] = []
    public static callsToStartBleAdvertisement: StartBleAdvertisementBackendOptions[] =
        []
    public static callsToStopBleAdvertisement: BleGattBackendOptions[] = []

    public static callsToCreateUsbBackend: UsbBackendOptions[] = []
    public static callsToStartUsbBackend: StartUsbBackendOptions[] = []
    public static callsToWriteUsbBackend: WriteUsbBackendOptions[] = []
    public static callsToStopUsbBackend: UsbBackendOptions[] = []

    public static fakeResult: NativeResult = { status: 200 }

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public discoverBleUuid(options: DiscoverBleUuidOptions) {
        FakeLibndx.callsToDiscoverBleUuid.push(options)
        return FakeLibndx.fakeResult
    }

    public createBleGattBackend(options: BleGattBackendOptions) {
        FakeLibndx.callsToCreateBleGattBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleGattBackend(options: StartBleGattBackendOptions) {
        FakeLibndx.callsToStartBleGattBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public registerBleGattCharCallbacks(
        options: RegisterBleGattCharCallbacksOptions
    ) {
        FakeLibndx.callsToRegisterBleGattCharCallbacks.push(options)
        return FakeLibndx.fakeResult
    }

    public writeBleGattChar(options: WriteBleGattCharOptions) {
        FakeLibndx.callsToWriteBleGattChar.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleGattRssiPolling(options: BleGattRssiOptions) {
        FakeLibndx.callsToStartBleGattRssiPolling.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleGattRssiPolling(options: BleGattBackendOptions) {
        FakeLibndx.callsToStopBleGattRssiPolling.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleGattBackend(options: BleGattBackendOptions) {
        FakeLibndx.callsToStopBleGattBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public createBleAdvertisementBackend(options: BleGattBackendOptions) {
        FakeLibndx.callsToCreateBleAdvertisement.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleAdvertisementBackend(
        options: StartBleAdvertisementBackendOptions
    ) {
        FakeLibndx.callsToStartBleAdvertisement.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleAdvertisementBackend(options: BleGattBackendOptions) {
        FakeLibndx.callsToStopBleAdvertisement.push(options)
        return FakeLibndx.fakeResult
    }

    public createUsbBackend(options: UsbBackendOptions) {
        FakeLibndx.callsToCreateUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startUsbBackend(options: StartUsbBackendOptions) {
        FakeLibndx.callsToStartUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeUsbBackend(options: WriteUsbBackendOptions) {
        FakeLibndx.callsToWriteUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopUsbBackend(options: UsbBackendOptions) {
        FakeLibndx.callsToStopUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToDiscoverBleUuid = []
        FakeLibndx.callsToCreateBleGattBackend = []
        FakeLibndx.callsToStartBleGattBackend = []
        FakeLibndx.callsToRegisterBleGattCharCallbacks = []
        FakeLibndx.callsToWriteBleGattChar = []
        FakeLibndx.callsToStopBleGattBackend = []
        FakeLibndx.callsToStartBleGattRssiPolling = []
        FakeLibndx.callsToStopBleGattRssiPolling = []
        FakeLibndx.callsToCreateBleAdvertisement = []
        FakeLibndx.callsToStartBleAdvertisement = []
        FakeLibndx.callsToStopBleAdvertisement = []
        FakeLibndx.callsToCreateUsbBackend = []
        FakeLibndx.callsToStartUsbBackend = []
        FakeLibndx.callsToWriteUsbBackend = []
        FakeLibndx.callsToStopUsbBackend = []
    }
}
