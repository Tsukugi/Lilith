interface ExecuteOnlyOnDebugProps<T> {
    executable: (...args: unknown[]) => T;
    args: unknown[];
}

export const useLilithLog = (enabled: boolean) => {
    const executeOnlyOnDebug = <T>(props: ExecuteOnlyOnDebugProps<T>) => {
        if (enabled) return props.executable(...props.args);
        return null;
    };
    const messagePrefix = "LilithLog: ";
    const log = (...args: unknown[]) =>
        executeOnlyOnDebug({
            executable: () => console.log(messagePrefix, ...args),
            args,
        });
    const warn = (...args: unknown[]) =>
        executeOnlyOnDebug({
            executable: () => console.warn(messagePrefix, ...args),
            args,
        });
    const error = (...args: unknown[]) =>
        executeOnlyOnDebug({
            executable: () => console.error(messagePrefix, ...args),
            args,
        });

    return {
        log,
        warn,
        error,
    };
};
