import { expect, test } from '@playwright/test'
import { ApiClient } from '../src/ApiClient'

test('login and create order with api client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const orderId = await apiClient.createOrderAndReturnOrderId()
  console.log('orderId:', orderId)
})

test('get orders with api client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const ordersBefore = await apiClient.getOrders()
  await apiClient.createOrderAndReturnOrderId()
  const ordersAfter = await apiClient.getOrders()

  expect(ordersBefore.length < ordersAfter.length).toBeTruthy()
})

test('login + create + delete order by ID (via api client)', async ({ request }) => {
  const api = await ApiClient.create(request)

  const orderId = await api.createOrderAndReturnOrderId()
  expect(orderId).toBeDefined()

  const delStatus = await api.deleteOrderById(orderId)
  expect(delStatus).toBe(200)

  const getAfterDelete = await api.getOrderById(orderId)
  if (getAfterDelete.status === 200) {
    expect(getAfterDelete.emptyBody === true).toBeTruthy()
  } else {
    expect(getAfterDelete.status).toBe(404)
  }
})
