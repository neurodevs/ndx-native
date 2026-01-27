import LabrecorderAdapter from '../impl/LabrecorderAdapter.js'

export async function startRecording() {
    console.log('Starting recording...')

    const adapter = LabrecorderAdapter.Create(
        '/opt/local/lib/liblabrecorder.dylib'
    )

    adapter.createRecording('test.xdf', [
        'type=EEG',
        'type=PPG',
        'type=markers',
    ])

    console.log('Recording started!')
}

startRecording().catch((err) => console.error('Error:', err))
