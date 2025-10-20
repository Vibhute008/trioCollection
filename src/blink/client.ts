import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'trio-collection-blink-ecommerce-m4ud4gtq',
  authRequired: false,
  auth: {
    mode: 'headless'
  }
})
