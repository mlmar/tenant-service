import { clerkClient } from '@clerk/express';
import type { IdentityDirectory } from './ports.js';
export const identityDirectory: IdentityDirectory = { async getUser(userId) {
        const user = await clerkClient.users.getUser(userId);
        return { name: user.fullName ?? '', email: user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress ?? '' };
    } };
