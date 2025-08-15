import { Controller, Get, Header } from '@nestjs/common';
import { DIGITAL_ASSET_LINKS_FINGERPRINT } from './constants';

// Serves the Digital Asset Links JSON at the root path
//   https://<domain>/.well-known/assetlinks.json
// This is required for Google Play domain verification.
@Controller('.well-known')
export class RootAssetLinksController {
  @Get('assetlinks.json')
  @Header('Content-Type', 'application/json')
  getAssetLinks() {
    return [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.advansistechnologies.lidapay',
          sha256_cert_fingerprints: [DIGITAL_ASSET_LINKS_FINGERPRINT],
        },
      },
    ];
  }
}
