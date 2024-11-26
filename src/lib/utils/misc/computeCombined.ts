/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
type Last<T extends readonly any[]> = T extends readonly [...infer _, infer L]
    ? L
    : never;

export function computeCombined<
    const T extends readonly ((...args: any[]) => any)[],
>(fns: T): ReturnType<Last<T>> {
    let args: any[] | undefined = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const func of fns) {
        if (args === undefined) {
            // @ts-expect-error it's fine
            return undefined;
        }

        if (Object.prototype.toString.call(args) !== "[object Array]") {
            args = [args];
        }

        args = func(...args);
    }

    return args as ReturnType<Last<T>>;
}
