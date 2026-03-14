import AbstractModuleTest from '@neurodevs/node-tdd'

export default abstract class AbstractPackageTest extends AbstractModuleTest {
    protected static readonly channelNames = [
        this.generateId(),
        this.generateId(),
        this.generateId(),
    ]

    protected static readonly channelCount = this.channelNames.length
    protected static readonly chunkSize = 2

    protected static readonly fakeErrorMessage = 'Fake error message!'

    protected static async beforeEach() {
        await super.beforeEach()
    }
}
