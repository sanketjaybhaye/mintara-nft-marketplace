export const resolveIpfs = (url) => {
    if (!url) return url;
    if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }
    return url;
};
