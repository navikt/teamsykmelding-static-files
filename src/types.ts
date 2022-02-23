export interface InMemFile {
    content: Buffer,
    contentType: string,
}

export type InMemFileCache = {
    [key: string]: InMemFile;
};
