import { Libndx } from '../../impl/LibndxAdapter.js'

export default class FakeLibndx implements Libndx {
    public static numCallsToConstructor = 0

    public constructor() {
        FakeLibndx.numCallsToConstructor++
    }

    public static resetTestDouble() {
        FakeLibndx.numCallsToConstructor = 0
    }
}
