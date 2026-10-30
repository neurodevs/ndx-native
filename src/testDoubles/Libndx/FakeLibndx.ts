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
    StartBleScanOptions,
    StopBleScanOptions,
    StartUsbOptions,
    StartBleObserverOptions,
    RfcommOptions,
    DiscoverRfcommAddressesOptions,
    StartRfcommOptions,
    WriteRfcommOptions,
} from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static callsToConstructor: (LibndxAdapterOptions | undefined)[] = []

    public static callsToDiscoverBleUuid: DiscoverBleUuidOptions[] = []
    public static callsToStartBleScan: StartBleScanOptions[] = []
    public static callsToStopBleScan: StopBleScanOptions[] = []

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

    public static numCallsToDiscoverUsbSerialNumbers = 0
    public static fakeUsbSerialNumbers: string[] = []

    public static callsToDiscoverRfcommAddresses: DiscoverRfcommAddressesOptions[] =
        []
    public static fakeRfcommAddresses: string[] = []

    public static callsToCreateRfcommBackend: RfcommOptions[] = []
    public static callsToStartRfcommBackend: StartRfcommOptions[] = []
    public static callsToWriteRfcommBackend: WriteRfcommOptions[] = []
    public static callsToStopRfcommBackend: RfcommOptions[] = []

    public static fakeResult: NativeResult = { status: 200 }

    public constructor(options?: LibndxAdapterOptions) {
        FakeLibndx.callsToConstructor.push(options)
    }

    public discoverBleUuid(options: DiscoverBleUuidOptions) {
        FakeLibndx.callsToDiscoverBleUuid.push(options)
        return FakeLibndx.fakeResult
    }

    public startBleScan(options: StartBleScanOptions) {
        FakeLibndx.callsToStartBleScan.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBleScan(options: StopBleScanOptions) {
        FakeLibndx.callsToStopBleScan.push(options)
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

    public discoverUsbSerialNumbers() {
        FakeLibndx.numCallsToDiscoverUsbSerialNumbers++

        return {
            ...FakeLibndx.fakeResult,
            serialNumbers: FakeLibndx.fakeUsbSerialNumbers,
        }
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

    public discoverRfcommAddresses(options: DiscoverRfcommAddressesOptions) {
        FakeLibndx.callsToDiscoverRfcommAddresses.push(options)

        return {
            ...FakeLibndx.fakeResult,
            addresses: FakeLibndx.fakeRfcommAddresses,
        }
    }

    public createRfcommBackend(options: RfcommOptions) {
        FakeLibndx.callsToCreateRfcommBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startRfcommBackend(options: StartRfcommOptions) {
        FakeLibndx.callsToStartRfcommBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeRfcommBackend(options: WriteRfcommOptions) {
        FakeLibndx.callsToWriteRfcommBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopRfcommBackend(options: RfcommOptions) {
        FakeLibndx.callsToStopRfcommBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public static resetTestDouble() {
        FakeLibndx.callsToConstructor = []
        FakeLibndx.callsToDiscoverBleUuid = []
        FakeLibndx.callsToStartBleScan = []
        FakeLibndx.callsToStopBleScan = []
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
        FakeLibndx.numCallsToDiscoverUsbSerialNumbers = 0
        FakeLibndx.fakeUsbSerialNumbers = []
        FakeLibndx.callsToCreateUsbBackend = []
        FakeLibndx.callsToStartUsbBackend = []
        FakeLibndx.callsToWriteUsbBackend = []
        FakeLibndx.callsToStopUsbBackend = []
        FakeLibndx.callsToDiscoverRfcommAddresses = []
        FakeLibndx.fakeRfcommAddresses = []
        FakeLibndx.callsToCreateRfcommBackend = []
        FakeLibndx.callsToStartRfcommBackend = []
        FakeLibndx.callsToWriteRfcommBackend = []
        FakeLibndx.callsToStopRfcommBackend = []
    }
}
