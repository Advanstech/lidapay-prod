export class InternetDto {
  readonly retailer?: string;
  userId?: string;
  userName?: string;
  readonly transType: string;
  amount?: string;
  readonly currentBalance: string;
  readonly recipientNumber: string;
  readonly dataCode: string;
  network?: number; // Made optional for dataBundleList
  readonly transId: string;
  readonly currency: string;
  readonly fee?: string;
  balance_before: string;
  balance_after: any;
}
