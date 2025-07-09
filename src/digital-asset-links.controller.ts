import { Controller, Get, Header } from '@nestjs/common';

@Controller('api/v1/.well-known')
export class DigitalAssetLinksController {
  @Get('assetlinks.json')
  @Header('Content-Type', 'application/json')
  getAssetLinks() {
    return [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.advansistechnologies.lidapay', // Replace with your actual package name
          sha256_cert_fingerprints: [
            'YOUR_SHA256_FINGERPRINT', // We'll generate this
          ],
        },
      },
    ];
  }
}
