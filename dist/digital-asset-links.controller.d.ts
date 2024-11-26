export declare class DigitalAssetLinksController {
    getAssetLinks(): {
        relation: string[];
        target: {
            namespace: string;
            package_name: string;
            sha256_cert_fingerprints: string[];
        };
    }[];
}
