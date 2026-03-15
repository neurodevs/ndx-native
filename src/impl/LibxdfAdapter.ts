import fs from 'fs'
import {
    MangledNameExtractor,
    MangledNameMap,
} from '@neurodevs/node-mangled-names'
import { DataType, define, open } from 'ffi-rs'

export default class LibxdfAdapter implements Libxdf {
    public static Class?: LibxdfConstructor
    public static ffiRsOpen = open
    public static ffiRsDefine = define
    private static readonly loadXdfName = 'load_xdf_to_json'
    private static unmangledNames = [this.loadXdfName]

    protected bindings!: LibxdfBindings
    private libxdfPath: string
    private mangledNameMap: MangledNameMap

    protected constructor(libxdfPath: string, mangledNameMap: MangledNameMap) {
        this.libxdfPath = libxdfPath
        this.mangledNameMap = mangledNameMap

        this.tryToLoadBindings()
    }

    public static async Create(
        libxdfPath: string,
        throwIfPathNotExists = true
    ) {
        if (throwIfPathNotExists && !fs.existsSync(libxdfPath)) {
            throw new Error(this.generateFailedMessage(libxdfPath))
        }

        const mangledNameMap = await this.loadMangledNameMap(libxdfPath)
        return new (this.Class ?? this)(libxdfPath, mangledNameMap)
    }

    private tryToLoadBindings() {
        try {
            this.openLibxdf()
            this.bindings = this.defineBindings()
        } catch (err: unknown) {
            this.throwFailedToLoadLiblsl(err)
        }
    }

    private openLibxdf() {
        this.ffiRsOpen({
            library: 'xdf',
            path: this.libxdfPath,
        })
    }

    private defineBindings() {
        const funcs = this.unmangledNames.reduce((acc, name) => {
            const mangledName = this.mangledNameMap[name].slice(1)

            // @ts-ignore
            acc[mangledName] = {
                library: 'xdf',
                retType: DataType.String,
                paramsType: [DataType.String],
            }
            return acc
        }, {})

        return this.ffiRsDefine(funcs)
    }

    private throwFailedToLoadLiblsl(err: unknown) {
        throw new Error(this.generateFailedMessage(err))
    }

    private generateFailedMessage(err: unknown) {
        return `
			${LibxdfAdapter.generateFailedMessage(this.libxdfPath)}
            \n ${err}
            \n
		`
    }

    public loadXdf(path: string) {
        const mangledName = this.mangledNameMap[this.loadXdfName].slice(1)
        const mangledFunc = this.bindings[mangledName]

        const serializedData = mangledFunc([path])
        const parsedData = JSON.parse(serializedData) as LibxdfFile

        if (!parsedData.events) {
            parsedData.events = []
        }

        const mappedStreams = parsedData.streams.map((stream) => ({
            id: stream.stream_id,
            name: stream.stream_info.stream_name,
            type: stream.stream_info.stream_type,
            channelCount: stream.stream_info.channel_count,
            channelFormat: stream.stream_info.channel_format,
            nominalSampleRateHz: stream.stream_info.nominal_srate,
            data: stream.time_series,
            timestamps: stream.time_stamps,
        }))

        const mappedEvents = parsedData.events.map((event) => ({
            name: event.event_name,
            timestamp: event.event_timestamp,
            streamId: event.stream_id,
        }))

        return {
            path,
            streams: mappedStreams,
            events: mappedEvents,
        }
    }

    private get unmangledNames() {
        return LibxdfAdapter.unmangledNames
    }

    private get loadXdfName() {
        return LibxdfAdapter.loadXdfName
    }

    private get ffiRsOpen() {
        return LibxdfAdapter.ffiRsOpen
    }

    private get ffiRsDefine() {
        return LibxdfAdapter.ffiRsDefine
    }

    private static generateFailedMessage(libxdfPath: string) {
        return `
			\n -----------------------------------
			\n Failed to load libxdf! Tried to load from: 
			\n     ${libxdfPath}
			\n Instructions to save your day (on MacOS):
			\n     1. git clone https://github.com/neurodevs/libxdf.git
			\n     2. cd libxdf && cmake -S . -B build && cmake --build build
			\n     3. sudo cp build/libxdf.dylib /opt/local/lib/
			\n     4. Try whatever you were doing again!
			\n Modify step 3 for your OS if you are not on MacOS.
			\n Check the official repo for OS-specific instructions:
			\n     https://github.com/xdf-modules/libxdf
			\n If you're still unsure, ask an LLM with this error and your OS. 
			\n You could also post an issue on the repo:
			\n     https://github.com/neurodevs/node-xdf/issues
			\n Good luck!
			\n @ericthecurious
			\n -----------------------------------
        `
    }

    private static async loadMangledNameMap(libxdfPath: string) {
        const extractor = this.MangledNameExtractor()
        return await extractor.extract(libxdfPath, this.unmangledNames)
    }

    private static MangledNameExtractor() {
        return MangledNameExtractor.Create()
    }
}

export interface Libxdf {
    loadXdf(path: string): XdfFile
}

export type LibxdfConstructor = new (
    libxdfPath: string,
    mangledNameMap: MangledNameMap
) => Libxdf

export type LibxdfBindings = Record<string, (path: string[]) => string>

export type LibxdfStatusCode = 0 | Exclude<number, 0>

export interface XdfFile {
    path: string
    streams: XdfStream[]
    events: XdfEvent[]
}

export interface XdfStream {
    id: number
    name: string
    type: string
    channelCount: number
    channelFormat: string
    nominalSampleRateHz: number
    data: number[][]
    timestamps: number[]
}

export interface XdfEvent {
    name: string
    timestamp: number
    streamId: number
}

export interface LibxdfFile {
    streams: LibxdfStream[]
    events: LibxdfEvent[]
}

export interface LibxdfStream {
    stream_id: number
    stream_info: LibxdfStreamInfo
    time_series: number[][]
    time_stamps: number[]
}

export interface LibxdfStreamInfo {
    channel_count: number
    channel_format: string
    nominal_srate: number
    stream_name: string
    stream_type: string
}

export interface LibxdfEvent {
    stream_id: number
    event_name: string
    event_timestamp: number
}
