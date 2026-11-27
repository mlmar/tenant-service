# Email adapters

Use the shared template with the transport assigned to each type of message.

## Contents

- [Transport selection](#transport-selection)
- [Verification](#verification)
- [Development delivery check](#development-delivery-check)

## Transport selection

Use Microsoft 365 OAuth SMTP for one-off delivery and Postmark for groups. Keep the transports separate. The starter exposes adapters for use cases to call explicitly. Templates generate HTML and plain text from the shared brand and supplied app URL.

## Verification

Run `npm test` from the root. Fake-provider tests cover transport routing, acceptance, failure, and retry behavior. Supply dedicated sender and reply-to addresses using the [provider guide](../../../docs/PROVIDERS.md#email).

## Development delivery check

Use a dedicated development transport and an approved fixture recipient. A live transport can deliver real mail. From the workspace root, build the backend with `npm --workspace backend run build`. Export `TEST_RECIPIENT` and `TEST_TRANSPORT` in the shell. Use `smtp` or `postmark` as the transport.

For Postmark, confirm the server type in the provider account. The token's server determines whether the message is routed to a real inbox. The existing `POSTMARK_DELIVERY_TYPE` env value has no effect on requests. For SMTP authentication alone, run the following command. A successful call confirms the connection and authentication.

```sh
node --env-file=backend/.env.local --input-type=module <<'JS'
import { SmtpEmailClient } from './backend/dist/email/smtp.js';
console.log(await new SmtpEmailClient().verify());
JS
```

To check message acceptance, run the send example below for the selected transport.

```sh
node --env-file=backend/.env.local --input-type=module <<'JS'
import { EmailClient } from './backend/dist/email/client.js';
import { SmtpEmailClient } from './backend/dist/email/smtp.js';
import { renderNotificationEmail } from './backend/dist/email/templates.js';

const { TEST_RECIPIENT, TEST_TRANSPORT } = process.env;
const clients = { smtp: new SmtpEmailClient(), postmark: new EmailClient() };
if (!TEST_RECIPIENT || !Object.hasOwn(clients, TEST_TRANSPORT)) {
  throw new Error('Select an approved fixture recipient and a transport.');
}
const message = renderNotificationEmail(
  { to: TEST_RECIPIENT, title: 'Delivery check', message: 'Development fixture.' },
  { appUrl: 'http://localhost:8081' },
);
console.log(await clients[TEST_TRANSPORT].send(message));
JS
```

- **Postmark Sandbox.** Expect an accepted result and a corresponding message in Postmark Activity. A sandbox message stops at Postmark even when Activity shows it as delivered. [Postmark sandbox behavior](https://postmarkapp.com/developer/user-guide/sandbox-mode/server-sandbox-mode)
- **Authorized live fixture.** After Postmark or SMTP accepts the message, check the approved inbox separately. Acceptance confirms that the transport took the message. The inbox check confirms receipt.
