import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { IMidtrans } from '../../../domains/repositories/payment-gateway/IMidTrans';

@Injectable()
export class MidtransService implements IMidtrans{
  private snap: midtransClient.Snap;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }

  async createTransaction(orderId: string, userId: string, amount: number) {
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 75000,
      },
      customer_details: {
        user_id: userId,
      },
      item_details: [
        {
          id: 'sub-1',
          price: 75000 ,
          quantity: amount,
          name: '1-Month Subscription',
        },
      ],
    };

    return this.snap.createTransaction(transactionDetails);
  }
}