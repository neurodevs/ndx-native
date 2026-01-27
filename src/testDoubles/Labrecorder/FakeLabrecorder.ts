import { RecordingHandle, Labrecorder } from '../../impl/LabrecorderAdapter.js'

export default class FakeLabrecorder implements Labrecorder {
    public static constructorCalls: string[] = []

    public static createRecordingCalls: {
        filename: string
        watchFor: string[]
    }[] = []

    public static stopRecordingCalls: RecordingHandle[] = []
    public static deleteRecordingCalls: RecordingHandle[] = []

    public constructor(labrecorderPath: string) {
        FakeLabrecorder.constructorCalls.push(labrecorderPath)
    }

    public createRecording(filename: string, watchFor: string[]) {
        FakeLabrecorder.createRecordingCalls.push({ filename, watchFor })
        return {} as RecordingHandle
    }

    public stopRecording(recording: RecordingHandle) {
        FakeLabrecorder.stopRecordingCalls.push(recording)
    }

    public deleteRecording(recording: RecordingHandle) {
        FakeLabrecorder.deleteRecordingCalls.push(recording)
    }

    public static resetTestDouble() {
        this.constructorCalls = []
        this.createRecordingCalls = []
        this.stopRecordingCalls = []
        this.deleteRecordingCalls = []
    }
}
