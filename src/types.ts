import { FuncObj, FieldType } from 'ffi-rs'

export type FfiRsDefineOptions = FuncObj<
    FieldType,
    boolean | undefined,
    boolean | undefined
>
