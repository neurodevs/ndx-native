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
    BluetoothOptions,
    DiscoverBluetoothAddressesOptions,
    StartBluetoothOptions,
    WriteBluetoothOptions,
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

    public static callsToDiscoverBluetoothAddresses: DiscoverBluetoothAddressesOptions[] =
        []
    public static fakeBluetoothAddresses: string[] = []

    public static callsToCreateBluetoothBackend: BluetoothOptions[] = []
    public static callsToStartBluetoothBackend: StartBluetoothOptions[] = []
    public static callsToWriteBluetoothBackend: WriteBluetoothOptions[] = []
    public static callsToStopBluetoothBackend: BluetoothOptions[] = []

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

    public discoverBluetoothAddresses(
        options: DiscoverBluetoothAddressesOptions
    ) {
        FakeLibndx.callsToDiscoverBluetoothAddresses.push(options)

        return {
            ...FakeLibndx.fakeResult,
            addresses: FakeLibndx.fakeBluetoothAddresses,
        }
    }

    public createBluetoothBackend(options: BluetoothOptions) {
        FakeLibndx.callsToCreateBluetoothBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public startBluetoothBackend(options: StartBluetoothOptions) {
        FakeLibndx.callsToStartBluetoothBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public writeBluetoothBackend(options: WriteBluetoothOptions) {
        FakeLibndx.callsToWriteBluetoothBackend.push(options)
        return FakeLibndx.fakeResult
    }

    public stopBluetoothBackend(options: BluetoothOptions) {
        FakeLibndx.callsToStopBluetoothBackend.push(options)
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
        FakeLibndx.callsToDiscoverBluetoothAddresses = []
        FakeLibndx.fakeBluetoothAddresses = []
        FakeLibndx.callsToCreateBluetoothBackend = []
        FakeLibndx.callsToStartBluetoothBackend = []
        FakeLibndx.callsToWriteBluetoothBackend = []
        FakeLibndx.callsToStopBluetoothBackend = []
    }
}
