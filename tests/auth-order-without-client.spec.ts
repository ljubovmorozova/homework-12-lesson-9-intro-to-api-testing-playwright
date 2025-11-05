import { expect, test } from '@playwright/test'
import { LoginDTO } from './dto/LoginDTO'
import { OrderDTO } from './dto/OrderDTO'
import { StatusCodes } from 'http-status-codes'

const BASE_URL = 'https://backend.tallinn-learning.ee'

test('login and create order', async ({ request }) => {
  console.log('Requesting JWT...');
  const authResponse = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData()
  });

  expect(authResponse.status()).toBe(StatusCodes.OK);

  const jwt = await authResponse.text();

  console.log('Creating order...');
  const orderResponse = await request.post(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    data: OrderDTO.createOrderWithRandomData()
  });

  expect(orderResponse.status()).toBe(StatusCodes.OK);

  const orderJson = await orderResponse.json();
  const orderId = orderJson.id;

  console.log('Created order ID:', orderId);
  expect(orderId).toBeDefined();

  console.log('Getting orders...');
  const getOrdersResponse = await request.get(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });

  expect(getOrdersResponse.status()).toBe(StatusCodes.OK);

  const orders = await getOrdersResponse.json();
  console.log('Orders:', orders);

  expect(orders.length).toBeGreaterThan(0);
  expect(orders.some((o: any) => o.id === orderId)).toBeTruthy();
});

test('auth + create + delete order by ID', async ({ request }) => {
  const authResponse = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData()
  });

  expect(authResponse.status()).toBe(StatusCodes.OK);
  const jwt = await authResponse.text();

  const orderData: any = OrderDTO.createOrderWithRandomData();
  delete orderData.id;

  const createResp = await request.post(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    data: orderData,
  });
  expect(createResp.status()).toBe(StatusCodes.OK);

  const created = await createResp.json();
  const orderId = created.id;
  expect(orderId).toBeDefined();

  const deleteResp = await request.delete(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  expect(deleteResp.status()).toBe(StatusCodes.OK);

  const getResp = await request.get(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (getResp.status() === StatusCodes.OK) {
    const body = await getResp.text();
    expect(body === '' || body === 'null' || body === '{}').toBeTruthy();
  } else {
    expect(getResp.status()).toBe(StatusCodes.NOT_FOUND);
  }
});