declare module 'node-file-dialog' {
    export type DialogType = 'directory' | 'save-file' | 'open-file' | 'open-files';
    export default function askdialog(config: {type: DialogType}): Promise<string[]>;
}
