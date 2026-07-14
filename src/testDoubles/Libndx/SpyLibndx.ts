import LibndxAdapter, {
    LibndxAdapterOptions,
} from '../../impl/LibndxAdapter.js'

export default class SpyLibndx extends LibndxAdapter {
    public constructor(options?: LibndxAdapterOptions) {
        super(options)
    }

    public getRegisteredCallbacks() {
        return this.registeredCallbacks
    }
}
