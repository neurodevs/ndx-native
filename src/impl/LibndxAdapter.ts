export default class LibndxAdapter implements Libndx {
    public static Class?: LibndxConstructor

    protected constructor() {}

    public static Create() {
        return new (this.Class ?? this)()
    }
}

export interface Libndx {}

export type LibndxConstructor = new () => Libndx
