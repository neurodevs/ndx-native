import generateId from '@neurodevs/generate-id'
import {
    MangledNameExtractor,
    FakeNameExtractor,
} from '@neurodevs/node-mangled-names'
import { test, assert } from '@neurodevs/node-tdd'
import { DataType, OpenParams } from 'ffi-rs'

import LibxdfAdapter, {
    LibxdfBindings,
    XdfFile,
} from '../../impl/LibxdfAdapter.js'
import { FfiRsDefineOptions } from 'types.js'
import SpyLibxdf from '../../testDoubles/Libxdf/SpyLibxdf.js'
import AbstractPackageTest from '../AbstractPackageTest.js'

export default class LibxdfTest extends AbstractPackageTest {
    private static instance: SpyLibxdf
    private static libxdfPath = generateId()
    private static path = generateId()
    private static shouldThrowWhenLoadingBindings: boolean
    private static mangledLoadXdfName: string
    private static fakeBindings: LibxdfBindings
    private static ffiRsOpenOptions?: OpenParams
    private static ffiRsDefineOptions?: FfiRsDefineOptions
    private static loadXdfCalls: string[][] = []

    protected static async beforeEach() {
        await super.beforeEach()

        LibxdfAdapter.Class = SpyLibxdf

        MangledNameExtractor.Class = FakeNameExtractor
        FakeNameExtractor.clearTestDouble()

        this.shouldThrowWhenLoadingBindings = false
        this.mangledLoadXdfName = this.generateMangledName()
        this.fakeBindings = this.FakeBindings()

        this.setFakeExtractResult()
        this.clearAndFakeFfi()

        this.instance = await this.LibxdfAdapter()
    }

    @test()
    protected static createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async throwsWhenBindingsFailToLoad() {
        this.shouldThrowWhenLoadingBindings = true

        const err = await assert.doesThrowAsync(
            async () => await this.LibxdfAdapter()
        )

        const actual = (err.message ?? err.stack).replace(/\s+/g, '')

        const expected = this.generateFailedMessageWithFakeError().replace(
            /\s+/g,
            ''
        )

        assert.isEqual(actual, expected, 'Did not receive the expected error!')
    }

    @test()
    protected static async callsFfiRsOpenWithRequiredOptions() {
        assert.isEqualDeep(this.ffiRsOpenOptions, {
            library: 'xdf',
            path: this.libxdfPath,
        })
    }

    @test()
    protected static async callsFfiRsDefineWithRequiredOptions() {
        const mangledLoadXdfName = generateId()
        this.setFakeExtractResult(mangledLoadXdfName)

        await this.LibxdfAdapter()

        assert.isEqualDeep(
            this.ffiRsDefineOptions,
            {
                [mangledLoadXdfName.slice(1)]: {
                    library: 'xdf',
                    retType: DataType.String,
                    paramsType: [DataType.String],
                },
            },
            'Did not pass valid options to ffiRsDefine!'
        )
    }

    @test()
    protected static async loadXdfCallsBindings() {
        this.loadXdf()

        assert.isEqualDeep(
            this.loadXdfCalls[0],
            [this.path],
            'Did not call load_xdf_to_json(path)!'
        )
    }

    @test()
    protected static async createsMangledNameExtractor() {
        assert.isEqual(FakeNameExtractor.numConstructorCalls, 1)
    }

    @test()
    protected static async callsExtractorWithCorrectParams() {
        assert.isEqualDeep(FakeNameExtractor.extractCalls[0], {
            libPath: this.libxdfPath,
            unmangledNames: [this.loadXdfName],
        })
    }

    @test()
    protected static async returnsResultInJson() {
        const result = this.loadXdf()
        assert.isEqualDeep(result, this.fakeParsedXdf)
    }

    @test()
    protected static async throwsIfLibxdfPathDoesNotExist() {
        this.libxdfPath = generateId()

        const err = await assert.doesThrowAsync(
            async () => await this.LibxdfAdapter(this.libxdfPath, true)
        )

        const actual = (err.message ?? err.stack).replace(/\s+/g, '')
        const expected = this.generateFailedMessage().replace(/\s+/g, '')

        assert.isEqual(actual, expected, 'Did not receive the expected error!')
    }

    @test()
    protected static async doesNotThrowIfEventsUndefined() {
        this.fakeSerializedXdf = `{"streams": [{"stream_id": ${this.fakeStreamId}, "time_series": [], "time_stamps": [], "stream_info": {"channel_count": ${this.fakeChannelCount}, "channel_format": "${this.fakeChannelFormat}", "nominal_srate": ${this.fakeNominalSampleRate}, "stream_name": "${this.fakeStreamName}", "stream_type": "${this.fakeStreamType}"}}]}`
        this.loadXdf()
    }

    private static setFakeExtractResult(
        mangledLoadXdfName = this.mangledLoadXdfName
    ) {
        FakeNameExtractor.fakeResult = {
            load_xdf_to_json: mangledLoadXdfName,
        }
    }

    private static generateMangledName() {
        return `${generateId()}${this.loadXdfName}${generateId()}`
    }

    private static clearAndFakeFfi() {
        delete this.ffiRsOpenOptions
        delete this.ffiRsDefineOptions
        this.fakeFfiRsOpen()
        this.fakeFfiRsDefine()
    }

    private static fakeFfiRsOpen() {
        LibxdfAdapter.ffiRsOpen = (options) => {
            this.ffiRsOpenOptions = options
        }
    }

    private static fakeFfiRsDefine() {
        LibxdfAdapter.ffiRsDefine = (options) => {
            this.ffiRsDefineOptions = options

            if (this.shouldThrowWhenLoadingBindings) {
                throw new Error(this.fakeErrorMessage)
            }

            return this.fakeBindings as any
        }
    }

    private static generateFailedMessage() {
        return `
			\n -----------------------------------
			\n Failed to load libxdf! Tried to load from: 
			\n     ${this.libxdfPath}
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

    private static generateFailedMessageWithFakeError() {
        return `
			\n -----------------------------------
			\n Failed to load libxdf! Tried to load from: 
			\n     ${this.libxdfPath}
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
            \n Error: ${this.fakeErrorMessage}
            \n
		`
    }

    private static loadXdf() {
        return this.instance.loadXdf(this.path)
    }

    private static readonly loadXdfName = 'load_xdf_to_json'

    private static readonly fakeStreamId = 0
    private static readonly fakeStreamName = generateId()
    private static readonly fakeStreamType = generateId()
    private static readonly fakeChannelCount = 0
    private static readonly fakeChannelFormat = generateId()
    private static readonly fakeNominalSampleRate = 0
    private static readonly fakeEventName = generateId()
    private static readonly fakeEventTimestamp = 0

    private static fakeSerializedXdf = `{"streams": [{"stream_id": ${this.fakeStreamId}, "time_series": [], "time_stamps": [], "stream_info": {"channel_count": ${this.fakeChannelCount}, "channel_format": "${this.fakeChannelFormat}", "nominal_srate": ${this.fakeNominalSampleRate}, "stream_name": "${this.fakeStreamName}", "stream_type": "${this.fakeStreamType}"}}], "events": [{"stream_id": ${this.fakeStreamId}, "event_name": "${this.fakeEventName}", "event_timestamp": ${this.fakeEventTimestamp}}]}`

    private static readonly fakeParsedXdf: XdfFile = {
        path: this.path,
        streams: [
            {
                id: this.fakeStreamId,
                name: this.fakeStreamName,
                type: this.fakeStreamType,
                channelCount: this.fakeChannelCount,
                channelFormat: this.fakeChannelFormat,
                nominalSampleRateHz: this.fakeNominalSampleRate,
                data: [],
                timestamps: [],
            },
        ],
        events: [
            {
                name: this.fakeEventName,
                timestamp: this.fakeEventTimestamp,
                streamId: this.fakeStreamId,
            },
        ],
    }

    private static FakeBindings(mangledLoadXdfName = this.mangledLoadXdfName) {
        return {
            [mangledLoadXdfName.slice(1)]: (path: string[]) => {
                this.loadXdfCalls.push(path)
                return this.fakeSerializedXdf
            },
        }
    }

    private static async LibxdfAdapter(
        libxdfPath?: string,
        throwIfPathNotExists = false
    ) {
        const libxdf = await LibxdfAdapter.Create(
            libxdfPath ?? this.libxdfPath,
            throwIfPathNotExists
        )
        return libxdf as SpyLibxdf
    }
}
