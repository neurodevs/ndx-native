import {
    arrayConstructor,
    createPointer,
    DataType,
    define,
    freePointer,
    load,
    open,
    PointerType,
    unwrapPointer,
} from 'ffi-rs'

import { CHANNEL_FORMATS } from '../consts.js'
import handleLslError, { LslErrorCode } from '../lib/handleLslError.js'

export default class LiblslAdapter implements Liblsl {
    public static open = open
    public static define = define
    public static load = load
    public static alloc = Buffer.alloc
    public static freePointer = freePointer

    private static instance?: Liblsl

    private static readonly bytesPerFloat = 4
    private static readonly bytesPerDouble = 8
    private static readonly bytesPerI32 = 4

    public liblslPath: string
    private bindings!: LiblslBindings

    private readonly buffersByInlet = new Map<
        InletHandle,
        ReturnType<typeof LiblslAdapter.allocateInletBuffers>
    >()

    private readonly defaultMacOsPath = `/opt/homebrew/Cellar/lsl/1.16.2/lib/liblsl.1.16.2.dylib`
    private readonly unknownInletMessage = `\n\n Unknown inlet handle! \n\n Please pass one returned by createInlet that has not been destroyed. \n`

    private readonly maxChunkSize = 0
    private readonly shouldRecover = 1

    protected constructor() {
        this.liblslPath = process.env.LIBLSL_PATH ?? this.defaultMacOsPath
        this.tryToLoadBindings()
    }

    public static getInstance() {
        if (!this.instance) {
            this.setInstance(new this())
        }
        return this.instance!
    }

    public static setInstance(instance: Liblsl) {
        this.instance = instance
    }

    public static resetInstance() {
        delete this.instance
    }

    private tryToLoadBindings() {
        try {
            this.openLiblsl()
            this.defineBindings()
        } catch (error) {
            this.throwFailedToLoadLiblsl(error as Error)
        }
    }

    private openLiblsl() {
        this.open({
            library: 'lsl',
            path: this.liblslPath,
        })
    }

    private defineBindings() {
        this.bindings = this.define({
            lsl_local_clock: {
                library: 'lsl',
                retType: DataType.Double,
                paramsType: [],
            },
            lsl_create_streaminfo: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [
                    DataType.String,
                    DataType.String,
                    DataType.I32,
                    DataType.Double,
                    DataType.I32,
                    DataType.String,
                ],
            },
            lsl_destroy_streaminfo: {
                library: 'lsl',
                retType: DataType.Void,
                paramsType: [DataType.External],
            },
            lsl_create_outlet: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [DataType.External, DataType.I32, DataType.I32],
            },
            lsl_push_sample_ft: {
                library: 'lsl',
                retType: DataType.I32,
                paramsType: [
                    DataType.External,
                    DataType.FloatArray,
                    DataType.Double,
                ],
            },
            lsl_push_sample_strt: {
                library: 'lsl',
                retType: DataType.I32,
                paramsType: [
                    DataType.External,
                    DataType.StringArray,
                    DataType.Double,
                ],
            },
            lsl_destroy_outlet: {
                library: 'lsl',
                retType: DataType.Void,
                paramsType: [DataType.External],
            },
            lsl_create_inlet: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [
                    DataType.External,
                    DataType.I32,
                    DataType.I32,
                    DataType.I32,
                ],
            },
            lsl_inlet_flush: {
                library: 'lsl',
                retType: DataType.I32,
                paramsType: [DataType.External],
            },
            lsl_destroy_inlet: {
                library: 'lsl',
                retType: DataType.Void,
                paramsType: [DataType.External],
            },
            lsl_get_desc: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [DataType.External],
            },
            lsl_get_channel_count: {
                library: 'lsl',
                retType: DataType.I32,
                paramsType: [DataType.External],
            },
            lsl_append_child: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [DataType.External, DataType.String],
            },
            lsl_append_child_value: {
                library: 'lsl',
                retType: DataType.External,
                paramsType: [
                    DataType.External,
                    DataType.String,
                    DataType.String,
                ],
            },
        }) as LiblslBindings
    }

    private throwFailedToLoadLiblsl(error: Error) {
        throw new Error(
            `Loading the liblsl dylib failed! I tried to load it from ${this.liblslPath}.\n\n${error.message}\n\n`
        )
    }

    public localClock() {
        return this.bindings.lsl_local_clock([])
    }

    public createStreamInfo(options: CreateStreamInfoOptions) {
        const {
            name,
            type,
            sourceId,
            channelCount,
            channelFormat,
            sampleRateHz,
        } = options

        return this.bindings.lsl_create_streaminfo([
            name,
            type,
            channelCount,
            sampleRateHz,
            channelFormat,
            sourceId,
        ])
    }

    public appendChannelsToStreamInfo(
        options: AppendChannelsToStreamInfoOptions
    ) {
        const { infoHandle, channels } = options

        const description = this.bindings.lsl_get_desc([infoHandle])
        const parent = this.bindings.lsl_append_child([description, 'channels'])

        for (const channel of channels) {
            const child = this.bindings.lsl_append_child([parent, 'channel'])
            this.bindings.lsl_append_child_value([
                child,
                'label',
                channel.label,
            ])
            this.bindings.lsl_append_child_value([child, 'unit', channel.units])
            this.bindings.lsl_append_child_value([child, 'type', channel.type])
        }
    }

    public destroyStreamInfo(options: DestroyStreamInfoOptions) {
        const { infoHandle } = options
        this.bindings.lsl_destroy_streaminfo([infoHandle])
    }

    public resolveByProp(options: ResolveByPropOptions) {
        const { prop, value, minResults = 1, timeoutMs = 1000 } = options

        const maxResults = 1024
        const bytesPerPointer = 8

        const resultsBuffer = this.alloc(maxResults * bytesPerPointer)

        const resultsBufferPtr = unwrapPointer(
            createPointer({
                paramsType: [DataType.U8Array],
                paramsValue: [resultsBuffer],
            })
        )[0]

        const numResults = this.load({
            library: 'lsl',
            funcName: 'lsl_resolve_byprop',
            retType: DataType.I32,
            paramsType: [
                DataType.External,
                DataType.I32,
                DataType.String,
                DataType.String,
                DataType.I32,
                DataType.Double,
            ],
            paramsValue: [
                resultsBufferPtr,
                maxResults,
                prop,
                value,
                minResults,
                timeoutMs / 1000,
            ],
        })

        const handles: InfoHandle[] = []

        for (let i = 0; i < numResults; i++) {
            const handle = resultsBuffer.readBigUInt64LE(i * bytesPerPointer)

            if (handle !== 0n) {
                const handleRef = createPointer({
                    paramsType: [DataType.BigInt],
                    paramsValue: [handle],
                })

                const handlePtr = unwrapPointer(handleRef)[0]

                handles.push(handlePtr)
            }
        }

        return handles
    }

    public createOutlet(options: CreateOutletOptions) {
        const { infoHandle, chunkSize, maxBufferedMs } = options

        return this.bindings.lsl_create_outlet([
            infoHandle,
            chunkSize,
            maxBufferedMs / 1000,
        ])
    }

    public pushSampleFloatTimestamp(options: PushSampleFloatTimestampOptions) {
        const { outletHandle, sample, timestampSec } = options

        return this.bindings.lsl_push_sample_ft([
            outletHandle,
            sample,
            timestampSec,
        ])
    }

    public pushSampleStringTimestamp(
        options: PushSampleStringTimestampOptions
    ) {
        const { outletHandle, sample, timestampSec } = options

        return this.bindings.lsl_push_sample_strt([
            outletHandle,
            sample,
            timestampSec,
        ])
    }

    public destroyOutlet(options: DestroyOutletOptions) {
        const { outletHandle } = options
        this.bindings.lsl_destroy_outlet([outletHandle])
    }

    public createInlet(options: CreateInletOptions) {
        const { infoHandle, maxBufferedMs, chunkSize } = options

        const inletHandle = this.bindings.lsl_create_inlet([
            infoHandle,
            maxBufferedMs / 1000,
            this.maxChunkSize,
            this.shouldRecover,
        ])

        this.buffersByInlet.set(
            inletHandle,
            LiblslAdapter.allocateInletBuffers(
                this.getChannelCount({ infoHandle }),
                chunkSize
            )
        )

        return inletHandle
    }

    public getChannelCount(options: GetChannelCountOptions) {
        const { infoHandle } = options
        return this.bindings.lsl_get_channel_count([infoHandle])
    }

    public openStream(options: OpenStreamOptions) {
        const { inletHandle, timeoutMs } = options
        const { openStreamErrorCode } = this.buffersFor(inletHandle)

        this.load({
            library: 'lsl',
            funcName: 'lsl_open_stream',
            retType: DataType.Void,
            paramsType: [DataType.External, DataType.Double, DataType.External],
            paramsValue: [
                inletHandle,
                timeoutMs / 1000,
                openStreamErrorCode.ptr,
            ],
        })

        this.throwIfLslError(openStreamErrorCode.buffer)
    }

    private buffersFor(inletHandle: InletHandle) {
        const buffers = this.buffersByInlet.get(inletHandle)

        if (!buffers) {
            throw new Error(this.unknownInletMessage)
        }

        return buffers
    }

    private throwIfLslError(errorCode: Buffer) {
        handleLslError(errorCode.readInt32LE())
    }

    public closeStream(options: CloseStreamOptions) {
        const { inletHandle } = options

        this.load({
            library: 'lsl',
            funcName: 'lsl_close_stream',
            retType: DataType.Void,
            paramsType: [DataType.External],
            paramsValue: [inletHandle],
        })
    }

    public pullSample(options: PullSampleOptions) {
        const { inletHandle, timeoutMs } = options

        const { channelCount, samples, pullErrorCode } =
            this.buffersFor(inletHandle)

        const timestampSec = this.load({
            library: 'lsl',
            funcName: 'lsl_pull_sample_f',
            retType: DataType.Double,
            paramsType: [
                DataType.External,
                DataType.External,
                DataType.I32,
                DataType.Double,
                DataType.External,
            ],
            paramsValue: [
                inletHandle,
                samples.ptr,
                channelCount,
                timeoutMs / 1000,
                pullErrorCode.ptr,
            ],
        })

        this.throwIfLslError(pullErrorCode.buffer)

        return timestampSec > 0
            ? {
                  samples: this.readFloats(samples.buffer, channelCount),
                  timestamps: [timestampSec],
              }
            : undefined
    }

    private readFloats(buffer: Buffer, numValues: number) {
        return Array.from(
            new Float32Array(buffer.buffer, buffer.byteOffset, numValues)
        )
    }

    public pullChunk(options: PullChunkOptions) {
        const { inletHandle, timeoutMs } = options

        const { channelCount, chunkSize, samples, timestamps, pullErrorCode } =
            this.buffersFor(inletHandle)

        const numValues = Number(
            this.load({
                library: 'lsl',
                funcName: 'lsl_pull_chunk_f',
                retType: DataType.U64,
                paramsType: [
                    DataType.External,
                    DataType.External,
                    DataType.External,
                    DataType.U64,
                    DataType.U64,
                    DataType.Double,
                    DataType.External,
                ],
                paramsValue: [
                    inletHandle,
                    samples.ptr,
                    timestamps.ptr,
                    chunkSize * channelCount,
                    chunkSize,
                    timeoutMs / 1000,
                    pullErrorCode.ptr,
                ],
            })
        )

        this.throwIfLslError(pullErrorCode.buffer)

        return numValues > 0
            ? {
                  samples: this.readFloats(samples.buffer, numValues),
                  timestamps: this.readDoubles(
                      timestamps.buffer,
                      numValues / channelCount
                  ),
              }
            : undefined
    }

    private readDoubles(buffer: Buffer, numValues: number) {
        return Array.from(
            new Float64Array(buffer.buffer, buffer.byteOffset, numValues)
        )
    }

    public flushInlet(options: FlushInletOptions) {
        const { inletHandle } = options
        this.bindings.lsl_inlet_flush([inletHandle])
    }

    public destroyInlet(options: DestroyInletOptions) {
        const { inletHandle } = options

        this.bindings.lsl_destroy_inlet([inletHandle])
        this.freeInletBuffers(inletHandle)
    }

    private freeInletBuffers(inletHandle: InletHandle) {
        const buffers = this.buffersByInlet.get(inletHandle)

        if (!buffers) {
            return
        }

        const { samples, timestamps, pullErrorCode, openStreamErrorCode } =
            buffers

        const nativeBuffers = [
            samples,
            timestamps,
            pullErrorCode,
            openStreamErrorCode,
        ]

        this.freePointer({
            paramsType: nativeBuffers.map(({ buffer }) =>
                arrayConstructor({
                    type: DataType.U8Array,
                    length: buffer.length,
                })
            ),
            paramsValue: nativeBuffers.map(({ ref }) => ref),
            pointerType: PointerType.RsPointer,
        })

        this.buffersByInlet.delete(inletHandle)
    }

    private get open() {
        return LiblslAdapter.open
    }

    private get define() {
        return LiblslAdapter.define
    }

    private get load() {
        return LiblslAdapter.load
    }

    private get alloc() {
        return LiblslAdapter.alloc
    }

    private get freePointer() {
        return LiblslAdapter.freePointer
    }

    private static allocateInletBuffers(
        channelCount: number,
        chunkSize: number
    ) {
        return {
            channelCount,
            chunkSize,
            samples: this.allocateNativeBuffer(
                channelCount * chunkSize * this.bytesPerFloat
            ),
            timestamps: this.allocateNativeBuffer(
                chunkSize * this.bytesPerDouble
            ),
            pullErrorCode: this.allocateNativeBuffer(this.bytesPerI32),
            openStreamErrorCode: this.allocateNativeBuffer(this.bytesPerI32),
        }
    }

    private static allocateNativeBuffer(numBytes: number) {
        const buffer = this.alloc(numBytes)

        const [ref] = createPointer({
            paramsType: [DataType.U8Array],
            paramsValue: [buffer],
        })

        const [ptr] = unwrapPointer([ref])

        return { buffer, ref, ptr }
    }
}

export interface Liblsl {
    liblslPath: string

    localClock(): number

    createStreamInfo(options: CreateStreamInfoOptions): InfoHandle
    destroyStreamInfo(options: DestroyStreamInfoOptions): void
    appendChannelsToStreamInfo(options: AppendChannelsToStreamInfoOptions): void
    getChannelCount(options: GetChannelCountOptions): number

    resolveByProp(options: ResolveByPropOptions): InfoHandle[]

    createOutlet(options: CreateOutletOptions): OutletHandle

    pushSampleFloatTimestamp(
        options: PushSampleFloatTimestampOptions
    ): LslErrorCode

    pushSampleStringTimestamp(
        options: PushSampleStringTimestampOptions
    ): LslErrorCode

    destroyOutlet(options: DestroyOutletOptions): void

    createInlet(options: CreateInletOptions): InletHandle
    openStream(options: OpenStreamOptions): void
    closeStream(options: CloseStreamOptions): void
    pullSample(
        options: PullSampleOptions
    ): { samples: number[]; timestamps: number[] } | undefined

    pullChunk(
        options: PullChunkOptions
    ): { samples: number[]; timestamps: number[] } | undefined
    flushInlet(options: FlushInletOptions): void
    destroyInlet(options: DestroyInletOptions): void
}

export interface CreateStreamInfoOptions {
    name: string
    type: string
    sourceId: string
    channelCount: number
    channelFormat: number
    sampleRateHz: number
    manufacturer?: string
    units?: string
}

export interface AppendChannelsToStreamInfoOptions {
    infoHandle: InfoHandle
    channels: readonly LslChannel[]
}

export interface GetChannelCountOptions {
    infoHandle: InfoHandle
}

export interface DestroyStreamInfoOptions {
    infoHandle: InfoHandle
}

export interface ResolveByPropOptions {
    prop: string
    value: string
    minResults?: number
    timeoutMs?: number
}

export interface CreateOutletOptions {
    infoHandle: InfoHandle
    chunkSize: number
    maxBufferedMs: number
}

export interface PushSampleFloatTimestampOptions {
    outletHandle: OutletHandle
    sample: readonly number[]
    timestampSec: number
}

export interface PushSampleStringTimestampOptions {
    outletHandle: OutletHandle
    sample: readonly string[]
    timestampSec: number
}

export interface DestroyOutletOptions {
    outletHandle: OutletHandle
}

export interface CreateInletOptions {
    infoHandle: InfoHandle
    maxBufferedMs: number
    chunkSize: number
}

export interface OpenStreamOptions {
    inletHandle: InletHandle
    timeoutMs: number
}

export interface CloseStreamOptions {
    inletHandle: InletHandle
}

export interface PullSampleOptions {
    inletHandle: InletHandle
    timeoutMs: number
}

export interface PullChunkOptions {
    inletHandle: InletHandle
    timeoutMs: number
}

export interface FlushInletOptions {
    inletHandle: InletHandle
}

export interface DestroyInletOptions {
    inletHandle: InletHandle
}

export interface LiblslBindings {
    lsl_local_clock(args: []): number

    lsl_create_streaminfo(
        args: [string, string, number, number, number, string]
    ): InfoHandle

    lsl_get_desc(args: [InfoHandle]): DescriptionHandle
    lsl_get_channel_count(args: [InfoHandle]): number
    lsl_append_child(args: [DescriptionHandle, string]): ChildHandle
    lsl_append_child_value(args: [ChildHandle, string, string]): void
    lsl_destroy_streaminfo(args: [InfoHandle]): void

    lsl_create_outlet(args: [InfoHandle, number, number]): OutletHandle
    lsl_push_sample_ft(args: [OutletHandle, LslSample, number]): LslErrorCode
    lsl_push_sample_strt(args: [OutletHandle, LslSample, number]): LslErrorCode
    lsl_destroy_outlet(args: [OutletHandle]): void

    lsl_create_inlet(args: any): InletHandle
    lsl_inlet_flush(args: [InletHandle]): void
    lsl_destroy_inlet(args: any): void
}

export type ChannelFormat = (typeof CHANNEL_FORMATS)[number]

export interface LslChannel {
    label: string
    units: string
    type: string
}

export type LslSample = readonly (number | string | undefined)[]

export interface InfoHandle {}
export interface OutletHandle {}
export interface InletHandle {}
export interface DescriptionHandle {}
export interface ChildHandle {}
