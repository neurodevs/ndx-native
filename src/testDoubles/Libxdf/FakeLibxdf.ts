import { MangledNameMap } from '@neurodevs/node-mangled-names'

import { Libxdf, XdfFile } from '../../impl/LibxdfAdapter.js'

export default class FakeLibxdf implements Libxdf {
    public static libxdfPath?: string
    public static loadXdfCalls: string[] = []
    public static mangledNameMap: MangledNameMap
    public static fakeXdfFile: XdfFile = { path: '', streams: [], events: [] }

    public constructor(libxdfPath: string, mangledNameMap: MangledNameMap) {
        FakeLibxdf.libxdfPath = libxdfPath
        FakeLibxdf.mangledNameMap = mangledNameMap
    }

    public loadXdf(path: string) {
        FakeLibxdf.loadXdfCalls.push(path)
        return this.fakeXdfFile
    }

    public get mangledNameMap() {
        return FakeLibxdf.mangledNameMap
    }

    public get fakeXdfFile() {
        return FakeLibxdf.fakeXdfFile
    }

    public static resetTestDouble() {
        FakeLibxdf.libxdfPath = undefined
        FakeLibxdf.loadXdfCalls = []
    }
}
