import { DataType, define, open } from 'ffi-rs'

export default class LabrecorderAdapter implements Labrecorder {
    public static Class?: LabrecorderConstructor
    public static ffiRsOpen = open
    public static ffiRsDefine = define

    private labrecorderPath: string
    private bindings: LabrecorderBindings

    protected constructor(labrecorderPath: string) {
        this.labrecorderPath = labrecorderPath
        this.loadCppLibrary()

        this.bindings = this.defineBindingFunctions()
    }

    public static Create(labrecorderPath?: string) {
        const path = labrecorderPath ?? '/opt/local/lib/liblabrecorder.dylib'
        return new (this.Class ?? this)(path)
    }

    private loadCppLibrary() {
        this.ffiRsOpen({
            library: 'labrecorder',
            path: this.labrecorderPath,
        })
    }

    private defineBindingFunctions() {
        return this.ffiRsDefine(this.functions) as LabrecorderBindings
    }

    private get functions() {
        return {
            recording_create: {
                library: 'labrecorder',
                retType: DataType.External,
                paramsType: [
                    DataType.String,
                    DataType.StringArray,
                    DataType.U64,
                    DataType.StringArray,
                    DataType.StringArray,
                    DataType.U64,
                ],
            },
            recording_stop: {
                library: 'labrecorder',
                retType: DataType.Void,
                paramsType: [DataType.External],
            },
            recording_delete: {
                library: 'labrecorder',
                retType: DataType.Void,
                paramsType: [DataType.External],
            },
        }
    }

    public createRecording(
        filename: string,
        watchFor: readonly string[],
        info: RecordingInfo = {}
    ) {
        const entries = Object.entries(info)

        return this.bindings.recording_create([
            filename,
            watchFor,
            watchFor.length,
            entries.map(([key]) => key),
            entries.map(([, value]) => value),
            entries.length,
        ])
    }

    public stopRecording(recording: RecordingHandle) {
        this.bindings.recording_stop([recording])
    }

    public deleteRecording(recording: RecordingHandle) {
        this.bindings.recording_delete([recording])
    }

    private get ffiRsOpen() {
        return LabrecorderAdapter.ffiRsOpen
    }

    private get ffiRsDefine() {
        return LabrecorderAdapter.ffiRsDefine
    }
}

export interface Labrecorder {
    createRecording(
        filename: string,
        watchFor: readonly string[],
        info?: RecordingInfo
    ): RecordingHandle
    stopRecording(recording: RecordingHandle): void
    deleteRecording(recording: RecordingHandle): void
}

export type LabrecorderConstructor = new (
    labrecorderPath: string
) => Labrecorder

export interface LabrecorderBindings {
    recording_create(
        args: [string, readonly string[], number, string[], string[], number]
    ): RecordingHandle

    recording_stop(args: [RecordingHandle]): void
    recording_delete(args: [RecordingHandle]): void
}

export type RecordingHandle = DataType.External

export type RecordingInfo = Readonly<Record<string, string>>
