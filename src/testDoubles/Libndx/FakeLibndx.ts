import {
    RegisterBleGattCharCallbacksOptions,
    BleOptions,
    WriteBleGattCharOptions,
    UsbOptions,
    WriteUsbOptions,
    Libndx,
    LibndxAdapterOptions,
    StartBleGattOptions,
    NativeResult,
    BleGattRssiOptions,
    DiscoverBleUuidOptions,
    StartUsbOptions,
    StartBleObserverOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []

    public static callsToDiscoverBleUuid: DiscoverBleUuidOptions[] = []

    public static callsToCreateBleGattBackend: BleOptions[] = []
    public static callsToStartBleGattBackend: StartBleGattOptions[] = []
    public static callsToRegisterBleGattCharCallbacks: RegisterBleGattCharCallbacksOptions[] =
        []
    public static callsToWriteBleGattChar: WriteBleGattCharOptions[] = []
    public static callsToStopBleGattBackend: BleOptions[] = []
    public static callsToStartBleGattRssiPolling: BleGattRssiOptions[] = []
    public static callsToStopBleGattRssiPolling: BleOptions[] = []

    public static callsToCreateBleObserver: BleOptions[] = []
    public static callsToStartBleObserver: StartBleObserverOptions[] = []
    public static callsToStopBleObserver: BleOptions[] = []

    public static callsToCreateUsbBackend: UsbOptions[] = []
    public static callsToStartUsbBackend: StartUsbOptions[] = []
    public static callsToWriteUsbBackend: WriteUsbOptions[] = []
    public static callsToStopUsbBackend: UsbOptions[] = []

    public static fakeResult: NativeResult = { status: 200 }

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public discoverBleUuid(options: DiscoverBleUuidOptions) {
        FakeLibndx.callsToDiscoverBleUuid.push(options)
        return FakeLibndx.fakeResult
    }

    public createBleGattBackend(options: BleOptions) {
        FakeLibndx.callsToCreateBleGattBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleGattBackend(options: StartBleGattOptions) {
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

    public stopBleGattRssiPolling(options: BleOptions) {
        FakeLibndx.callsToStopBleGattRssiPolling.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleGattBackend(options: BleOptions) {
        FakeLibndx.callsToStopBleGattBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public createBleObserverBackend(options: BleOptions) {
        FakeLibndx.callsToCreateBleObserver.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleObserverBackend(options: StartBleObserverOptions) {
        FakeLibndx.callsToStartBleObserver.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleObserverBackend(options: BleOptions) {
        FakeLibndx.callsToStopBleObserver.push(options)
        return FakeLibndx.fakeResult
    }

    public createUsbBackend(options: UsbOptions) {
        FakeLibndx.callsToCreateUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startUsbBackend(options: StartUsbOptions) {
        FakeLibndx.callsToStartUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeUsbBackend(options: WriteUsbOptions) {
        FakeLibndx.callsToWriteUsbBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopUsbBackend(options: UsbOptions) {
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
        FakeLibndx.callsToCreateBleObserver = []
        FakeLibndx.callsToStartBleObserver = []
        FakeLibndx.callsToStopBleObserver = []
        FakeLibndx.callsToCreateUsbBackend = []
        FakeLibndx.callsToStartUsbBackend = []
        FakeLibndx.callsToWriteUsbBackend = []
        FakeLibndx.callsToStopUsbBackend = []
    }
}
